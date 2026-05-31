import { Inbox } from "lucide-react";
import { loadAdmin } from "@/lib/admin/load";
import {
	BADGE_TONE_CLASS,
	fulfillmentStatusBadge,
	orderStatusBadge,
	paymentStatusBadge,
} from "@/lib/admin/order-status";
import { type AdminOrderRow, listAdminOrders } from "@/lib/admin/orders";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import { OrderTableRow } from "./order-table-row";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const DATE_TIME = new Intl.DateTimeFormat("pl-PL", {
	day: "2-digit",
	month: "2-digit",
	year: "numeric",
	hour: "2-digit",
	minute: "2-digit",
});

function StatusBadge({ label, tone }: { label: string; tone: keyof typeof BADGE_TONE_CLASS }) {
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

function OrderRow({ order }: { order: AdminOrderRow }) {
	const payment = paymentStatusBadge(order.paymentStatus);
	const fulfillment = fulfillmentStatusBadge(order.fulfillmentStatus);
	const status = orderStatusBadge(order.status);

	return (
		<OrderTableRow
			orderId={order.id}
			label={`Zamówienie #${order.displayId || "—"}, ${order.customerName || order.email}`}
		>
			<td className="px-4 py-3">
				<span className="block text-sm font-semibold text-foreground">
					#{order.displayId || "—"}
				</span>
				<span className="block text-xs text-muted-foreground">
					{order.createdAt ? DATE_TIME.format(new Date(order.createdAt)) : "—"}
				</span>
			</td>
			<td className="px-4 py-3">
				<span className="block truncate text-sm font-medium text-foreground">
					{order.customerName || "Gość"}
				</span>
				<span className="block truncate text-xs text-muted-foreground">{order.email}</span>
			</td>
			<td className="hidden px-4 py-3 text-sm text-muted-foreground sm:table-cell">
				{order.itemCount} szt.
			</td>
			<td className="px-4 py-3 text-sm font-medium text-foreground">
				{formatPrice(order.total, order.currencyCode)}
			</td>
			<td className="hidden px-4 py-3 md:table-cell">
				<StatusBadge label={payment.label} tone={payment.tone} />
			</td>
			<td className="hidden px-4 py-3 lg:table-cell">
				<StatusBadge label={fulfillment.label} tone={fulfillment.tone} />
			</td>
			<td className="px-4 py-3">
				<StatusBadge label={status.label} tone={status.tone} />
			</td>
		</OrderTableRow>
	);
}

export default async function OrdersPage() {
	const orders = await loadAdmin(listAdminOrders);

	return (
		<div className="flex flex-col gap-6">
			<header>
				<h1 className="font-serif text-2xl text-foreground">Zamówienia</h1>
				<p className="mt-1 text-sm text-muted-foreground">
					{orders.length === 0
						? "Nowe zamówienia ze sklepu pojawią się tutaj automatycznie."
						: `${orders.length} ${orders.length === 1 ? "zamówienie" : "zamówień"} · najnowsze na górze`}
				</p>
			</header>

			{orders.length === 0 ? (
				<div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border p-12 text-center">
					<span className="grid size-12 place-items-center rounded-full bg-muted text-muted-foreground">
						<Inbox className="size-6" aria-hidden />
					</span>
					<p className="text-sm text-muted-foreground">
						Brak zamówień. Gdy klient sfinalizuje zakup w sklepie, zamówienie wyląduje tutaj.
					</p>
				</div>
			) : (
				<div className="overflow-x-auto rounded-xl border border-border">
					<table className="w-full border-collapse text-left">
						<thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
							<tr>
								<th className="px-4 py-3 font-medium">Zamówienie</th>
								<th className="px-4 py-3 font-medium">Klient</th>
								<th className="hidden px-4 py-3 font-medium sm:table-cell">Pozycje</th>
								<th className="px-4 py-3 font-medium">Wartość</th>
								<th className="hidden px-4 py-3 font-medium md:table-cell">Płatność</th>
								<th className="hidden px-4 py-3 font-medium lg:table-cell">Wysyłka</th>
								<th className="px-4 py-3 font-medium">Status</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-border">
							{orders.map((order) => (
								<OrderRow key={order.id} order={order} />
							))}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);
}
