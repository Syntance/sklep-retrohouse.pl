/** Generuj idempotency key per submission. */
export function generateIdempotencyKey(): string {
	return crypto.randomUUID();
}

/** Cache w sessionStorage dla retry tego samego koszyka. */
export function getOrCreateIdempotencyKey(cartKey: string): string {
	const storageKey = `idempotency-${cartKey}`;

	try {
		const cached = sessionStorage.getItem(storageKey);
		if (cached) return cached;

		const key = generateIdempotencyKey();
		sessionStorage.setItem(storageKey, key);
		return key;
	} catch {
		return generateIdempotencyKey();
	}
}

export function clearIdempotencyKey(cartKey: string): void {
	try {
		sessionStorage.removeItem(`idempotency-${cartKey}`);
	} catch {
		// Ignore — prywatny tryb / blokada storage
	}
}
