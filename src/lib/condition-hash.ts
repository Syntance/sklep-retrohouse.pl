/**
 * Pomocnicze narzędzie do obliczania hasha wersji opisu stanu produktu.
 *
 * Używane przy:
 *  - zapisie snapshotu do order line item (checkout step 4)
 *  - porównaniu wersji przy re-purchase
 *
 * W środowisku serwerowym i przeglądarkowym (SubtleCrypto jest wszędzie
 * w Next.js 16 / Edge Runtime).
 */

/**
 * Zwraca 8-znakowy hex SHA-256 z treści opisu stanu.
 * Deterministyczny — ta sama treść zawsze daje ten sam hash.
 */
export async function hashConditionDescription(text: string): Promise<string> {
	const encoder = new TextEncoder();
	const data = encoder.encode(text);
	const hashBuffer = await crypto.subtle.digest("SHA-256", data);
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	return hashArray
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("")
		.slice(0, 8);
}

/**
 * Synchroniczna wersja na bazie djb2 (checksum, nie kryptograficzny).
 * Używaj tylko gdy nie możesz użyć async (np. w render RSC bez await).
 */
export function hashConditionDescriptionSync(text: string): string {
	let hash = 5381;
	for (let i = 0; i < text.length; i++) {
		hash = ((hash << 5) + hash) ^ text.charCodeAt(i);
		hash = hash >>> 0;
	}
	return hash.toString(16).padStart(8, "0");
}
