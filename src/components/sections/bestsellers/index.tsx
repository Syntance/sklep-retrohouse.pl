import { Container, CtaLink, Eyebrow, Section } from "@/components/primitives";
import { ProductCard } from "@/components/product-card";
import type { Product } from "@/lib/mock/products";

type BestsellersSectionProps = {
	products: ReadonlyArray<Product>;
};

/**
 * BOFU sekcja — 4 najpopularniejsze pozycje. Każda karta ma source
 * "hp-bestsellers" → ProductCard emituje `bestseller_clicked`.
 *
 * Server-only: ProductCard sam jest "use client", więc nie trzeba tu
 * wymuszać client boundary.
 */
export function BestsellersSection({ products }: BestsellersSectionProps) {
	return (
		<Section spacing="lg" tone="cream">
			<Container size="lg">
				<header className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
					<div className="max-w-xl">
						<Eyebrow>NASZ WYBÓR</Eyebrow>
						<h2 className="mt-3 font-display text-3xl font-medium leading-tight md:text-4xl">
							Sześć rzeczy, na które warto spojrzeć.
						</h2>
						<p className="mt-3 text-base leading-relaxed text-foreground/70">
							Cotygodniowy przekrój kolekcji — od porcelany po meble, od kilkuset złotych po
							unikaty za kilka tysięcy.
						</p>
					</div>
					<CtaLink href="/sklep" variant="underline" withArrow={false}>
						Zobacz wszystkie
					</CtaLink>
				</header>

				<div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
					{products.map((product, index) => (
						<ProductCard
							key={product.slug}
							product={product}
							source="hp-bestsellers"
							position={index + 1}
						/>
					))}
				</div>
			</Container>
		</Section>
	);
}
