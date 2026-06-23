import { loadAdmin } from "@/lib/admin/load";
import { listAdminOrders } from "@/lib/admin/orders";
import { PageHeader } from "@/components/panel/chrome";
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
			/>
			<OrdersList orders={orders} />
		</div>
	);
}
