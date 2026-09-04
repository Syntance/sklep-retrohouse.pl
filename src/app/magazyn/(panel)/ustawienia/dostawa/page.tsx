import { PageHeader } from "@/components/panel/chrome";
import { loadAdmin } from "@/lib/admin/load";
import { listShippingOptionsAdmin } from "@/lib/admin/shipping-options";
import { ShippingManager } from "./shipping-manager";

export const dynamic = "force-dynamic";

export const metadata = { title: "Ustawienia sklepu — Dostawa" };

export default async function SettingsDostawaPage() {
	const options = await loadAdmin(listShippingOptionsAdmin);

	return (
		<div className="flex flex-col gap-6">
			<PageHeader
				className="mb-0"
				title="Dostawa"
				description="Metody wysyłki — nazwa, cena i widoczność w checkoutcie."
			/>
			<ShippingManager options={options} />
		</div>
	);
}
