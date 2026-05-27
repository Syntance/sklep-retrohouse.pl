import Link from "next/link";
import type { Product } from "@/lib/products/types";
import { cn } from "@/lib/utils";

const GIFT_HERO_MAX_PRICE = 1000;

export function pickGiftHeroProduct(products: readonly Product[]): Product {
	const eligible = products.filter((product) => product.price <= GIFT_HERO_MAX_PRICE);
	if (eligible.length === 0) {
		return products.reduce((cheapest, product) =>
			product.price < cheapest.price ? product : cheapest,
		);
	}

	const daySeed = new Date().toISOString().slice(0, 10);
	const index =
		daySeed.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0) % eligible.length;
	return eligible[index] ?? eligible[0];
}

function getProductPlace(product: Product): string {
	if (product.name.includes("Wiedeń")) return "Wiedeń";
	return product.manufacturer;
}

function getProductYear(product: Product): string {
	const fromName = product.name.match(/ok\.\s*\d{4}|\b(1[89]\d{2}|20\d{2})\b/);
	if (fromName) return fromName[0];
	const fromStory = product.story.match(/\b(1[89]\d{2}|20\d{2})\b/);
	if (fromStory) return fromStory[0];
	return product.epochLabel;
}

type GiftHeroProductProps = {
	product: Product;
	className?: string;
};

export function GiftHeroProduct({ product, className }: GiftHeroProductProps) {
	const [primary, secondary, accent] = product.imageHues;
	const place = getProductPlace(product);
	const year = getProductYear(product);

	return (
		<Link
			href={`/sklep/${product.slug}?source=/prezent`}
			className={cn(
				"group/hero relative block aspect-5/6 w-full overflow-hidden rounded-3xl border border-border bg-card shadow-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-terracotta",
				className,
			)}
			aria-label={`Zobacz: ${product.name}`}
		>
			<div
				aria-hidden
				className="absolute inset-0 transition-transform duration-700 group-hover/hero:scale-[1.03]"
				style={{
					backgroundImage: `radial-gradient(120% 80% at 30% 20%, ${primary}, transparent 60%), radial-gradient(80% 80% at 80% 90%, ${secondary}, transparent 70%), linear-gradient(135deg, ${accent}, ${primary})`,
				}}
			/>
			<div className="relative flex h-full flex-col justify-between p-6 text-ink-foreground sm:p-8">
				<div className="max-w-[90%] rounded-2xl border border-ink-foreground/30 bg-ink/85 px-4 py-3 backdrop-blur-md">
					<p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-ink-foreground/75">
						{place} · {year}
					</p>
					<p className="mt-1 font-display text-lg leading-snug text-ink-foreground">{product.name}</p>
				</div>
				<p className="max-w-[95%] rounded-2xl border border-ink-foreground/30 bg-ink-foreground/15 p-5 text-sm leading-relaxed text-ink-foreground backdrop-blur-md">
					{product.shortDescription}
				</p>
			</div>
		</Link>
	);
}
