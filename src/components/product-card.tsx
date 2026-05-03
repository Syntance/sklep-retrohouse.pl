import Link from "next/link";
import { ArrowUpRightIcon } from "@/components/icons";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/lib/mock/products";
import { cn } from "@/lib/utils";

const BADGE_LABELS: Record<NonNullable<Product["badges"][number]>, string> = {
	unikat: "Unikat",
	fresh: "Świeża dostawa",
	bestseller: "Bestseller",
};

const BADGE_TONE: Record<NonNullable<Product["badges"][number]>, string> = {
	unikat: "bg-foreground text-background",
	fresh: "bg-success text-success-foreground",
	bestseller: "bg-brass text-foreground",
};

type ProductCardProps = {
	product: Product;
	className?: string;
	source?: string;
};

export function ProductCard({ product, className, source = "/sklep" }: ProductCardProps) {
	const [primary, secondary, accent] = product.imageHues;
	const url =
		source && source !== "/sklep"
			? `/sklep/${product.slug}?source=${encodeURIComponent(source)}`
			: `/sklep/${product.slug}`;
	const primaryBadge = product.badges[0];

	return (
		<article
			className={cn(
				"group/card relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-0.5 hover:shadow-lg",
				className,
			)}
		>
			<Link
				href={url}
				className="relative block aspect-[4/5] w-full overflow-hidden focus-visible:outline-none"
				aria-label={`Zobacz: ${product.name}`}
			>
				<div
					className="absolute inset-0 transition-transform duration-700 group-hover/card:scale-[1.04]"
					style={{
						backgroundImage: `radial-gradient(120% 80% at 30% 20%, ${primary}, transparent 60%), radial-gradient(80% 80% at 80% 90%, ${secondary}, transparent 70%), linear-gradient(135deg, ${accent}, ${primary})`,
					}}
				/>
				<div
					aria-hidden
					className="absolute inset-0 mix-blend-overlay opacity-60 [background-image:repeating-linear-gradient(135deg,transparent_0_3px,oklch(0.27_0.005_280_/_0.04)_3px_4px)]"
				/>
				<div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
					{product.badges.map((badge) => (
						<span
							key={badge}
							className={cn(
								"rounded-full px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.14em]",
								BADGE_TONE[badge],
							)}
						>
							{BADGE_LABELS[badge]}
						</span>
					))}
				</div>
				<div
					className="pointer-events-none absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-background/80 text-foreground opacity-0 transition-opacity group-hover/card:opacity-100"
					aria-hidden
				>
					<ArrowUpRightIcon className="size-4" />
				</div>
				<div className="absolute inset-x-3 bottom-3 flex items-end justify-between gap-3 text-background/95">
					<div>
						<p className="font-sans text-[0.65rem] font-semibold uppercase tracking-[0.18em]">
							{product.epochLabel}
						</p>
						<p className="text-xs opacity-80">{product.districtVienna.split("(")[0].trim()}</p>
					</div>
				</div>
			</Link>
			<div className="flex flex-1 flex-col gap-2 p-4">
				<p className="font-sans text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-brass">
					{product.categoryLabel}
				</p>
				<h3 className="font-display text-lg leading-tight text-foreground">
					<Link
						href={url}
						className="rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
					>
						<span className="line-clamp-2">{product.name}</span>
					</Link>
				</h3>
				<div className="mt-auto flex items-baseline justify-between pt-2">
					<span className="font-display text-xl font-semibold text-foreground tabular">
						{formatPrice(product.price)}
					</span>
					{primaryBadge ? (
						<span className="text-xs text-foreground/60">
							{primaryBadge === "bestseller"
								? "popularny wybór"
								: primaryBadge === "fresh"
									? "do 14 dni od dostawy"
									: "1 z 1 — unikat"}
						</span>
					) : null}
				</div>
			</div>
		</article>
	);
}
