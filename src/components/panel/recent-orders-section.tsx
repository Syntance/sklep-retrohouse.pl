import Link from "next/link";
import { orderStatusBadge } from "@/lib/admin/order-status";
import type { AdminOrderRow } from "@/lib/admin/order-types";
import { formatPrice } from "@/lib/format";
import { Badge, Section, Table, TBody, Td, THead, Th } from "./chrome";

type Props = {
	orders: AdminOrderRow[];
	ordersBasePath?: string;
};

export function RecentOrdersSection({ orders, ordersBasePath = "/magazyn/zamowienia" }: Props) {
	const recent = orders.slice(0, 5);

	if (recent.length === 0) return null;

	return (
		<Section
			title="Ostatnie zamówienia"
			action={
				<Link
					href={ordersBasePath}
					className="text-sm text-muted-foreground transition-colors hover:text-foreground"
				>
					Zobacz wszystkie →
				</Link>
			}
		>
			<Table>
				<THead>
					<tr>
						{["Zamówienie", "Klient", "Wartość", "Status"].map((h) => (
							<Th key={h}>{h}</Th>
						))}
					</tr>
				</THead>
				<TBody>
					{recent.map((order) => {
						const status = orderStatusBadge(order.status);
						return (
							<tr key={order.id} className="transition-colors hover:bg-muted/30">
								<Td>
									<Link
										href={`${ordersBasePath}/${order.id}`}
										className="block text-sm font-semibold text-foreground hover:text-primary"
									>
										#{order.displayId}
									</Link>
									<span className="block text-xs text-muted-foreground">
										{new Intl.DateTimeFormat("pl-PL", {
											day: "numeric",
											month: "short",
											hour: "2-digit",
											minute: "2-digit",
										}).format(new Date(order.createdAt))}
									</span>
								</Td>
								<Td>
									<span className="block text-sm font-medium text-foreground">
										{order.customerName || "—"}
									</span>
									<span className="block text-xs text-muted-foreground">{order.email}</span>
								</Td>
								<Td className="font-medium text-foreground">
									{formatPrice(order.total, order.currencyCode)}
								</Td>
								<Td>
									<Badge tone={status.tone}>{status.label}</Badge>
								</Td>
							</tr>
						);
					})}
				</TBody>
			</Table>
		</Section>
	);
}
