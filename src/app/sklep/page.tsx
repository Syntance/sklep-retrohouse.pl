import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRightIcon, InstagramIcon } from "@/components/icons";
import { Breadcrumbs, Container, CtaLink, Eyebrow, Lead, Section } from "@/components/primitives";
import { ProductCard } from "@/components/product-card";
import {
	PRICE_BUCKETS,
	PRODUCT_CATEGORIES,
	PRODUCT_EPOCHS,
	PRODUCTS,
	type Product,
	type ProductCategory,
	type ProductEpoch,
} from "@/lib/mock/products";
import { cn } from "@/lib/utils";

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

type SearchParams = {
	kategoria?: string;
	cena?: string;
	epoka?: string;
	sort?: string;
};

export default async function SklepPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
	const params = await searchParams;
	const activeCategory = parseEnum<ProductCategory>(
		params.kategoria,
		PRODUCT_CATEGORIES.map((c) => c.value),
	);
	const activeEpoch = parseEnum<ProductEpoch>(
		params.epoka,
		PRODUCT_EPOCHS.map((e) => e.value),
	);
	const activePrice = PRICE_BUCKETS.find((bucket) => bucket.id === params.cena);
	const activeSort = parseEnum<SortKey>(
		params.sort,
		SORT_OPTIONS.map((s) => s.value),
		"najnowsze",
	);

	const filtered = applySort(
		PRODUCTS.filter((product) => {
			if (activeCategory && product.category !== activeCategory) return false;
			if (activeEpoch && product.epoch !== activeEpoch) return false;
			if (activePrice) {
				if (product.price < activePrice.min) return false;
				if (typeof activePrice.max === "number" && product.price >= activePrice.max) return false;
			}
			return true;
		}),
		activeSort,
	);

	const isFiltered = Boolean(
		activeCategory || activeEpoch || activePrice || activeSort !== "najnowsze",
	);

	return (
		<main id="main" className="flex flex-col">
			<Section spacing="md" tone="muted">
				<Container size="xl">
					<Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Sklep" }]} />
					<div className="mt-6 grid gap-6 md:grid-cols-[1.4fr_1fr] md:items-end">
						<div>
							<Eyebrow>Co aktualnie mamy</Eyebrow>
							<h1 className="mt-3 font-display text-5xl font-semibold leading-tight md:text-6xl">
								Nasze antyki
							</h1>
							<Lead className="mt-4">
								{filtered.length}{" "}
								{filtered.length === 1 ? "unikat" : filtered.length < 5 ? "unikaty" : "unikatów"}{" "}
								{isFiltered ? "po wybranych filtrach" : "z wiedeńskich kamienic"}. Każdy z nich
								istnieje tylko raz — gdy zniknie, więcej go nie będzie.
							</Lead>
						</div>
						<form className="md:justify-self-end">
							<label
								htmlFor="sort"
								className="block text-xs font-semibold uppercase tracking-[0.16em] text-foreground/60"
							>
								Sortowanie
							</label>
							<div className="mt-2 grid gap-2 md:flex">
								{SORT_OPTIONS.map((option) => {
									const next = mergeParams(params, {
										sort: option.value === "najnowsze" ? undefined : option.value,
									});
									const isActive = activeSort === option.value;
									return (
										<Link
											key={option.value}
											href={`/sklep${next}`}
											aria-current={isActive ? "true" : undefined}
											className={cn(
												"inline-flex items-center justify-center rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] transition-colors",
												isActive
													? "border-ink bg-terracotta text-terracotta-foreground"
													: "border-border bg-card text-foreground/70 hover:border-foreground hover:text-foreground",
											)}
										>
											{option.label}
										</Link>
									);
								})}
							</div>
						</form>
					</div>
				</Container>
			</Section>

			<Section spacing="md">
				<Container size="xl">
					<div className="grid gap-10 lg:grid-cols-[260px_1fr]">
						<aside aria-label="Filtry" className="sticky top-24 self-start">
							<FilterGroup
								title="Kategoria"
								options={PRODUCT_CATEGORIES}
								active={activeCategory}
								paramKey="kategoria"
								params={params}
							/>
							<FilterGroup
								title="Cena"
								options={PRICE_BUCKETS.map((b) => ({
									value: b.id,
									label: b.label,
								}))}
								active={params.cena}
								paramKey="cena"
								params={params}
							/>
							<FilterGroup
								title="Epoka"
								options={PRODUCT_EPOCHS}
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

						{filtered.length > 0 ? (
							<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
								{filtered.map((product) => (
									<ProductCard key={product.slug} product={product} />
								))}
							</div>
						) : (
							<EmptyState />
						)}
					</div>
				</Container>
			</Section>

			<Section spacing="md" tone="muted">
				<Container size="xl">
					<div className="grid gap-6 rounded-3xl border border-border bg-card p-8 md:grid-cols-2 md:p-12">
						<div>
							<Eyebrow>Nie widzisz tego, czego szukasz?</Eyebrow>
							<h2 className="mt-3 font-display text-3xl font-semibold leading-tight md:text-4xl">
								Napisz — doradzimy z naszej kolejnej dostawy
							</h2>
							<p className="mt-3 max-w-lg text-foreground/70">
								Co 2 tygodnie wracamy z Wiednia z 30–50 nowymi przedmiotami. Powiedz, czego szukasz
								— odezwiemy się gdy znajdziemy coś idealnego.
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
					const next = mergeParams(params, {
						[paramKey]: isActive ? undefined : option.value,
					});
					return (
						<li key={option.value}>
							<Link
								href={`/sklep${next}`}
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

function mergeParams(current: SearchParams, next: Partial<SearchParams>): string {
	const result = { ...current, ...next };
	const search = new URLSearchParams();
	for (const [key, value] of Object.entries(result)) {
		if (value && typeof value === "string") search.set(key, value);
	}
	const stringified = search.toString();
	return stringified ? `?${stringified}` : "";
}
