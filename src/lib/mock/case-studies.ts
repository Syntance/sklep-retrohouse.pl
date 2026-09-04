/**
 * Statystyki sekcji „Zaufanie" — prezentowane jako CEL SLA, nie zmierzona dana.
 *
 * Notion: „>15% z pageview" / „Średnia 12h" — w obu przypadkach to deklaracja
 * progu obsługi, nie historyczny pomiar. Etykieta `label` używa słowa „cel"
 * lub „gwarancja", żeby uniknąć ryzyka nieuczciwej praktyki rynkowej (UOKiK).
 */
export const B2B_STATS = [
	{ value: "≤ 24 h", label: "Gwarancja czasu odpowiedzi" },
	{ value: "14 dni", label: "Rezerwacja na prezentację" },
	{ value: "48 h", label: "Newsletter B2B przed sklepem" },
	{ value: "100%", label: "Pochodzenie z Wiednia" },
] as const;
