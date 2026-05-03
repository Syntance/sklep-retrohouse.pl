import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
	ArrowRightIcon,
	CartIcon,
	CheckIcon,
	InstagramIcon,
	PackageIcon,
	ShieldIcon,
	ZoomIcon,
} from "@/components/icons";
import { JsonLd } from "@/components/json-ld";
import { Breadcrumbs, Container, CtaLink, Eyebrow, Section } from "@/components/primitives";
import { ProductCard } from "@/components/product-card";
import { formatPrice } from "@/lib/format";
import { getProductBySlug, getRelatedProducts, PRODUCTS, type Product } from "@/lib/mock/products";
import { cn } from "@/lib/utils";

export function generateStaticParams() {
	return PRODUCTS.map((product) => ({ slug: product.slug }));
}

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
	const { slug } = await params;
	const product = getProductBySlug(slug);
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

export default async function ProduktPage({ params }: { params: Params }) {
	const { slug } = await params;
	const product = getProductBySlug(slug);
	if (!product) notFound();

	const related = getRelatedProducts(slug, 4);

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
		<main id="main" className="flex flex-col">
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
						<Gallery product={product} />
						<InfoPanel product={product} />
					</div>
				</Container>
			</Section>

			<Section spacing="lg" tone="muted">
				<Container size="md">
					<div className="grid gap-8 md:grid-cols-[1fr_1.3fr] md:items-start">
						<div>
							<Eyebrow>Pochodzenie</Eyebrow>
							<h2 className="mt-3 font-display text-3xl font-semibold leading-tight md:text-4xl">
								Historia tego przedmiotu
							</h2>
						</div>
						<div className="space-y-4 text-pretty text-base leading-relaxed text-foreground/80 md:text-lg">
							<p>{product.story}</p>
							<dl className="grid gap-3 rounded-2xl border border-border bg-card p-5 text-sm md:grid-cols-2">
								<DetailRow
									label="Skąd"
									value={`Odkupiony od właściciela kamienicy w ${product.districtVienna}`}
								/>
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
						<DefinitionRow label="Pochodzenie" value={product.districtVienna} />
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
								<ProductCard key={item.slug} product={item} />
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
		</main>
	);
}

function manufacturerEra(product: Product) {
	const year = product.addedAt.slice(0, 4);
	return product.story.match(/\d{4}/)?.[0] ?? year;
}

function Gallery({ product }: { product: Product }) {
	const [primary, secondary, accent] = product.imageHues;
	const slots = [
		{ label: "Całość", weight: 1 },
		{ label: "Detal", weight: 0.85 },
		{ label: "Skala", weight: 0.7 },
		{ label: "Aranżacja", weight: 0.55 },
		{ label: "Patyna", weight: 0.4 },
	];
	return (
		<div className="grid gap-3">
			<figure className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-border bg-card">
				<div
					aria-hidden
					className="absolute inset-0"
					style={{
						backgroundImage: `radial-gradient(120% 80% at 30% 20%, ${primary}, transparent 60%), radial-gradient(80% 80% at 80% 90%, ${secondary}, transparent 70%), linear-gradient(135deg, ${accent}, ${primary})`,
					}}
				/>
				<div className="absolute right-4 top-4 inline-flex items-center gap-2 rounded-full bg-ink-foreground/85 px-3 py-1.5 text-xs font-semibold text-foreground backdrop-blur">
					<ZoomIcon className="size-3.5" />
					Zoom on hover
				</div>
				<figcaption className="absolute bottom-4 left-4 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-ink-foreground drop-shadow">
					Główne zdjęcie · {product.name}
				</figcaption>
			</figure>
			<ul className="grid grid-cols-5 gap-2">
				{slots.map((slot, index) => (
					<li
						key={slot.label}
						className="relative aspect-square overflow-hidden rounded-xl border border-border bg-card"
					>
						<div
							aria-hidden
							className="absolute inset-0"
							style={{
								backgroundImage: `linear-gradient(${index * 30}deg, ${primary}, ${secondary} 60%, ${accent})`,
								opacity: slot.weight,
							}}
						/>
						<span className="absolute inset-x-1 bottom-1 rounded bg-ink-foreground/80 px-1.5 py-0.5 text-center text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-foreground">
							{slot.label}
						</span>
					</li>
				))}
			</ul>
		</div>
	);
}

function InfoPanel({ product }: { product: Product }) {
	return (
		<aside className="flex flex-col gap-6 lg:sticky lg:top-24 lg:self-start">
			<div className="flex flex-wrap gap-2">
				<span className="rounded-full bg-ink px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-ink-foreground">
					Unikat — 1 z 1
				</span>
				{product.badges.includes("fresh") ? (
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
				{formatPrice(product.price)}
			</p>

			<form action="/api/cart" method="post" className="flex flex-col gap-3">
				<input type="hidden" name="slug" value={product.slug} />
				<button
					type="submit"
					className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-terracotta px-6 text-sm font-semibold uppercase tracking-[0.08em] text-terracotta-foreground shadow-md transition-transform hover:translate-y-[-1px] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
				>
					<CartIcon className="size-4" />
					Dodaj do koszyka
				</button>
				<Link
					href={`/kontakt?subject=produkt&slug=${product.slug}`}
					className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-border bg-card text-sm font-semibold uppercase tracking-[0.16em] text-foreground transition-colors hover:border-terracotta hover:text-terracotta"
				>
					Zapytaj o ten przedmiot
				</Link>
				<Link
					href={`/dla-projektantow#brief?slug=${product.slug}`}
					className="inline-flex items-center gap-1.5 self-start text-xs font-semibold uppercase tracking-[0.16em] text-foreground/70 hover:text-terracotta"
				>
					Jesteś projektantem? Rezerwacja 14 dni i FV
					<ArrowRightIcon className="size-3" />
				</Link>
			</form>

			<ul className="grid gap-2.5 rounded-2xl border border-border bg-cream p-4 text-sm">
				<TrustItem
					icon={<PackageIcon className="size-4" />}
					label="Ubezpieczona wysyłka"
					value="2–3 dni · darmowa od 500 zł"
				/>
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
