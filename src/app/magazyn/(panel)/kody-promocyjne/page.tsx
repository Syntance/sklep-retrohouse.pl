import { PageHeader } from "@/components/panel/chrome";
import { loadAdmin } from "@/lib/admin/load";
import { listProductOptionsForPromo, listPromoCodes } from "@/lib/admin/promotions";
import { PromotionsManager } from "./promotions-manager";

export const dynamic = "force-dynamic";

export const metadata = { title: "Magazyn — Kody promocyjne" };

export default async function PromotionsPage() {
	const [promos, products] = await loadAdmin(() =>
		Promise.all([listPromoCodes(), listProductOptionsForPromo()]),
	);

	return (
		<div className="flex flex-col gap-6">
			<PageHeader
				className="mb-0"
				title="Kody promocyjne"
				description="Twórz kody rabatowe, przypisuj je do produktów i opcjonalnie włącz darmową dostawę od wybranej kwoty koszyka."
			/>
			<PromotionsManager promos={promos} products={products} />
		</div>
	);
}
