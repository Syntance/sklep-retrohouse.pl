import "server-only";

/**
 * Surowe wejścia na stronę — liczniki agregowane, niezależne od zgody na
 * cookies (nie zapisujemy żadnego identyfikatora użytkownika, tylko licznik
 * dzienny i licznik per ścieżka).
 *
 * Wersja z lumine czytała custom endpoint backendu Medusy
 * (`/admin/custom/raw-hits`). To repo jest samym storefrontem — nie ma backendu
 * ani tego endpointu — więc liczniki trzymamy w Upstash Redis, który jest już
 * podpięty pod rate-limit logowania.
 *
 * Brak konfiguracji Upstash = funkcja wyłączona (zero błędów, zero zapisów).
 */

const DAY_KEY = (date: string) => `hits:day:${date}`;
const PATHS_KEY = (date: string) => `hits:paths:${date}`;
const SINCE_KEY = "hits:since";
/** 400 dni — liczniki same wygasają, nie rosną w nieskończoność. */
const TTL_SECONDS = 400 * 24 * 60 * 60;

export type RawHitsDaily = { date: string; hits: number };
export type RawHitsPath = { path: string; hits: number };

export type RawHitsData =
	| {
			status: "connected";
			totalHits: number;
			trackingSince: string | null;
			daily: RawHitsDaily[];
			topPaths: RawHitsPath[];
	  }
	| { status: "disabled" }
	| { status: "error"; reason: string };

function upstashConfig(): { url: string; token: string } | null {
	const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
	const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
	return url && token ? { url, token } : null;
}

export function isRawHitsEnabled(): boolean {
	return upstashConfig() !== null;
}

async function pipeline(commands: Array<Array<string>>): Promise<Array<{ result?: unknown }>> {
	const config = upstashConfig();
	if (!config) return [];

	const res = await fetch(`${config.url}/pipeline`, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${config.token}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify(commands),
		signal: AbortSignal.timeout(5000),
		cache: "no-store",
	});
	if (!res.ok) throw new Error(`Upstash ${res.status}`);
	return (await res.json()) as Array<{ result?: unknown }>;
}

export function toIsoDate(date: Date): string {
	return date.toISOString().slice(0, 10);
}

/** Lista dat [from..to] włącznie — dziury w danych pokazujemy jako 0, nie jako brak. */
export function dateRange(from: Date, to: Date): string[] {
	const out: string[] = [];
	const cursor = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate()));
	const end = Date.UTC(to.getUTCFullYear(), to.getUTCMonth(), to.getUTCDate());
	while (cursor.getTime() <= end) {
		out.push(toIsoDate(cursor));
		cursor.setUTCDate(cursor.getUTCDate() + 1);
	}
	return out;
}

/** Zapis wejścia. Best-effort — nigdy nie rzuca, nigdy nie blokuje odpowiedzi. */
export async function recordHit(path: string, now: Date): Promise<void> {
	if (!upstashConfig()) return;
	const date = toIsoDate(now);

	try {
		await pipeline([
			["INCR", DAY_KEY(date)],
			["EXPIRE", DAY_KEY(date), String(TTL_SECONDS)],
			["HINCRBY", PATHS_KEY(date), path, "1"],
			["EXPIRE", PATHS_KEY(date), String(TTL_SECONDS)],
			["SETNX", SINCE_KEY, date],
		]);
	} catch {
		/* telemetria nie może psuć ruchu */
	}
}

export async function fetchRawHits(from: Date, to: Date): Promise<RawHitsData> {
	if (!upstashConfig()) return { status: "disabled" };

	const dates = dateRange(from, to);
	if (dates.length === 0) {
		return { status: "connected", totalHits: 0, trackingSince: null, daily: [], topPaths: [] };
	}

	try {
		const commands: Array<Array<string>> = [
			["GET", SINCE_KEY],
			...dates.map((date) => ["GET", DAY_KEY(date)]),
			...dates.map((date) => ["HGETALL", PATHS_KEY(date)]),
		];
		const rows = await pipeline(commands);

		const since = typeof rows[0]?.result === "string" ? (rows[0].result as string) : null;

		const daily: RawHitsDaily[] = dates.map((date, index) => ({
			date,
			hits: Number(rows[1 + index]?.result ?? 0) || 0,
		}));

		const pathTotals = new Map<string, number>();
		for (let index = 0; index < dates.length; index++) {
			const raw = rows[1 + dates.length + index]?.result;
			// Upstash zwraca HGETALL jako płaską tablicę [field, value, ...].
			if (!Array.isArray(raw)) continue;
			for (let i = 0; i + 1 < raw.length; i += 2) {
				const path = String(raw[i]);
				const count = Number(raw[i + 1]) || 0;
				pathTotals.set(path, (pathTotals.get(path) ?? 0) + count);
			}
		}

		const topPaths = [...pathTotals.entries()]
			.map(([path, hits]) => ({ path, hits }))
			.sort((a, b) => b.hits - a.hits)
			.slice(0, 20);

		return {
			status: "connected",
			totalHits: daily.reduce((sum, day) => sum + day.hits, 0),
			trackingSince: since,
			daily,
			topPaths,
		};
	} catch (error) {
		return {
			status: "error",
			reason: error instanceof Error ? error.message : "Nie udało się pobrać surowych wejść.",
		};
	}
}
