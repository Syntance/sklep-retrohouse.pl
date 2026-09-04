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
 * Hash wersji opisu stanu na bazie djb2 (checksum, nie kryptograficzny).
 * Synchroniczny — działa też w render RSC bez await.
 */
export function hashConditionDescriptionSync(text: string): string {
	let hash = 5381;
	for (let i = 0; i < text.length; i++) {
		hash = ((hash << 5) + hash) ^ text.charCodeAt(i);
		hash = hash >>> 0;
	}
	return hash.toString(16).padStart(8, "0");
}
