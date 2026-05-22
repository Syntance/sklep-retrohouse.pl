import type { Metadata } from "next";
import {
	CompassIcon,
	HeartIcon,
	PackageIcon,
	PaletteIcon,
	PinIcon,
	ScrollIcon,
	ShieldIcon,
} from "@/components/icons";
import { STORE_INFO } from "@/components/layout/site-header/nav-data";
import { Breadcrumbs, Container, CtaLink, Eyebrow, Lead, Section } from "@/components/primitives";
import { AboutCtaCards } from "@/components/sections/about-cta-cards";
import { StoreMap } from "@/components/sections/store-map";

export const metadata: Metadata = {
	title: "O nas — ratujemy skarby z wiedeńskich kamienic",
	description:
		"Odkupujemy antyki bezpośrednio od prywatnych właścicieli wiedeńskich mieszkań. Bez hurtowni i pośredników — 100% pewność pochodzenia.",
};

const TIMELINE = [
	{
		icon: <PinIcon className="size-5" />,
		label: "Wiedeń",
		description: "Pukamy do drzwi prywatnych mieszkań we Wiedniu.",
	},
	{
		icon: <ScrollIcon className="size-5" />,
		label: "Odkup od właściciela",
		description:
			"Negocjujemy bezpośrednio z osobami pozbywającymi się przedmiotów przy remontach i przeprowadzkach.",
	},
	{
		icon: <CompassIcon className="size-5" />,
		label: "Selekcja",
		description:
			"Wybieramy unikaty z udokumentowaną historią. Stan, sygnatura, pochodzenie — sprawdzone na miejscu.",
	},
	{
		icon: <PackageIcon className="size-5" />,
		label: "Transport",
		description: "Każdy przedmiot pakujemy i ubezpieczamy. Trasa Wiedeń → Nowy Targ to ok. 480 km.",
	},
	{
		icon: <PaletteIcon className="size-5" />,
		label: "Nowy Targ",
		description:
			"Inwentaryzacja, opisy, fotografia w naturalnym świetle. Karta historii dla każdego przedmiotu.",
	},
	{
		icon: <HeartIcon className="size-5" />,
		label: "Twój dom",
		description: "Drugie życie. Bibułka, wizytówka i karta historii w każdym pakiecie.",
	},
];

/**
 * Sekcja „Twórcy" — bez fabricated bio. Strategia Notion mówi:
 * „Zdjęcia założycieli + krótkie bio (2–3 zdania każde) — ludzie budują zaufanie",
 * ale nie podaje imion ani biografii. Zamiast wymyślać dane, prezentujemy dwie
 * role w procesie (Wiedeń + NT) — to sedno przewagi marki.
 *
 * Po dostarczeniu zdjęć i bio przez klienta sekcja zostanie wymieniona na
 * `<FoundersGrid>` z prawdziwymi danymi (Sanity).
 */
const FOUNDER_ROLES = [
	{
		eyebrow: "Wiedeń",
		title: "Selekcja u źródła",
		description:
			"Pukamy do drzwi prywatnych mieszkań, słuchamy historii, sprawdzamy sygnatury. Każda dostawa to 30–50 godzin rozmów u właścicieli.",
		hue: "oklch(0.74 0.10 80)",
	},
	{
		eyebrow: "Nowy Targ",
		title: "Karta historii i pakowanie",
		description:
			"Inwentaryzacja, fotografia w naturalnym świetle, opis stanu, karta historii. Każda paczka pakowana ręcznie z bibułką i wizytówką.",
		hue: "oklch(0.39 0.07 45)",
	},
];

const VALUES = [
	{
		icon: <HeartIcon className="size-5" />,
		title: "Autentyczność",
		description: "Każdy przedmiot z potwierdzoną historią — wiemy, z której kamienicy pochodzi.",
	},
	{
		icon: <ShieldIcon className="size-5" />,
		title: "Drugie życie",
		description:
			"Przedmioty trafiają w nowe ręce zamiast na strych albo wysypisko. Vintage = sustainable.",
	},
	{
		icon: <CompassIcon className="size-5" />,
		title: "Uczciwość",
		description:
			"Transparentny stan, realne zdjęcia, ceny bez pośredników. Bez snobizmu, bez ściemy.",
	},
];

