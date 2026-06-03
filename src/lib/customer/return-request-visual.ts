import type { ReturnStatus } from "@/lib/admin/return-types";

export type ReturnVisualTone = "success" | "pending" | "muted" | "destructive";

export function getReturnVisualTone(status: ReturnStatus): ReturnVisualTone {
	if (status === "approved") return "success";
	if (status === "rejected") return "destructive";
	if (
		status === "pending_approval" ||
		status === "shipped" ||
		status === "received"
	) {
		return "pending";
	}
	return "muted";
}

const TONE_CLASSES: Record<
	ReturnVisualTone,
	{ badge: string; panel: string; itemTag: string }
> = {
	success: {
		badge:
			"inline-flex shrink-0 items-center rounded-full bg-success/15 px-2.5 py-0.5 text-xs font-medium text-success",
		panel: "rounded-lg border border-success/35 bg-success/10 px-4 py-3 text-sm",
		itemTag:
			"shrink-0 rounded-full bg-success/15 px-2 py-0.5 text-xs font-medium text-success",
	},
	pending: {
		badge:
			"inline-flex shrink-0 items-center rounded-full bg-terracotta/15 px-2.5 py-0.5 text-xs font-medium text-terracotta",
		panel: "rounded-lg border border-terracotta/35 bg-terracotta/10 px-4 py-3 text-sm",
		itemTag:
			"shrink-0 rounded-full bg-terracotta/15 px-2 py-0.5 text-xs font-medium text-terracotta",
	},
	muted: {
		badge:
			"inline-flex shrink-0 items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground",
		panel: "rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm",
		itemTag:
			"shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground",
	},
	destructive: {
		badge:
			"inline-flex shrink-0 items-center rounded-full bg-destructive/15 px-2.5 py-0.5 text-xs font-medium text-destructive",
		panel: "rounded-lg border border-destructive/35 bg-destructive/10 px-4 py-3 text-sm",
		itemTag:
			"shrink-0 rounded-full bg-destructive/15 px-2 py-0.5 text-xs font-medium text-destructive",
	},
};

export function getReturnToneClasses(status: ReturnStatus) {
	return TONE_CLASSES[getReturnVisualTone(status)];
}

/** Badge: reklamacja lub odstąpienie jest możliwe (termin nie upłynął). */
export const availableActionBadgeClass =
	"inline-flex shrink-0 items-center rounded-full bg-orange/15 px-2.5 py-0.5 text-xs font-medium text-orange";

type OrderWithActiveCase = {
	activeClaim: { status: ReturnStatus; statusLabel: string } | null;
	activeWithdrawal: { status: ReturnStatus; statusLabel: string } | null;
};

/** Badge na karcie zamówienia — tylko trwająca reklamacja lub odstąpienie. */
export function getActiveCaseOrderBadge(
	order: OrderWithActiveCase,
): { label: string; className: string } | null {
	if (order.activeClaim) {
		return {
			label: order.activeClaim.statusLabel,
			className: getReturnToneClasses(order.activeClaim.status).badge,
		};
	}
	if (order.activeWithdrawal) {
		return {
			label: order.activeWithdrawal.statusLabel,
			className: getReturnToneClasses(order.activeWithdrawal.status).badge,
		};
	}
	return null;
}

/** Zakładka Reklamacje — aktywna sprawa lub możliwość + pozostały czas. */
export function getClaimTabOrderBadge(order: {
	activeClaim: OrderWithActiveCase["activeClaim"];
	activeWithdrawal: OrderWithActiveCase["activeWithdrawal"];
	canClaim: boolean;
	daysLeftToClaim: number;
}): { label: string; className: string } | null {
	const active = getActiveCaseOrderBadge(order);
	if (active) return active;
	if (order.canClaim && !order.activeClaim && !order.activeWithdrawal) {
		return {
			label: `Możliwa reklamacja (${order.daysLeftToClaim} ${order.daysLeftToClaim === 1 ? "dzień" : "dni"})`,
			className: availableActionBadgeClass,
		};
	}
	return null;
}

/** Zakładka Zwroty — aktywna sprawa lub możliwość odstąpienia + pozostały czas. */
export function getWithdrawalTabOrderBadge(order: {
	activeClaim: OrderWithActiveCase["activeClaim"];
	activeWithdrawal: OrderWithActiveCase["activeWithdrawal"];
	canReturn: boolean;
	daysLeftToReturn: number;
}): { label: string; className: string } | null {
	const active = getActiveCaseOrderBadge(order);
	if (active) return active;
	if (order.canReturn && !order.activeClaim && !order.activeWithdrawal) {
		return {
			label: `Możesz odstąpić (${order.daysLeftToReturn} ${order.daysLeftToReturn === 1 ? "dzień" : "dni"})`,
			className: availableActionBadgeClass,
		};
	}
	return null;
}
