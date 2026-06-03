import type { CustomerOrder } from "@/lib/customer/orders";
import { MedusaOrderImage } from "@/components/customer/medusa-order-image";
import {
	BADGE_TONE_CLASS,
	fulfillmentStatusBadge,
	paymentStatusBadge,
} from "@/lib/admin/order-status";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/format";

function StatusRow({ label, value }: { label: string; value: string }) {
	return (
		<div className="flex flex-wrap justify-between gap-x-4 gap-y-1 text-sm">
			<span className="text-muted-foreground">{label}</span>
			<span className="font-medium text-foreground">{value}</span>
		</div>
	);
}

function InlineStatusBadge({
	label,
	tone,
}: {
	label: string;
	tone: keyof typeof BADGE_TONE_CLASS;
}) {
	return (
		<span
			className={cn(
				"inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
				BADGE_TONE_CLASS[tone],
			)}
		>
			{label}
		</span>
	);
}

function formatShippingCost(shippingTotal: number): string {
	return shippingTotal === 0 ? "0 zł (gratis)" : formatPrice(shippingTotal);
}

export function OrderCustomerDetailsSection({ order }: { order: CustomerOrder }) {
	const payment = paymentStatusBadge(order.paymentStatus);
	const fulfillment = fulfillmentStatusBadge(
		order.fulfillmentStatus,
		order.orderStatus,
	);
	const shippingCost = formatShippingCost(order.shippingTotal);

	return (
		<div className="space-y-4">
			<p className="text-sm font-medium text-foreground">Szczegóły zamówienia</p>
			<div className="space-y-2 rounded-lg border border-border bg-muted/20 px-4 py-3">
				<div className="flex flex-wrap items-center justify-between gap-2 text-sm">
					<span className="text-muted-foreground">Płatność</span>
					<div className="flex flex-wrap items-center justify-end gap-2">
						<InlineStatusBadge label={payment.label} tone={payment.tone} />
						{order.paymentMethodLabel ? (
							<span className="font-medium text-foreground">{order.paymentMethodLabel}</span>
						) : null}
					</div>
				</div>
				<div className="flex flex-wrap items-center justify-between gap-2 text-sm">
					<span className="text-muted-foreground">Wysyłka</span>
					<div className="flex flex-wrap items-center justify-end gap-2">
						<InlineStatusBadge label={fulfillment.label} tone={fulfillment.tone} />
						<span className="font-medium tabular-nums text-foreground">{shippingCost}</span>
					</div>
				</div>
				{order.deliveredAt ? (
					<StatusRow
						label="Dostarczono"
						value={new Date(order.deliveredAt).toLocaleDateString("pl-PL", {
							day: "numeric",
							month: "long",
							year: "numeric",
						})}
					/>
				) : null}
				<StatusRow label="Wartość" value={formatPrice(order.total)} />
			</div>
			<div>
				<p className="mb-3 text-sm font-medium text-foreground">Produkty</p>
				<ul className="space-y-2">
					{order.items.map((item) => (
						<li
							key={item.id}
							className="flex items-center gap-3 rounded-lg border border-border p-3"
						>
							{item.thumbnail ? (
								<MedusaOrderImage
									src={item.thumbnail}
									alt={item.title}
									width={48}
									height={48}
									className="size-12"
								/>
							) : (
								<div
									className="flex size-12 shrink-0 items-center justify-center rounded border border-border bg-muted text-xs text-muted-foreground"
									aria-hidden
								>
									—
								</div>
							)}
							<div className="min-w-0 flex-1">
								<p className="truncate text-sm font-medium">{item.title}</p>
								<p className="text-xs text-muted-foreground">
									{formatPrice(item.unitPrice)} × {item.quantity}
								</p>
							</div>
							<p className="shrink-0 text-sm font-medium tabular-nums">
								{formatPrice(
									Number.isFinite(item.lineTotal)
										? item.lineTotal
										: item.unitPrice * item.quantity,
								)}
							</p>
						</li>
					))}
				</ul>
			</div>
		</div>
	);
}
