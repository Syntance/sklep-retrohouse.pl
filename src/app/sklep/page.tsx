import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowRightIcon, InstagramIcon } from "@/components/icons";
import { MobileCartFab } from "@/components/mobile-cart-fab";
import { Container, CtaLink, Eyebrow, Section } from "@/components/primitives";
import { ProductCard } from "@/components/product-card";
import { ShopHero } from "@/components/sections/shop-hero";
import {
	PRODUCT_CATEGORIES,
	type Product,
	type ProductCategory,
} from "@/lib/products";
import { getEpochOptions } from "@/lib/catalog/epochs";
import { listProducts } from "@/lib/products/queries";
import { getPageContent } from "@/lib/content";
import { cn } from "@/lib/utils";
import { ShopPreferencesSync } from "@/components/shop/shop-preferences-sync";
import { PriceRangeFilter } from "./price-range-filter";
import { ShopCategoryAutoScroll } from "./shop-category-scroll";
import { SortDropdown } from "./sort-dropdown";
import {
	mergeShopParams,
	normalizePriceRange,
	parsePriceParam,
	type ShopSearchParams,
} from "./shop-params";

export const revalidate = 60;

export const metadata: Metadata = {
	title: "Sklep z antykami i vintage",
	description:
		"Antyki i vintage z wiedeńskich kamienic. Porcelana, szkło, meble, dekoracje. Filtruj po kategorii, cenie i epoce.",
};

type SortKey = "najnowsze" | "cena-asc" | "cena-desc" | "popularne";

const SORT_OPTIONS: Array<{ value: SortKey; label: string }> = [
	{ value: "najnowsze", label: "Najnowsze" },
	{ value: "cena-asc", label: "Cena: rosnąco" },
	{ value: "cena-desc", label: "Cena: malejąco" },
	{ value: "popularne", label: "Popularne" },
];

type SearchParams = ShopSearchParams;

export default async function SklepPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
	const params = await searchParams;
	const [PRODUCTS, epochOptions, shopContent] = await Promise.all([
		listProducts(),
		getEpochOptions(),
		getPageContent("sklep"),
	]);
	const activeCategory = parseEnum<ProductCategory>(
		params.kategoria,
		PRODUCT_CATEGORIES.map((c) => c.value),
	);
	const activeEpoch = parseEnum<string>(
		params.epoka,
		epochOptions.map((e) => e.value),
	);
	const { min: priceMin, max: priceMax } = normalizePriceRange(
		parsePriceParam(params.cenaOd),
		parsePriceParam(params.cenaDo),
	);
	const activeSort = parseEnum<SortKey>(
		params.sort,
		SORT_OPTIONS.map((s) => s.value),
		"najnowsze",
	);

	const filtered = applySort(
		PRODUCTS.filter((product) => {
			if (activeCategory && product.category !== activeCategory) return false;
			if (activeEpoch && product.epoch !== activeEpoch) return false;
			if (priceMin !== undefined && product.price < priceMin) return false;
			if (priceMax !== undefined && product.price > priceMax) return false;
			return true;
		}),
		activeSort,
	);

	const isFiltered = Boolean(
		activeCategory ||
			activeEpoch ||
			priceMin !== undefined ||
			priceMax !== undefined ||
			activeSort !== "najnowsze",
	);

	return (
		<main id="main" className="flex flex-col">
			<Suspense fallback={null}>
				<ShopPreferencesSync />
				<ShopCategoryAutoScroll />
			</Suspense>
			<ShopHero
				backgroundImageUrl={shopContent.hero?.backgroundImageUrl}
				backgroundImageAlt={shopContent.hero?.backgroundImageAlt}
			/>

			<Section spacing="md">
				<Container size="xl">
					<div
						id="sklep-filtry-start"
						className="grid gap-10 scroll-mt-24 lg:grid-cols-[220px_1fr]"
					>
						<aside aria-label="Filtry" className="sticky top-24 self-start">
							<FilterGroup
								title="Kategoria"
								options={PRODUCT_CATEGORIES}
								active={activeCategory}
								paramKey="kategoria"
								params={params}
							/>
							<PriceRangeFilter params={params} priceMin={priceMin} priceMax={priceMax} />
							<FilterGroup
								title="Epoka"
								options={epochOptions}
								active={activeEpoch}
								paramKey="epoka"
								params={params}
							/>
							{isFiltered ? (
								<Link
									href="/sklep"
									className="mt-2 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.16em] text-foreground/60 hover:text-foreground"
								>
									Wyczyść filtry
									<ArrowRightIcon className="size-3" />
								</Link>
							) : null}
						</aside>

						<div className="flex min-w-0 flex-col gap-6">
							<SortDropdown params={params} activeSort={activeSort} options={SORT_OPTIONS} />
							{filtered.length > 0 ? (
								<div className="grid grid-cols-1 gap-8 md:grid-cols-3">
									{filtered.map((product, index) => (
										<ProductCard
											key={product.slug}
											product={product}
											source="/sklep"
											position={index + 1}
											showShopActions
										/>
									))}
								</div>
							) : (
								<EmptyState />
							)}
						</div>
					</div>
				</Container>
			</Section>

			<Section spacing="md" tone="muted">
				<Container size="xl">
					<div className="grid gap-6 rounded-3xl border border-border bg-card p-8 md:grid-cols-2 md:p-12">
						<div>
							<Eyebrow>Nie widzisz tego, czego szukasz?</Eyebrow>
							<h2 className="mt-3 font-display text-3xl font-semibold leading-tight md:text-4xl">
								Napisz — doradzimy.
							</h2>
							<p className="mt-3 max-w-lg text-foreground/70">
								Regularnie odstarczamy do sklepu nowe przedmioty
								— odezwiemy się gdy znajdziemy coś idealnego dla Ciebie.
							</p>
						</div>
						<div className="flex flex-col items-start justify-center gap-3 md:items-end">
							<CtaLink href="/kontakt" variant="primary">
								Zapytaj o przedmiot
							</CtaLink>
							<Link
								href="https://instagram.com/retrohouse"
								target="_blank"
								rel="noreferrer"
								className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-foreground/70 hover:text-terracotta"
							>
								<InstagramIcon className="size-4" />
								Obserwuj IG — nowości tam najpierw
							</Link>
						</div>
					</div>
				</Container>
			</Section>
			<MobileCartFab />
		</main>
	);
}

