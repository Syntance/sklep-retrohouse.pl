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

function normalizePath(raw: string): string | null {
	if (!raw.startsWith("/")) return null;
	// Ucinamy query i hash — tam trafiają tokeny, e-maile, parametry kampanii.
	const path = raw.split(/[?#]/)[0] ?? "";
	if (!path.startsWith("/") || path.length > 200) return null;
	if (path.startsWith("/magazyn") || path.startsWith("/api")) return null;
	return path;
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
	if (!rateLimit(`track-hit:${ip}`, 60, 60_000).ok) {
		return NextResponse.json({ ok: false }, { status: 429 });
	}

	await recordHit(path, new Date());
	return NextResponse.json({ ok: true });
}
