import Link from "next/link";
import { MedusaOrderImage } from "@/components/customer/medusa-order-image";
import type { CustomerClaimInfo } from "@/lib/customer/claim-status";
import type { CustomerOrder } from "@/lib/customer/orders";
import { getReturnToneClasses } from "@/lib/customer/return-request-visual";
import type { CustomerReturnLineItem } from "@/lib/customer/return-line-items";
import type { CustomerWithdrawalInfo } from "@/lib/customer/withdrawal-status";
import { formatDate, formatPrice } from "@/lib/format";

function ReturnCaseProductsList({ items }: { items: CustomerReturnLineItem[] }) {
	if (items.length === 0) return null;

	return (
		<div className="mt-2">
			<p className="text-sm text-foreground/80">
				{items.length === 1 ? "Dotyczy produktu:" : "Dotyczy produktów:"}
			</p>
			<ul className="mt-1 space-y-0.5 text-sm font-medium text-foreground">
				{items.map((item) => (
					<li key={item.orderLineItemId}>
						{item.productTitle}
						{item.quantity > 1 ? ` × ${item.quantity}` : ""}
					</li>
				))}
			</ul>
		</div>
	);
}

function ReturnCaseDates({
	submittedAt,
	acceptedAt,
	acceptedLabel,
}: {
	submittedAt: string;
	acceptedAt: string | null;
	acceptedLabel: string;
}) {
	return (
		<div className="mt-2 space-y-1 text-sm text-foreground/80">
			<p>
				Data złożenia wniosku:{" "}
				<span className="font-medium text-foreground">{formatDate(submittedAt)}</span>
			</p>
			{acceptedAt ? (
				<p>
					{acceptedLabel}:{" "}
					<span className="font-medium text-foreground">{formatDate(acceptedAt)}</span>
				</p>
			) : null}
		</div>
	);
}

export function ClaimsStatusPanel({ claims }: { claims: CustomerClaimInfo[] }) {
	if (claims.length === 0) return null;

	return (
		<div className="space-y-3">
			<p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
				Reklamacja na tym zamówieniu
			</p>
			{claims.map((claim) => {
				const tone = getReturnToneClasses(claim.status);
				return (
					<div key={claim.id} className={tone.panel} role="status">
						<p className="font-medium text-foreground">{claim.statusLabel}</p>
						{claim.referenceId ? (
							<p className="mt-1 text-foreground/80">
								Numer zgłoszenia:{" "}
								<span className="font-mono">{claim.referenceId}</span>
							</p>
						) : null}
						{claim.remedyLabel ? (
							<p className="mt-1 text-foreground/80">Żądanie: {claim.remedyLabel}</p>
						) : null}
						<ReturnCaseProductsList items={claim.items} />
						<ReturnCaseDates
							submittedAt={claim.createdAt}
							acceptedAt={claim.approvedAt}
							acceptedLabel="Data przyjęcia reklamacji"
						/>
						{claim.statusHint ? (
							<p className="mt-2 text-foreground/70">{claim.statusHint}</p>
						) : null}
					</div>
				);
			})}
		</div>
	);
}

export function WithdrawalsStatusPanel({
	withdrawals,
}: {
	withdrawals: CustomerWithdrawalInfo[];
}) {
	if (withdrawals.length === 0) return null;

	return (
		<div className="space-y-3">
			<p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
				Odstąpienie od umowy na tym zamówieniu
			</p>
			{withdrawals.map((w) => {
				const tone = getReturnToneClasses(w.status);
				return (
					<div key={w.id} className={tone.panel} role="status">
						<p className="font-medium text-foreground">{w.statusLabel}</p>
						<ReturnCaseProductsList items={w.items} />
						<ReturnCaseDates
							submittedAt={w.createdAt}
							acceptedAt={w.approvedAt}
							acceptedLabel="Data przyjęcia odstąpienia"
						/>
						{w.statusHint ? (
							<p className="mt-2 text-foreground/70">{w.statusHint}</p>
						) : null}
					</div>
				);
			})}
		</div>
	);
}

type CrossBlockProps = {
	title: string;
	body: string;
	linkHref: string;
	linkLabel: string;
};

type OrderCaseDetailsOrder = Pick<
	CustomerOrder,
	| "claims"
	| "withdrawals"
	| "items"
	| "activeClaim"
	| "activeWithdrawal"
>;

type OrderCaseDetailsVariant = "all" | "claim" | "withdrawal";

