import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
	ArrowRightIcon,
	CheckIcon,
	InstagramIcon,
	PackageIcon,
	PinIcon,
	ShieldIcon,
} from "@/components/icons";
import { JsonLd } from "@/components/json-ld";
import { Breadcrumbs, Container, CtaLink, Eyebrow, Section } from "@/components/primitives";
import { ProductCard } from "@/components/product-card";
import { ProductCtaBlock } from "@/components/product-cta-block";
import { ProductLightbox } from "@/components/product-lightbox";
import { ProductMobileBar } from "@/components/product-mobile-bar";
import type { ProductSource } from "@/lib/analytics/events";
import { daysSince, formatPrice } from "@/lib/format";
import {
	getProductBySlug,
	getProductSlugs,
	getRelatedProducts,
} from "@/lib/products/queries";
import type { Product } from "@/lib/products/types";
import { cn } from "@/lib/utils";

const FRESH_THRESHOLD_DAYS = 14;
const KNOWN_SOURCES = new Set<ProductSource>([
	"/sklep",
	"/prezent",
	"hp-bestsellers",
	"/blog",
	"pdp-related",
	"/",
]);

function resolveSource(raw: string | string[] | undefined): ProductSource | "direct" {
	if (typeof raw !== "string") return "direct";
	return KNOWN_SOURCES.has(raw as ProductSource) ? (raw as ProductSource) : "direct";
}

export const revalidate = 60;

export async function generateStaticParams() {
	const slugs = await getProductSlugs();
	return slugs.map((slug) => ({ slug }));
}

type Params = Promise<{ slug: string }>;
type SearchParams = Promise<{ source?: string | string[] }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
	const { slug } = await params;
	const product = await getProductBySlug(slug);
	if (!product) return {};
	return {
		title: `${product.name} — ${product.epochLabel}`,
		description: product.shortDescription,
		alternates: { canonical: `/sklep/${product.slug}` },
		openGraph: {
			title: product.name,
			description: product.shortDescription,
			type: "website",
		},
	};
}

