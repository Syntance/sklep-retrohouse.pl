import { env } from "@/env";

/**
 * /api/live.ics — generator pliku .ics (RFC 5545 minimal).
 *
 * Zwraca 410 Gone gdy `NEXT_PUBLIC_LIVE_SCHEDULED=false` lub brak DATE
 * — żeby kalendarz nie zaśmiecał się "starymi" eventami po skończonym live.
 */

export const dynamic = "force-dynamic";

export function GET(): Response {
	if (!env.NEXT_PUBLIC_LIVE_SCHEDULED || !env.NEXT_PUBLIC_LIVE_DATE) {
		return new Response("Live nie jest aktualnie zaplanowany.", { status: 410 });
	}

	const start = new Date(env.NEXT_PUBLIC_LIVE_DATE);
	if (Number.isNaN(start.getTime())) {
		return new Response("Nieprawidłowa data live.", { status: 500 });
	}

	const end = new Date(start.getTime() + 90 * 60 * 1000);
	const title = env.NEXT_PUBLIC_LIVE_DROP_TITLE ?? "Live drop · RetroHouse";
	const url = `${env.NEXT_PUBLIC_SITE_URL}/`;
	const uid = `live-${start.getTime()}@retrohouse`;

	const body = [
		"BEGIN:VCALENDAR",
		"VERSION:2.0",
		"PRODID:-//RetroHouse//Live Drop//PL",
		"CALSCALE:GREGORIAN",
		"METHOD:PUBLISH",
		"BEGIN:VEVENT",
		`UID:${uid}`,
		`DTSTAMP:${formatIcs(new Date())}`,
		`DTSTART:${formatIcs(start)}`,
		`DTEND:${formatIcs(end)}`,
		`SUMMARY:${escapeIcs(title)}`,
		`DESCRIPTION:${escapeIcs("Transmisja na żywo z magazynu w Nowym Targu. Nowe antyki z Wiednia.")}`,
		`URL:${escapeIcs(url)}`,
		"END:VEVENT",
		"END:VCALENDAR",
	].join("\r\n");

	return new Response(body, {
		status: 200,
		headers: {
			"Content-Type": "text/calendar; charset=utf-8",
			"Content-Disposition": 'attachment; filename="retrohouse-live.ics"',
			"Cache-Control": "public, max-age=3600",
		},
	});
}

function formatIcs(date: Date): string {
	return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function escapeIcs(value: string): string {
	return value.replace(/\\/g, "\\\\").replace(/,/g, "\\,").replace(/;/g, "\\;").replace(/\n/g, "\\n");
}
