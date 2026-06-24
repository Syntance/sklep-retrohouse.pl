/**
 * Medusa store.metadata values may be JSON strings or already-parsed objects.
 * Always normalize through this helper before JSON.parse / schema validation.
 */
export function parseStoreMetadataJson<T = unknown>(raw: unknown): T | null {
	if (raw == null) return null;
	if (typeof raw === "string") {
		if (!raw.trim()) return null;
		try {
			return JSON.parse(raw) as T;
		} catch {
			return null;
		}
	}
	if (typeof raw === "object") {
		return raw as T;
	}
	return null;
}
