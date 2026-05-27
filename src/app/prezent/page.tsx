import type { Metadata } from "next";
import Link from "next/link";
import {
	ArrowRightIcon,
	CheckIcon,
	ChevronDownIcon,
	GiftIcon,
	HeartIcon,
	PackageIcon,
} from "@/components/icons";
import { Breadcrumbs, Container, CtaLink, Eyebrow, Lead, Section } from "@/components/primitives";
import { ProductCard } from "@/components/product-card";
import { GiftBudgetTiles } from "@/components/sections/gift-budget-tiles";
import { GiftThemes } from "@/components/sections/gift-themes";
import { GiftHeroProduct, pickGiftHeroProduct } from "./gift-hero-product";
import { SmoothScrollAnchor } from "./smooth-scroll-anchor";
import { PRICE_BUCKETS } from "@/lib/products";
import { listProducts } from "@/lib/products/queries";

export const metadata: Metadata = {
	title: "Prezent z duszą — antyki z Wiednia",
	description:
		"Każdy nasz przedmiot ma prawdziwą historię. Filtruj po budżecie i wybierz prezent, który zostanie zapamiętany.",
};

const BUDGET_TILES = PRICE_BUCKETS.map((bucket) => ({
	...bucket,
	caption: bucketCaption(bucket.id),
}));

function bucketCaption(id: string) {
	switch (id) {
		case "do-100":
			return "Drobne porcelany, szkło, ramki";
		case "100-300":
			return "Wazony, figurki, zegary — impuls solo";
		case "300-500":
			return "Meble drobne, zestawy, lampy";
		case "500-plus":
			return "Meble, unikaty kolekcjonerskie";
		default:
			return "";
	}
}