export default function ONasPage() {
	return (
		<main id="main" className="flex flex-col">
			<Section spacing="sm">
				<Container size="xl">
					<Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "O nas" }]} />
				</Container>
			</Section>

			<Section spacing="lg" className="overflow-hidden">
				<div
					aria-hidden
					className="absolute inset-0 -z-10"
					style={{
						backgroundImage:
							"radial-gradient(60% 50% at 80% 0%, oklch(0.74 0.10 80 / 0.18), transparent 60%), linear-gradient(180deg, oklch(0.97 0.012 80) 0%, oklch(0.94 0.013 75) 100%)",
					}}
				/>
				<Container size="xl">
					<div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
						<div>
							<Eyebrow>O nas</Eyebrow>
							<h1 className="mt-3 font-display text-[clamp(2.4rem,5.5vw,4.4rem)] font-semibold leading-[1.04]">
								Ratujemy skarby z wiedeńskich kamienic
							</h1>
							<Lead className="mt-6">
								Odkupujemy antyki bezpośrednio od prywatnych właścicieli wiedeńskich mieszkań. Bez
								hurtowni i pośredników — 100% pewność pochodzenia. Sklep w Nowym Targu, wysyłka w
								całej Polsce.
							</Lead>
							<div className="mt-8 flex flex-wrap items-center gap-3">
								<CtaLink href="/sklep" variant="primary">
									Zobacz nasze antyki
								</CtaLink>
								<CtaLink href="/kontakt" variant="ghost">
									Odwiedź sklep w Nowym Targu
								</CtaLink>
							</div>
						</div>

						<div className="relative aspect-[5/6] w-full overflow-hidden rounded-3xl border border-border bg-card shadow-xl">
							<div
								aria-hidden
								className="absolute inset-0"
								style={{
									backgroundImage:
										"radial-gradient(120% 80% at 30% 20%, oklch(0.92 0.04 80), transparent 60%), linear-gradient(160deg, oklch(0.55 0.08 60), oklch(0.39 0.07 45))",
								}}
							/>
							<div className="relative flex h-full flex-col justify-between p-6 text-ink-foreground sm:p-8">
								<span className="rounded-full bg-ink/85 px-3 py-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-ink-foreground backdrop-blur">
									Behind the scenes · Wiedeń
								</span>
								<p className="rounded-2xl border border-ink-foreground/30 bg-ink-foreground/15 p-5 font-display text-lg italic leading-snug backdrop-blur-md">
									Każda kamienica to rozmowa. Każda rozmowa to historia. Każda historia trafia
									do karty obok przedmiotu.
								</p>
							</div>
						</div>
					</div>
				</Container>
			</Section>

			<Section spacing="lg" tone="muted">
				<Container size="xl">
					<div className="grid gap-10 md:grid-cols-[0.85fr_1.15fr]">
						<div>
							<Eyebrow>Nasza historia</Eyebrow>
							<h2 className="mt-3 font-display text-4xl font-semibold leading-tight md:text-5xl">
								Od kamienicy w Wiedniu do Twojego salonu
							</h2>
							<p className="mt-6 text-foreground/80 md:text-lg">
								RetroHouse to nie kolejny antykwariat. To miejsce, gdzie każdy przedmiot ma
								udokumentowaną historię — bo sami odkupujemy go od właściciela.
							</p>
						</div>
						<ol className="grid gap-4 md:grid-cols-2">
							{TIMELINE.map((step, index) => (
								<li key={step.label} className="rounded-2xl border border-border bg-card p-5">
									<div className="flex items-center gap-2 text-brass">
										{step.icon}
										<span className="font-sans text-[0.65rem] font-semibold uppercase tracking-[0.18em]">
											Etap {String(index + 1).padStart(2, "0")}
										</span>
									</div>
									<p className="mt-3 font-display text-xl">{step.label}</p>
									<p className="mt-1 text-sm text-foreground/70">{step.description}</p>
								</li>
							))}
						</ol>
					</div>
				</Container>
			</Section>

			<Section spacing="lg">
				<Container size="xl">
					<header className="mb-10 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
						<div>
							<Eyebrow>Twórcy</Eyebrow>
							<h2 className="mt-3 font-display text-4xl font-semibold leading-tight md:text-5xl">
								Dwie role, jedna paczka
							</h2>
						</div>
						<p className="max-w-md text-foreground/70">
							Sami jeździmy, sami pakujemy, sami opowiadamy historię. Nie ma pośrednika między
							Tobą a wiedeńskim mieszkaniem.
						</p>
					</header>
					<div className="grid gap-6 md:grid-cols-2">
						{FOUNDER_ROLES.map((role) => (
							<article
								key={role.eyebrow}
								className="group/role flex flex-col gap-5 rounded-3xl border border-border bg-card p-6"
							>
								<div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
									<div
										aria-hidden
										className="absolute inset-0"
										style={{
											backgroundImage: `linear-gradient(160deg, ${role.hue}, oklch(0.27 0.005 280))`,
										}}
									/>
									<div className="relative flex h-full items-end p-5">
										<span className="rounded-full bg-ink-foreground/85 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-foreground backdrop-blur">
											{role.eyebrow}
										</span>
									</div>
								</div>
								<div>
									<p className="font-display text-2xl">{role.title}</p>
									<p className="mt-3 text-foreground/80">{role.description}</p>
								</div>
							</article>
						))}
					</div>
					<p className="mt-6 text-sm text-foreground/60">
						Zdjęcia założycieli i pełne bio dodamy po sesji fotograficznej w sklepie.
					</p>
				</Container>
			</Section>

			<Section spacing="lg" tone="muted">
				<Container size="xl">
					<header className="mb-10 grid gap-3 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
						<div>
							<Eyebrow>Sklep stacjonarny</Eyebrow>
							<h2 className="mt-3 font-display text-4xl font-semibold leading-tight md:text-5xl">
								Odwiedź nas w&nbsp;Nowym Targu
							</h2>
						</div>
						<dl className="grid gap-3 text-sm md:grid-cols-2">
							<div className="flex items-start gap-3">
								<PinIcon className="mt-0.5 size-4 text-terracotta" />
								<div>
									<dt className="font-semibold">Adres</dt>
									<dd className="text-foreground/70">
										{STORE_INFO.streetAddress}, {STORE_INFO.postalCode} {STORE_INFO.city}
									</dd>
								</div>
							</div>
							<div className="flex items-start gap-3">
								<ScrollIcon className="mt-0.5 size-4 text-terracotta" />
								<div>
									<dt className="font-semibold">Godziny otwarcia</dt>
									<dd className="text-foreground/70">{STORE_INFO.hours}</dd>
								</div>
							</div>
						</dl>
					</header>

					<StoreMap
						mapsHref={STORE_INFO.mapsHref}
						googleMapsEmbedSrc={STORE_INFO.googleMapsEmbedSrc}
						streetAddress={STORE_INFO.streetAddress}
						postalCode={STORE_INFO.postalCode}
						city={STORE_INFO.city}
					/>
				</Container>
			</Section>

			<Section spacing="lg">
				<Container size="xl">
					<header className="mb-10 max-w-2xl">
						<Eyebrow>Wartości</Eyebrow>
						<h2 className="mt-3 font-display text-4xl font-semibold leading-tight md:text-5xl">
							Trzy zasady, które trzymają nas w pionie
						</h2>
					</header>
					<ul className="grid gap-4 md:grid-cols-3">
						{VALUES.map((value) => (
							<li key={value.title} className="rounded-2xl border border-border bg-card p-6">
								<span className="grid size-10 place-items-center rounded-full bg-terracotta text-terracotta-foreground">
									{value.icon}
								</span>
								<p className="mt-4 font-display text-xl">{value.title}</p>
								<p className="mt-2 text-sm text-foreground/70">{value.description}</p>
							</li>
						))}
					</ul>
				</Container>
			</Section>

			<Section spacing="lg" tone="ink">
				<Container size="xl">
					<AboutCtaCards
						cards={[
							{
								href: "/sklep",
								eyebrow: "Najszybsza droga",
								title: "Zobacz nasze antyki",
								description: "Świeża dostawa z Wiednia co 2 tygodnie.",
								analytics: { event: "noop" },
							},
							{
								href: "/kontakt",
								eyebrow: "Pytania?",
								title: "Napisz lub zadzwoń",
								description: "Odpowiadamy w ciągu 24h roboczych.",
								analytics: { event: "visit_store_cta_clicked", source: "/o-nas" },
							},
							{
								href: "/dla-projektantow",
								eyebrow: "B2B",
								title: "Współpraca dla projektantów",
								description: "Rezerwacja 14 dni, FV VAT, priorytetowy newsletter.",
								highlight: true,
								analytics: { event: "b2b_landing_clicked", source: "/o-nas" },
							},
						]}
					/>
				</Container>
			</Section>
		</main>
	);
}
