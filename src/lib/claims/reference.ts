export function createClaimReference(): string {
	const ymd = new Date().toISOString().slice(0, 10).replace(/-/g, "");
	const suffix = crypto.randomUUID().replace(/-/g, "").slice(0, 6).toUpperCase();
	return `RK-${ymd}-${suffix}`;
}
