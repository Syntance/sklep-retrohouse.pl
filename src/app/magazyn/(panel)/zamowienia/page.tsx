import { loadAdmin } from "@/lib/admin/load";
import { listAdminOrders } from "@/lib/admin/orders";
import { OrdersList } from "./orders-list";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function OrdersPage() {
	const orders = await loadAdmin(listAdminOrders);

	return (
		<div className="flex flex-col gap-6">
			<header>
				<h1 className="font-serif text-2xl text-foreground">Zamówienia</h1>
				<p className="mt-1 text-sm text-muted-foreground">
					Przeszukuj, filtruj i sortuj klikając nagłówki kolumn.
				</p>
			</header>

			<OrdersList orders={orders} />
		</div>
	);
}
