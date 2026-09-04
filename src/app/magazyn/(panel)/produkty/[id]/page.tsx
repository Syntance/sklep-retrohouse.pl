import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { listCategories } from "@/lib/admin/categories";
import { getConfiguredEpochs } from "@/lib/admin/epochs";
import { loadAdmin } from "@/lib/admin/load";
import { getAdminProduct } from "@/lib/admin/products";
import { ProductForm } from "../product-form";

export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	const [product, categories, epochs] = await loadAdmin(() =>
		Promise.all([getAdminProduct(id), listCategories(), getConfiguredEpochs()]),
	);

	if (!product) notFound();

	return (
		<div className="mx-auto flex max-w-3xl flex-col gap-6">
			<div>
				<Link
					href="/magazyn/produkty"
					className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
				>
					<ArrowLeft className="size-4" aria-hidden />
					Produkty
				</Link>
				<h1 className="mt-2 font-serif text-2xl text-foreground">{product.title}</h1>
			</div>

			<ProductForm
				initial={product}
				categories={categories.map((c) => ({ id: c.id, name: c.name }))}
				epochs={epochs}
			/>
		</div>
	);
}
