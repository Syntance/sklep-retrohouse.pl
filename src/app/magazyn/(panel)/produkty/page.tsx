import { Pencil, Plus } from "lucide-react";
import Link from "next/link";
import { formatPrice } from "@/lib/format";
import { BADGE_TONE_CLASS } from "@/lib/admin/order-status";
import { loadAdmin } from "@/lib/admin/load";
import { type AdminProductRow, listAdminProducts } from "@/lib/admin/products";
import { PageHeader } from "@/components/panel/chrome";
import { cn } from "@/lib/utils";
import { DeleteProductButton } from "./delete-product-button";
import { ProductListThumbnail } from "./product-list-thumbnail";

export const dynamic = "force-dynamic";

function PriceCell({ product }: { product: AdminProductRow }) {
	if (product.pricePln == null) {
		return <span className="text-sm text-muted-foreground">— brak ceny</span>;
	}
	return (
		<span className="text-sm font-medium text-foreground">
			{formatPrice(product.pricePln, "PLN")}
		</span>
	);
}

export default async function ProductsPage() {
	const products = await loadAdmin(listAdminProducts);

	return (
		<div className="flex flex-col gap-6">
			<PageHeader
				className="mb-0"
				title="Produkty"
				description={`${products.length} ${products.length === 1 ? "pozycja" : "pozycji"} w magazynie`}
				action={
					<Link
						href="/magazyn/produkty/nowy"
						className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
					>
						<Plus className="size-4" aria-hidden />
						Dodaj produkt
					</Link>
				}
			/>

			{products.length === 0 ? (
				<div className="rounded-xl border border-dashed border-border p-12 text-center">
					<p className="text-sm text-muted-foreground">
						Brak produktów. Dodaj pierwszy, klikając „Dodaj produkt".
					</p>
				</div>
			) : (
				<div className="overflow-hidden rounded-xl border border-border">
					<table className="w-full border-collapse text-left">
						<thead className="bg-muted/50 text-xs text-muted-foreground uppercase">
							<tr>
								<th className="px-4 py-3 font-medium">Produkt</th>
								<th className="hidden px-4 py-3 font-medium sm:table-cell">Kategoria</th>
								<th className="px-4 py-3 font-medium">Cena</th>
								<th className="hidden px-4 py-3 font-medium md:table-cell">Status</th>
								<th className="px-4 py-3 text-right font-medium">Akcje</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-border">
							{products.map((product) => (
								<tr key={product.id} className="bg-card transition-colors hover:bg-muted/30">
									<td className="px-4 py-3">
										<Link
											href={`/magazyn/produkty/${product.id}`}
											className="flex items-center gap-3 focus-visible:outline-none"
										>
											<span className="relative size-11 shrink-0 overflow-hidden rounded-md border border-border bg-muted">
												{product.thumbnail ? (
													<ProductListThumbnail url={product.thumbnail} />
												) : null}
											</span>
											<span className="min-w-0">
												<span className="block truncate text-sm font-medium text-foreground">
													{product.title}
												</span>
												<span className="block truncate text-xs text-muted-foreground">
													/{product.handle}
												</span>
											</span>
										</Link>
									</td>
									<td className="hidden px-4 py-3 text-sm text-muted-foreground sm:table-cell">
										{product.categoryName ?? "—"}
									</td>
									<td className="px-4 py-3">
										<PriceCell product={product} />
									</td>
									<td className="hidden px-4 py-3 md:table-cell">
										<span
											className={cn(
												"inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
												product.status === "published"
													? BADGE_TONE_CLASS.success
													: BADGE_TONE_CLASS.warning,
											)}
										>
											{product.status === "published" ? "Opublikowany" : "Szkic"}
										</span>
									</td>
									<td className="px-4 py-3">
										<div className="flex items-center justify-end gap-1">
											<Link
												href={`/magazyn/produkty/${product.id}`}
												aria-label={`Edytuj ${product.title}`}
												className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
											>
												<Pencil className="size-4" aria-hidden />
											</Link>
											<DeleteProductButton id={product.id} title={product.title} />
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);
}
