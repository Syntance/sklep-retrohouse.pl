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
	unikat: "bg-ink text-ink-foreground",
	fresh: "bg-success text-success-foreground",
	bestseller: "bg-terracotta text-terracotta-foreground",
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
				"group/card relative flex h-full flex-col overflow-hidden rounded-xl border border-walnut/15 bg-card shadow-card transition-all duration-300",
				"hover:-translate-y-1 hover:border-walnut/30 hover:shadow-lg",
				className,
			)}
		>
			<Link
				href={url}
				className="relative block aspect-[4/5] w-full overflow-hidden focus-visible:outline-none"
				aria-label={`Zobacz: ${product.name}`}
			>
				<div
					className="absolute inset-0 transition-transform duration-700 group-hover/card:scale-[1.06]"
					style={{
						backgroundImage: `radial-gradient(120% 80% at 30% 20%, ${primary}, transparent 60%), radial-gradient(80% 80% at 80% 90%, ${secondary}, transparent 70%), linear-gradient(135deg, ${accent}, ${primary})`,
					}}
				/>
				<div
					aria-hidden="true"
					className="absolute inset-0 mix-blend-overlay opacity-50 [background-image:repeating-linear-gradient(135deg,transparent_0_3px,oklch(0.18_0.025_35_/_0.06)_3px_4px)]"
				/>
				<div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
					{product.badges.map((badge) => (
						<span
							key={badge}
							className={cn(
								"rounded-full px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.12em] shadow-sm",
								BADGE_TONE[badge],
							)}
						>
							{BADGE_LABELS[badge]}
						</span>
					))}
				</div>
				<div
					className="pointer-events-none absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-ink-foreground/85 text-foreground opacity-0 shadow-sm backdrop-blur transition-opacity duration-300 group-hover/card:opacity-100"
					aria-hidden="true"
				>
					<ArrowUpRightIcon className="size-4 text-terracotta" />
				</div>
				<div className="absolute inset-x-3 bottom-3 flex items-end justify-between gap-3 text-paper-foreground/95">
					<div>
						<p className="font-sans text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-paper">
							{product.epochLabel}
						</p>
						<p className="text-xs text-paper/75">{product.districtVienna.split("(")[0].trim()}</p>
					</div>
				</div>
			</Link>
			<div className="flex flex-1 flex-col gap-2 p-5">
				<p className="font-sans text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-walnut">
					{product.categoryLabel}
				</p>
				<h3 className="font-display text-lg leading-tight text-foreground">
					<Link
						href={url}
						className="rounded-sm transition-colors hover:text-terracotta focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
					>
						<span className="line-clamp-2">{product.name}</span>
					</Link>
				</h3>
				<div className="mt-auto flex items-baseline justify-between gap-3 pt-3">
					<span className="font-display text-xl font-semibold tabular text-terracotta">
						{formatPrice(product.price)}
					</span>
					{primaryBadge ? (
						<span className="text-[0.7rem] text-foreground/55">
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