/** Szczegóły reklamacji / odstąpienia + lista produktów z oznaczeniami. */
export function OrderCaseDetailsSection({
	order,
	variant = "all",
}: {
	order: OrderCaseDetailsOrder;
	variant?: OrderCaseDetailsVariant;
}) {
	const claimedItemIds = new Set(order.claims.flatMap((c) => c.itemIds));
	const withdrawnItemIds = new Set(order.withdrawals.flatMap((w) => w.itemIds));
	const itemClaimTagClass = getReturnToneClasses(
		order.activeClaim?.status ?? order.claims[0]?.status ?? "pending_approval",
	).itemTag;
	const itemWithdrawalTagClass = getReturnToneClasses(
		order.activeWithdrawal?.status ??
			order.withdrawals[0]?.status ??
			"pending_approval",
	).itemTag;

	const showClaims = variant === "all" || variant === "claim";
	const showWithdrawals = variant === "all" || variant === "withdrawal";
	const affectedItemIds = new Set([
		...(showClaims ? claimedItemIds : []),
		...(showWithdrawals ? withdrawnItemIds : []),
	]);

	if (variant === "claim" && order.claims.length === 0) return null;
	if (variant === "withdrawal" && order.withdrawals.length === 0) return null;
	if (variant === "all" && order.claims.length === 0 && order.withdrawals.length === 0) {
		return null;
	}

	return (
		<div className="space-y-4">
			{showWithdrawals && order.withdrawals.length > 0 ? (
				<WithdrawalsStatusPanel withdrawals={order.withdrawals} />
			) : null}
			{showClaims && order.claims.length > 0 ? (
				<ClaimsStatusPanel claims={order.claims} />
			) : null}
			{affectedItemIds.size > 0 ? (
				<div>
					<p className="mb-3 text-sm font-medium">Produkty objęte sprawą</p>
					<div className="space-y-2">
						{order.items
							.filter((item) => affectedItemIds.has(item.id))
							.map((item) => (
								<div
									key={item.id}
									className="flex items-center gap-3 rounded-lg border border-border bg-muted/20 p-3"
								>
									{item.thumbnail ? (
										<MedusaOrderImage
											src={item.thumbnail}
											alt={item.title}
											width={48}
											height={48}
											className="size-12"
										/>
									) : null}
									<div className="min-w-0 flex-1">
										<p className="truncate text-sm font-medium">{item.title}</p>
										<p className="text-xs text-muted-foreground">
											{formatPrice(item.unitPrice)} × {item.quantity}
										</p>
									</div>
									<div className="flex shrink-0 flex-col items-end gap-1 sm:flex-row sm:items-center">
										{withdrawnItemIds.has(item.id) ? (
											<span className={itemWithdrawalTagClass}>W odstąpieniu</span>
										) : null}
										{claimedItemIds.has(item.id) ? (
											<span className={itemClaimTagClass}>W reklamacji</span>
										) : null}
									</div>
								</div>
							))}
					</div>
				</div>
			) : null}
		</div>
	);
}

/** Lista pozycji zamówienia z oznaczeniami „w reklamacji” / „w odstąpieniu”. */
export function OrderItemsWithCaseTags({
	order,
}: {
	order: OrderCaseDetailsOrder;
}) {
	const claimedItemIds = new Set(order.claims.flatMap((c) => c.itemIds));
	const withdrawnItemIds = new Set(order.withdrawals.flatMap((w) => w.itemIds));
	const itemClaimTagClass = getReturnToneClasses(
		order.activeClaim?.status ?? order.claims[0]?.status ?? "pending_approval",
	).itemTag;
	const itemWithdrawalTagClass = getReturnToneClasses(
		order.activeWithdrawal?.status ??
			order.withdrawals[0]?.status ??
			"pending_approval",
	).itemTag;

	return (
		<div>
			<p className="mb-3 text-sm font-medium">Produkty w zamówieniu</p>
			<div className="space-y-2">
				{order.items.map((item) => (
					<div
						key={item.id}
						className="flex items-center gap-3 rounded-lg border border-border bg-muted/20 p-3"
					>
						{item.thumbnail ? (
							<MedusaOrderImage
								src={item.thumbnail}
								alt={item.title}
								width={48}
								height={48}
								className="size-12"
							/>
						) : null}
						<div className="min-w-0 flex-1">
							<p className="truncate text-sm font-medium">{item.title}</p>
							<p className="text-xs text-muted-foreground">
								{formatPrice(item.unitPrice)} × {item.quantity}
							</p>
						</div>
						<div className="flex shrink-0 flex-col items-end gap-1 sm:flex-row sm:items-center">
							{withdrawnItemIds.has(item.id) ? (
								<span className={itemWithdrawalTagClass}>W odstąpieniu</span>
							) : null}
							{claimedItemIds.has(item.id) ? (
								<span className={itemClaimTagClass}>W reklamacji</span>
							) : null}
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

export function CrossRequestBlockNotice({
	title,
	body,
	linkHref,
	linkLabel,
}: CrossBlockProps) {
	return (
		<div
			role="status"
			className="rounded-lg border border-border bg-muted/50 px-4 py-3 text-sm"
		>
			<p className="font-medium text-foreground">{title}</p>
			<p className="mt-1 text-foreground/75">{body}</p>
			<Link
				href={linkHref}
				className="mt-2 inline-block text-sm font-medium text-terracotta underline-offset-4 hover:underline"
			>
				{linkLabel}
			</Link>
		</div>
	);
}