function FilterGroup({
	title,
	options,
	active,
	paramKey,
	params,
}: {
	title: string;
	options: Array<{ value: string; label: string }>;
	active?: string;
	paramKey: keyof SearchParams;
	params: SearchParams;
}) {
	return (
		<fieldset className="border-t border-border py-5 first:border-t-0 first:pt-0">
			<legend className="mb-3 font-sans text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-brass">
				{title}
			</legend>
			<ul className="space-y-1.5">
				{options.map((option) => {
					const isActive = active === option.value;
					const next = mergeShopParams(params, {
						[paramKey]: isActive ? undefined : option.value,
					});
					return (
						<li key={option.value}>
							<Link
								href={`/sklep${next}`}
								scroll={false}
								aria-current={isActive ? "true" : undefined}
								className={cn(
									"flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
									isActive
										? "bg-ink text-ink-foreground"
										: "text-foreground/80 hover:bg-cream hover:text-foreground",
								)}
							>
								{option.label}
								{isActive ? (
									<span aria-hidden className="text-xs">
										✕
									</span>
								) : null}
							</Link>
						</li>
					);
				})}
			</ul>
		</fieldset>
	);
}

function EmptyState() {
	return (
		<div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-border bg-card p-10 text-center">
			<span className="grid size-14 place-items-center rounded-full bg-cream">
				<ArrowRightIcon className="size-6 text-brass" />
			</span>
			<h2 className="font-display text-2xl">Nic tu jeszcze nie ma</h2>
			<p className="max-w-md text-sm text-foreground/70">
				Nowe skarby przyjeżdżają co 2 tygodnie. Obserwuj{" "}
				<a
					href="https://instagram.com/retrohouse"
					target="_blank"
					rel="noreferrer"
					className="font-semibold text-brass hover:underline"
				>
					@retrohouse
				</a>{" "}
				— nowości tam najpierw.
			</p>
			<CtaLink href="/sklep">Zobacz wszystkie produkty</CtaLink>
		</div>
	);
}

function applySort(products: Product[], sort: SortKey): Product[] {
	const copy = [...products];
	switch (sort) {
		case "cena-asc":
			return copy.sort((a, b) => a.price - b.price);
		case "cena-desc":
			return copy.sort((a, b) => b.price - a.price);
		case "popularne":
			return copy.sort((a, b) => b.popularity - a.popularity);
		default:
			return copy.sort((a, b) => (a.addedAt < b.addedAt ? 1 : a.addedAt > b.addedAt ? -1 : 0));
	}
}

function parseEnum<T extends string>(
	value: string | undefined,
	allowed: readonly T[],
): T | undefined;
function parseEnum<T extends string>(
	value: string | undefined,
	allowed: readonly T[],
	fallback: T,
): T;
function parseEnum<T extends string>(
	value: string | undefined,
	allowed: readonly T[],
	fallback?: T,
): T | undefined {
	if (value && (allowed as readonly string[]).includes(value)) return value as T;
	return fallback;
}
