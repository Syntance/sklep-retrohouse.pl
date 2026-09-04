import { PageHeader } from "@/components/panel/chrome";
import { loadAdmin } from "@/lib/admin/load";
import { getOrderFormOptions } from "@/lib/admin/manual-order";
import { CreateOrderForm } from "./create-order-form";

export const dynamic = "force-dynamic";

export const metadata = { title: "Magazyn — Nowe zamówienie" };

export default async function CreateOrderPage() {
	const { shippingOptions, initialProducts } = await loadAdmin(getOrderFormOptions);

	return (
		<div className="flex flex-col gap-6">
			<PageHeader
				className="mb-0"
				title="Nowe zamówienie"
				description="Ręczne zamówienie dla klienta z telefonu, Instagrama lub e-maila."
			/>
			<CreateOrderForm shippingOptions={shippingOptions} initialProducts={initialProducts} />
		</div>
	);
}
