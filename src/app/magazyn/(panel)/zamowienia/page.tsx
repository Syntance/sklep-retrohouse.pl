import { Plus } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/panel/chrome";
import { loadAdmin } from "@/lib/admin/load";
import { listAdminOrders } from "@/lib/admin/orders";
import { OrdersList } from "./orders-list";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function OrdersPage() {
	const orders = await loadAdmin(listAdminOrders);

	return (
		<div className="flex flex-col gap-6">
			<PageHeader
				className="mb-0"
				title="Zamówienia"
				description="Przeszukuj, filtruj i sortuj klikając nagłówki kolumn."
				action={
					<Link
						href="/magazyn/zamowienia/nowe"
						className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
					>
						<Plus className="size-4" aria-hidden />
						Nowe zamówienie
					</Link>
				}
			/>
			<OrdersList orders={orders} />
		</div>
	);
}
