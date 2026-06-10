const POSTAL_CACHE = new Map<string, string>();

export async function lookupCity(postalCode: string): Promise<string | null> {
	const cleaned = postalCode.replace(/\s|-/g, "");
	if (!/^\d{5}$/.test(cleaned)) return null;

	if (POSTAL_CACHE.has(cleaned)) {
		return POSTAL_CACHE.get(cleaned) ?? null;
	}

	try {
		// TODO: Integracja z API GUS lub poczta.pl
		return null;
	} catch {
		return null;
	}
}
