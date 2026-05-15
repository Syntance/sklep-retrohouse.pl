export type CaseStudy = {
	slug: string;
	title: string;
	studio: string;
	city: string;
	summary: string;
	hue: string;
	/** Slug artykułu na blogu, do którego prowadzi karta (lead nurturing). */
	articleSlug: string;
};

/**
 * Realizacje studiów partnerskich.
 *
 * Strategia (Notion): „Logo studiów partnerskich (gdy pojawią się — na start
 * można pominąć)". Lista pusta do momentu zebrania pierwszych referencji
 * z prawdziwym mood boardem i zgodą na publikację.
 *
 * Konsumenci listy (page.tsx, sitemap, blog) muszą obsługiwać `length === 0`.
 */
export const CASE_STUDIES: CaseStudy[] = [];

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