export default async function ProduktPage({
	params,
	searchParams,
}: {
	params: Params;
	searchParams: SearchParams;
}) {
	const { slug } = await params;
	const { source: rawSource } = await searchParams;
	const product = await getProductBySlug(slug);
	if (!product) notFound();

	const source = resolveSource(rawSource);
	const related = await getRelatedProducts(slug, 4);
	const isFresh = daysSince(product.addedAt) < FRESH_THRESHOLD_DAYS;

	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "Product",
		name: product.name,
		description: product.shortDescription,
		brand: { "@type": "Brand", name: product.manufacturer },
		category: product.categoryLabel,
		offers: {
			"@type": "Offer",
			price: product.price,
			priceCurrency: "PLN",
			availability: "https://schema.org/InStock",
			itemCondition: "https://schema.org/UsedCondition",
		},
	};

	return (
		<main id="main" className="flex flex-col pb-32 lg:pb-0">
			<Section spacing="sm">
				<Container size="xl">
					<Breadcrumbs
						items={[
							{ label: "Home", href: "/" },
							{ label: "Sklep", href: "/sklep" },
							{
								label: product.categoryLabel,
								href: `/sklep?kategoria=${product.category}`,
							},
							{ label: product.name },
						]}
					/>
				</Container>
			</Section>

			<Section spacing="md" bleed className="pb-16 md:pb-24">
				<Container size="xl">
					<div className="grid gap-10 lg:grid-cols-[1.2fr_0.9fr]">
						<ProductLightbox
							productName={product.name}
							hues={product.imageHues}
							images={product.images}
						/>
						<InfoPanel product={product} source={source} isFresh={isFresh} />
					</div>
				</Container>
			</Section>

			<Section spacing="lg" tone="muted">
				<Container size="md">
					<div className="grid gap-8 md:grid-cols-[1fr_1.3fr] md:items-start">
						<div>
							<Eyebrow>Historia</Eyebrow>
							<h2 className="mt-3 font-display text-3xl font-semibold leading-tight md:text-4xl">
								Historia tego przedmiotu
							</h2>
						</div>
						<div className="space-y-4 text-pretty text-base leading-relaxed text-foreground/80 md:text-lg">
							<p>{product.story}</p>
							<dl className="grid gap-3 rounded-2xl border border-border bg-card p-5 text-sm md:grid-cols-2">
								<DetailRow
									label="Epoka"
									value={`${product.epochLabel}, ${manufacturerEra(product)}`}
								/>
								{product.signature ? (
									<DetailRow label="Sygnatura" value={product.signature} />
								) : null}
								<DetailRow label="Stan" value={product.condition} />
							</dl>
						</div>
					</div>
				</Container>
			</Section>

			<Section spacing="md">
				<Container size="md">
					<Eyebrow>Szczegóły</Eyebrow>
					<h2 className="mt-3 font-display text-3xl font-semibold leading-tight md:text-4xl">
						Wszystko, co warto wiedzieć
					</h2>
					<dl className="mt-8 grid gap-y-4 sm:grid-cols-[200px_1fr]">
						<DefinitionRow label="Kategoria" value={product.categoryLabel} />
						<DefinitionRow
							label="Epoka / styl"
							value={`${product.epochLabel} · ${manufacturerEra(product)}`}
						/>
						<DefinitionRow label="Producent" value={product.manufacturer} />
						<DefinitionRow label="Wymiary" value={product.dimensions} />
						<DefinitionRow label="Stan" value={product.condition} />
						{product.signature ? (
							<DefinitionRow label="Sygnatura" value={`${product.signature} (zdjęcie w galerii)`} />
						) : null}
					</dl>
				</Container>
			</Section>

			{related.length > 0 ? (
				<Section spacing="lg" tone="muted">
					<Container size="xl">
						<header className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
							<div>
								<Eyebrow>Może Cię zainteresować</Eyebrow>
								<h2 className="mt-3 font-display text-3xl font-semibold leading-tight md:text-4xl">
									Z tej samej kolekcji
								</h2>
							</div>
							<Link
								href="/sklep"
								className="group/cta inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-foreground hover:text-terracotta"
							>
								Zobacz wszystkie
								<ArrowRightIcon className="size-4" />
							</Link>
						</header>
						<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
							{related.map((item) => (
								<ProductCard
									key={item.slug}
									product={item}
									source="pdp-related"
									fromProductId={product.slug}
								/>
							))}
						</div>
					</Container>
				</Section>
			) : null}

			<Section spacing="md">
				<Container size="md">
					<div className="flex flex-col items-start gap-4 rounded-2xl border border-border bg-card p-8 md:flex-row md:items-center md:justify-between">
						<div>
							<p className="font-display text-2xl">Masz pytania?</p>
							<p className="mt-1 text-sm text-foreground/70">
								Napisz lub przyjdź do sklepu w Nowym Targu — pokażemy przedmiot z bliska.
							</p>
						</div>
						<div className="flex flex-wrap gap-3">
							<CtaLink href="/kontakt">Zapytaj o ten przedmiot</CtaLink>
							<Link
								href="https://instagram.com/retrohouse"
								target="_blank"
								rel="noreferrer"
								className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-foreground/70 hover:text-terracotta"
							>
								<InstagramIcon className="size-4" />
								@retrohouse
							</Link>
						</div>
					</div>
				</Container>
			</Section>

			<JsonLd data={jsonLd} id="product-jsonld" />
			<ProductMobileBar product={product} />
		</main>
	);
}

function manufacturerEra(product: Product) {
	const year = product.addedAt.slice(0, 4);
	return product.story.match(/\d{4}/)?.[0] ?? year;
}

type InfoPanelProps = {
	product: Product;
	source: ProductSource | "direct";
	isFresh: boolean;
};

