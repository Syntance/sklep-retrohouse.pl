import { NextResponse } from "next/server";
import { z } from "zod";
import { recordHit } from "@/lib/analytics/raw-hits";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

/**
 * POST /api/track-hit — licznik surowych wejść (agregat, bez PII i bez cookies).
 * Zapisujemy WYŁĄCZNIE znormalizowaną ścieżkę; query string i fragmenty odpadają,
 * żeby nie wciągnąć danych osobowych z parametrów URL.
 */
const bodySchema = z.object({
	path: z.string().trim().min(1).max(512),
});

/**
 * Segmenty dynamiczne zwijamy do kształtu trasy (`/sklep/:slug`), zamiast
 * zapisywać konkretny slug.
 *
 * Endpoint jest publiczny, a licznik to hash w Redisie trzymany 400 dni — bez
 * tego ktoś mógłby wpisać dowolnie wiele różnych ścieżek i rozdmuchać pamięć.
 * Liczba kluczy jest teraz ograniczona liczbą kształtów tras, nie ruchem.
 */
const DYNAMIC_PREFIXES = ["/sklep", "/blog", "/produkt", "/kategoria"];

function normalizePath(raw: string): string | null {
	if (!raw.startsWith("/")) return null;
	// Ucinamy query i hash — tam trafiają tokeny, e-maile, parametry kampanii.
	const path = (raw.split(/[?#]/)[0] ?? "").replace(/\/+$/, "") || "/";
	if (!path.startsWith("/") || path.length > 200) return null;
	if (path.includes("..") || path.includes("//")) return null;
	if (path.startsWith("/magazyn") || path.startsWith("/api")) return null;

	const segments = path.split("/").filter(Boolean);
	if (segments.length === 0) return "/";
	if (segments.length > 4) return "/inne";

	const head = `/${segments[0]}`;
	if (DYNAMIC_PREFIXES.includes(head)) {
		return segments.length > 1 ? `${head}/:slug` : head;
	}
	// Statyczne trasy zapisujemy dokładnie, ale tylko jednopoziomowe —
	// głębsze nieznane ścieżki lądują w jednym koszu.
	return segments.length === 1 ? head : "/inne";
}

export async function POST(request: Request) {
	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return NextResponse.json({ ok: false }, { status: 400 });
	}

	const parsed = bodySchema.safeParse(body);
	if (!parsed.success) return NextResponse.json({ ok: false }, { status: 400 });

	const path = normalizePath(parsed.data.path);
	if (!path) return NextResponse.json({ ok: false }, { status: 400 });

	// Anti-flood: licznik jest publiczny, więc ograniczamy zapisy per IP.
	const ip =
		request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
		request.headers.get("x-real-ip")?.trim() ||
		"anonymous";
	if (!rateLimit(`track-hit:${ip}`, 20, 60_000).ok) {
		return NextResponse.json({ ok: false }, { status: 429 });
	}

	await recordHit(path, new Date());
	return NextResponse.json({ ok: true });
}
