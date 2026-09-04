import type { ReturnStatus } from "@/lib/admin/return-types";

/** Wniosek w toku — blokuje drugi typ (reklamacja ↔ odstąpienie) na tym samym zamówieniu. */
const ACTIVE_RETURN_STATUSES: ReadonlySet<ReturnStatus> = new Set([
	"pending_approval",
	"approved",
	"shipped",
	"received",
]);

export function isActiveReturnStatus(status: ReturnStatus): boolean {
	return ACTIVE_RETURN_STATUSES.has(status);
}
