import { listCategories } from "@/lib/admin/categories";
import { loadAdmin } from "@/lib/admin/load";
import { CategoriesManager } from "./categories-manager";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
	const categories = await loadAdmin(listCategories);

	return (
		<div className="flex flex-col gap-6">
			<header>
				<h1 className="font-serif text-2xl text-foreground">Kategorie</h1>
				<p className="mt-1 text-sm text-muted-foreground">
					Działy sklepu — produkty przypisujesz przy edycji.
				</p>
			</header>

			<CategoriesManager categories={categories} />
		</div>
	);
}