function InfoPanel({ product, source, isFresh }: InfoPanelProps) {
	return (
		<aside className="flex flex-col gap-6 lg:sticky lg:top-24 lg:self-start">
			<div className="flex flex-wrap gap-2">
				<span className="rounded-full bg-ink px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-ink-foreground">
					Unikat — 1 z 1
				</span>
				{isFresh ? (
					<span className="rounded-full bg-success px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-success-foreground">
						Świeża dostawa
					</span>
				) : null}
				{product.badges.includes("bestseller") ? (
					<span className="rounded-full bg-terracotta px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-foreground">
						Bestseller
					</span>
				) : null}
			</div>

			<div>
				<p className="font-sans text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-brass">
					{product.categoryLabel} · {product.epochLabel}
				</p>
				<h1 className="mt-2 font-display text-4xl font-semibold leading-tight md:text-5xl">
					{product.name}
				</h1>
			</div>

			<p className="text-pretty text-base leading-relaxed text-foreground/80">
				{product.shortDescription}
			</p>

		<p className="font-display text-4xl font-semibold tabular text-foreground">
			{formatPrice(product.price, product.currencyCode)}
		</p>

		{product.pickupOnly ? (
			<div
				role="note"
				className="flex items-start gap-3 rounded-2xl border border-terracotta/30 bg-terracotta/10 p-4"
			>
				<span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-terracotta/15 text-terracotta">
					<PinIcon className="size-4" />
				</span>
				<div>
					<p className="font-display text-base font-semibold text-foreground">
						Tylko odbiór osobisty
					</p>
					<p className="mt-0.5 text-sm leading-relaxed text-foreground/70">
						Ten przedmiot nie jest wysyłany. Odbierzesz go w sklepie w Nowym Targu — po
						zamówieniu skontaktujemy się, aby ustalić termin.
					</p>
				</div>
			</div>
		) : null}

		<ProductCtaBlock product={product} source={source} />

		{/* Nota prawna po CTA — UPK art. 43a ust. 4 */}
		<p className="text-sm text-foreground/60 leading-relaxed">
			W koszyku potwierdzisz, że znasz i akceptujesz opis stanu przedmiotu.{" "}
			<a
				href="/reklamacje"
				className="underline underline-offset-4 hover:text-foreground transition-colors"
			>
				Dlaczego?
			</a>
		</p>

		<ul className="grid gap-2.5 rounded-2xl border border-border bg-cream p-4 text-sm">
				{product.pickupOnly ? (
					<TrustItem
						icon={<PinIcon className="size-4" />}
						label="Odbiór osobisty"
						value="Nowy Targ · termin ustalany po zamówieniu"
					/>
				) : (
					<TrustItem
						icon={<PackageIcon className="size-4" />}
						label="Ubezpieczona wysyłka"
						value="2–3 dni · darmowa od 500 zł"
					/>
				)}
				<TrustItem
					icon={<ShieldIcon className="size-4" />}
					label="Pewność pochodzenia"
					value="100% bezpośrednio z Wiednia"
				/>
			<TrustItem
				icon={<CheckIcon className="size-4" />}
				label="14 dni na zwrot"
				value="bez podania przyczyny"
			/>
		</ul>

		{/* Nota o odstąpieniu — UPK art. 27 */}
		<p className="text-sm text-foreground/60 leading-relaxed">
			📋 14 dni na odstąpienie ·{" "}
			<a
				href="/odstapienie"
				className="underline underline-offset-4 hover:text-foreground transition-colors"
			>
				/odstapienie
			</a>{" "}
			·{" "}
			<a
				href="/reklamacje"
				className="underline underline-offset-4 hover:text-foreground transition-colors"
			>
				/reklamacje
			</a>
		</p>
	</aside>
);
}

function TrustItem({
	icon,
	label,
	value,
}: {
	icon: React.ReactNode;
	label: string;
	value: string;
}) {
	return (
		<li className="flex items-start gap-3">
			<span className="mt-0.5 grid size-7 place-items-center rounded-full bg-background text-brass">
				{icon}
			</span>
			<div>
				<p className="font-sans text-xs font-semibold uppercase tracking-[0.14em] text-foreground/60">
					{label}
				</p>
				<p className="text-sm text-foreground">{value}</p>
			</div>
		</li>
	);
}

function DetailRow({ label, value }: { label: string; value: string }) {
	return (
		<div>
			<dt className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-foreground/60">
				{label}
			</dt>
			<dd className={cn("mt-1 text-sm text-foreground")}>{value}</dd>
		</div>
	);
}

function DefinitionRow({ label, value }: { label: string; value: string }) {
	return (
		<div className="contents">
			<dt className="border-b border-border py-3 text-sm font-semibold uppercase tracking-[0.14em] text-foreground/60">
				{label}
			</dt>
			<dd className="border-b border-border py-3 text-sm text-foreground">{value}</dd>
		</div>
	);
}
