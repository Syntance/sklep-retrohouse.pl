import type { Metadata } from "next";
import Link from "next/link";
import {
	ArrowRightIcon,
	CheckIcon,
	GiftIcon,
	HeartIcon,
	InstagramIcon,
	PackageIcon,
} from "@/components/icons";
import { Breadcrumbs, Container, CtaLink, Eyebrow, Lead, Section } from "@/components/primitives";
import { ProductCard } from "@/components/product-card";
import { PRICE_BUCKETS, PRODUCTS } from "@/lib/mock/products";

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

export default function PrezentPage() {
	const giftPicks = [...PRODUCTS].sort((a, b) => b.popularity - a.popularity).slice(0, 6);

	return (
		<main id="main" className="flex flex-col">
			<Section spacing="sm">
				<Container size="xl">
					<Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Prezent z duszą" }]} />
				</Container>
			</Section>

			<Section spacing="lg" className="overflow-hidden">
				<div
					aria-hidden
					className="absolute inset-0 -z-10"
					style={{
						backgroundImage:
							"radial-gradient(60% 50% at 90% 0%, oklch(0.74 0.10 80 / 0.22), transparent 60%), radial-gradient(50% 50% at 0% 100%, oklch(0.43 0.07 150 / 0.15), transparent 60%), linear-gradient(180deg, oklch(0.97 0.012 80) 0%, oklch(0.94 0.013 75) 100%)",
					}}
				/>
				<Container size="xl">
					<div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
						<div>
							<Eyebrow>Prezent z duszą</Eyebrow>
							<h1 className="mt-3 font-display text-[clamp(2.4rem,5.5vw,4.4rem)] font-semibold leading-[1.04]">
								Prezent z duszą — nie z fabryki
							</h1>
							<Lead className="mt-6">
								Każdy nasz przedmiot ma prawdziwą historię. Podaruj coś wyjątkowego — z bibułką,
								kartą historii i opcjonalną dedykacją.
							</Lead>
							<div className="mt-8 flex flex-wrap items-center gap-3">
								<CtaLink href="#budzet" variant="primary">
									Wybierz po budżecie
								</CtaLink>
								<CtaLink href="/kontakt" variant="ghost">
									Nie wiem co wybrać — doradźcie
								</CtaLink>
							</div>
						</div>
						<div className="relative aspect-[5/6] w-full overflow-hidden rounded-3xl border border-border bg-card shadow-xl">
							<div
								aria-hidden
								className="absolute inset-0"
								style={{
									backgroundImage:
										"radial-gradient(70% 60% at 30% 20%, oklch(0.92 0.04 80), transparent 60%), linear-gradient(160deg, oklch(0.74 0.10 80), oklch(0.39 0.06 245))",
								}}
							/>
							<div className="relative flex h-full flex-col justify-between p-6 text-background sm:p-8">
								<span className="rounded-full bg-foreground/85 px-3 py-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-background backdrop-blur">
									Pakowanie · bibułka + karta historii
								</span>
								<p className="rounded-2xl border border-background/30 bg-background/15 p-5 font-display text-lg italic leading-snug backdrop-blur-md">
									„Otworzyłam paczkę i miałam wrażenie, że dostałam list z przeszłości."
								</p>
							</div>
						</div>
					</div>
				</Container>
			</Section>

			<Section spacing="lg" id="budzet">
				<Container size="xl">
					<header className="mb-10 max-w-2xl">
						<Eyebrow>Filtr budżetowy</Eyebrow>
						<h2 className="mt-3 font-display text-4xl font-semibold leading-tight md:text-5xl">
							Wybierz po budżecie
						</h2>
						<p className="mt-3 text-foreground/70">
							Progi zsynchronizowane z filtrami /sklep i z progiem decyzyjnym „impuls solo" segmentu
							B (300 zł).
						</p>
					</header>
					<ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
						{BUDGET_TILES.map((bucket) => (
							<li key={bucket.id}>
								<Link
									href={`/sklep?cena=${bucket.id}`}
									className="group/budget flex h-full flex-col justify-between gap-3 rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-0.5 hover:border-brass hover:shadow-md"
								>
									<span className="grid size-10 place-items-center rounded-full bg-brass text-foreground">
										<GiftIcon className="size-5" />
									</span>
									<span className="font-display text-2xl font-semibold leading-tight">
										{bucket.label}
									</span>
									<span className="text-sm text-foreground/70">{bucket.caption}</span>
									<span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.16em] text-foreground">
										Filtruj sklep
										<ArrowRightIcon className="size-3.5 transition-transform group-hover/budget:translate-x-0.5" />
									</span>
								</Link>
							</li>
						))}
					</ul>
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
							className="group/cta inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-foreground hover:text-brass"
						>
							Zobacz wszystkie prezenty
							<ArrowRightIcon className="size-4" />
						</Link>
					</header>
					<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
						{giftPicks.map((product) => (
							<ProductCard key={product.slug} product={product} source="/prezent" />
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
										"radial-gradient(80% 60% at 30% 30%, oklch(0.92 0.04 80), transparent 60%), linear-gradient(160deg, oklch(0.78 0.06 60), oklch(0.43 0.07 150))",
								}}
							/>
							<div className="relative flex h-full items-end p-6 text-background">
								<p className="rounded-2xl border border-background/30 bg-background/15 p-5 font-display text-lg italic leading-snug backdrop-blur-md">
									„Bibułka, karta z historią, wizytówka — paczka jak prezent sam w sobie."
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
					<div className="grid gap-6 rounded-3xl border border-background/15 bg-background/5 p-8 md:grid-cols-[1.4fr_1fr] md:items-center md:p-12">
						<div>
							<Eyebrow className="text-brass before:bg-brass/60">Doradzimy</Eyebrow>
							<h2 className="mt-3 font-display text-3xl font-semibold leading-tight md:text-4xl">
								Nie wiesz co wybrać? Napisz — doradzimy
							</h2>
							<p className="mt-2 text-background/70">
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
								className="inline-flex items-center justify-center gap-2 rounded-full border border-background/20 px-5 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-background/80 hover:border-brass hover:text-brass"
							>
								<InstagramIcon className="size-4" />
								DM @retrohouse
							</Link>
						</div>
					</div>
					<p className="mt-6 text-xs text-background/60">
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
			<span className="mt-0.5 grid size-7 place-items-center rounded-full bg-brass/20 text-brass">
				{icon}
			</span>
			<span>{text}</span>
		</li>
	);
}
