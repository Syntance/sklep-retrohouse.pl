import { PageHeader } from "@/components/panel/chrome";
import { listCategories } from "@/lib/admin/categories";
import { loadAdmin } from "@/lib/admin/load";
import { CategoriesManager } from "./categories-manager";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
	const categories = await loadAdmin(listCategories);

	return (
		<div className="flex flex-col gap-6">
			<PageHeader
				className="mb-0"
				title="Kategorie"
				description="Działy sklepu — produkty przypisujesz przy edycji."
			/>
			<CategoriesManager categories={categories} />
		</div>
	);
}