export default async function PrezentPage() {
	const PRODUCTS = await listProducts();
	const giftPicks = PRODUCTS.filter((product) => product.giftBestseller).slice(0, 6);
	const heroProduct = pickGiftHeroProduct(PRODUCTS);

	return (
		<main id="main" className="flex flex-col">
			<Section spacing="md" className="overflow-hidden bg-transparent !pt-10 md:!pt-12">
				<div
					aria-hidden
					className="absolute inset-0 -z-10"
					style={{
						backgroundImage:
							"radial-gradient(60% 50% at 90% 0%, oklch(0.74 0.10 80 / 0.22), transparent 60%), radial-gradient(50% 50% at 0% 100%, oklch(0.43 0.07 150 / 0.15), transparent 60%), linear-gradient(180deg, oklch(0.97 0.012 80) 0%, oklch(0.94 0.013 75) 100%)",
					}}
				/>
				<Container size="xl">
					<div className="grid gap-x-12 gap-y-8 lg:grid-cols-[1.1fr_0.9fr]">
						<Breadcrumbs
							className="lg:col-start-1 lg:row-start-1 lg:self-start"
							items={[{ label: "Home", href: "/" }, { label: "Prezent z duszą" }]}
						/>
						<div className="lg:col-start-1 lg:row-start-2">
							<Eyebrow>Prezent z duszą</Eyebrow>
							<h1 className="mt-3 font-display text-[clamp(2.4rem,5.5vw,4.4rem)] font-semibold leading-[1.04]">
								Podaruj upominek z historią
							</h1>
							<Lead className="mt-6">
								Każdy przedmiot ma za sobą kilkadziesiąt lat życia w Wiedniu. Dajesz w prezencie coś,
								co przetrwało epoki — i ma jeszcze co opowiedzieć.
							</Lead>
							<div className="mt-8 flex flex-wrap items-center gap-3">
								<SmoothScrollAnchor href="#budzet">
									Wybierz po budżecie
									<ChevronDownIcon className="size-4" aria-hidden="true" />
								</SmoothScrollAnchor>
								<CtaLink href="/sklep" variant="primary">
									Zobacz sklep
								</CtaLink>
							</div>
						</div>
						<GiftHeroProduct
							product={heroProduct}
							className="lg:col-start-2 lg:row-start-1 lg:row-span-2 lg:self-start"
						/>
					</div>
				</Container>
			</Section>

			<Section spacing="lg" id="budzet" className="scroll-mt-24">
				<Container size="xl">
					<header className="mb-10 max-w-2xl">
						<Eyebrow>Filtr budżetowy</Eyebrow>
						<h2 className="mt-3 font-display text-4xl font-semibold leading-tight md:text-5xl">
							Wybierz po budżecie
						</h2>
						<p className="mt-3 text-foreground/70">
							Od drobnej niespodzianki po wyjątkowy unikat — wybierz widełki, które pasują do okazji
							i portfela.
						</p>
					</header>
					<GiftBudgetTiles tiles={BUDGET_TILES} />
				</Container>
			</Section>

			<Section spacing="lg">
				<Container size="xl">
					<header className="mb-10 max-w-2xl">
						<Eyebrow>Po okazji</Eyebrow>
						<h2 className="mt-3 font-display text-4xl font-semibold leading-tight md:text-5xl">
							Wybierz po okazji
						</h2>
						<p className="mt-3 text-foreground/70">
							Cztery najczęstsze powody, dla których nasi klienci szukają prezentu.
						</p>
					</header>
					<GiftThemes />
				</Container>
			</Section>

			<Section spacing="lg" tone="muted">
				<Container size="xl">
					<header className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
						<div>
							<Eyebrow>Polecane na prezent</Eyebrow>
							<h2 className="mt-3 font-display text-4xl font-semibold leading-tight md:text-5xl">
								Bestsellery prezentowe
							</h2>
						</div>
						<Link
							href="/sklep"
							className="group/cta inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-foreground hover:text-terracotta"
						>
							Zobacz wszystkie prezenty
							<ArrowRightIcon className="size-4" />
						</Link>
					</header>
					<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
						{giftPicks.map((product, index) => (
							<ProductCard
								key={product.slug}
								product={product}
								source="/prezent"
								position={index + 1}
							/>
						))}
					</div>
				</Container>
			</Section>

			<Section spacing="lg">
				<Container size="xl">
					<div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
						<div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl border border-border bg-card">
							<div
								aria-hidden
								className="absolute inset-0"
								style={{
									backgroundImage:
										"radial-gradient(80% 60% at 30% 30%, oklch(0.92 0.04 80), transparent 60%), linear-gradient(160deg, oklch(0.78 0.06 60), oklch(0.52 0.15 38))",
								}}
							/>
							<div className="relative flex h-full items-end p-6 text-ink-foreground">
								<p className="rounded-2xl border border-ink-foreground/30 bg-ink-foreground/15 p-5 font-display text-lg italic leading-snug backdrop-blur-md">
									Każdy element starannie zapakowany. Karta z historią dla obdarowanego.
									Dedykacja od&nbsp;ręki.
								</p>
							</div>
						</div>
						<div>
							<Eyebrow>Pakowanie z duszą</Eyebrow>
							<h2 className="mt-3 font-display text-4xl font-semibold leading-tight md:text-5xl">
								Każdy prezent pakujemy elegancko
							</h2>
							<ul className="mt-6 space-y-3 text-foreground/80">
								<PackingItem
									icon={<PackageIcon className="size-4" />}
									text="Bibułka ochronna i ozdobna"
								/>
								<PackingItem
									icon={<HeartIcon className="size-4" />}
									text="Karta z historią przedmiotu"
								/>
								<PackingItem icon={<CheckIcon className="size-4" />} text="Wizytówka RetroHouse" />
								<PackingItem
									icon={<GiftIcon className="size-4" />}
									text="Opcjonalna dedykacja w koszyku (+0 zł)"
								/>
								<PackingItem
									icon={<GiftIcon className="size-4" />}
									text="Pakowanie premium w eleganckim pudełku (+25 zł)"
								/>
							</ul>
						</div>
					</div>
				</Container>
			</Section>

			<Section spacing="md" tone="ink">
				<Container size="xl">
					<div className="grid gap-6 rounded-3xl border border-ink-foreground/15 bg-ink-foreground/5 p-8 md:grid-cols-[1.4fr_1fr] md:items-center md:p-12">
						<div>
							<Eyebrow className="text-brass before:bg-brass">Doradzimy</Eyebrow>
							<h2 className="mt-3 font-display text-3xl font-semibold leading-tight md:text-4xl">
								Nie wiesz co wybrać? Napisz — doradzimy
							</h2>
							<p className="mt-2 text-ink-foreground/70">
								Powiedz, dla kogo i jaki budżet — odpiszemy z 3 propozycjami dopasowanymi do okazji.
							</p>
						</div>
						<div className="flex flex-col gap-3 sm:flex-row md:justify-end">
							<CtaLink href="/kontakt" variant="secondary">
								Napisz do nas
							</CtaLink>
							<Link
								href="https://instagram.com/retrohouse"
								target="_blank"
								rel="noreferrer"
								className="inline-flex items-center justify-center rounded-full border border-ink-foreground/20 px-5 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-ink-foreground/80 hover:border-terracotta hover:text-terracotta"
							>
								@retrohouse
							</Link>
						</div>
					</div>
					<p className="mt-6 text-xs text-ink-foreground/60">
						Nie zdążysz? Odbiór osobisty w Nowym Targu tego samego dnia po uprzednim kontakcie.
					</p>
				</Container>
			</Section>
		</main>
	);
}

function PackingItem({ icon, text }: { icon: React.ReactNode; text: string }) {
	return (
		<li className="flex items-start gap-3">
			<span className="mt-0.5 grid size-7 place-items-center rounded-full bg-terracotta/20 text-brass">
				{icon}
			</span>
			<span>{text}</span>
		</li>
	);
}
