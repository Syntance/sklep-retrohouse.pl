import type { Metadata } from "next";
import Link from "next/link";
import {
	ArrowRightIcon,
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

export const metadata: Metadata = {
	title: "O nas — ratujemy skarby z wiedeńskich kamienic",
	description:
		"Odkupujemy antyki bezpośrednio od prywatnych właścicieli wiedeńskich mieszkań. Bez hurtowni i pośredników — 100% pewność pochodzenia.",
};

const TIMELINE = [
	{
		icon: <PinIcon className="size-5" />,
		label: "Wiedeń",
		description: "Pukamy do drzwi prywatnych mieszkań w 9 dzielnicach.",
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

const FOUNDERS = [
	{
		name: "Magdalena",
		role: "Współzałożycielka · selekcja w Wiedniu",
		bio: "Filolożka germanistyki, zna wiedeńskie kamienice od strony właścicieli — i od strony historii sztuki.",
		hue: "oklch(0.74 0.10 80)",
	},
	{
		name: "Łukasz",
		role: "Współzałożyciel · sklep w Nowym Targu",
		bio: "Były antykwariusz z 12 latami doświadczenia. Pakowanie, fotografia i karta historii — jego robota.",
		hue: "oklch(0.39 0.06 245)",
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
										"radial-gradient(120% 80% at 30% 20%, oklch(0.92 0.04 80), transparent 60%), linear-gradient(160deg, oklch(0.55 0.08 60), oklch(0.39 0.06 245))",
								}}
							/>
							<div className="relative flex h-full flex-col justify-between p-6 text-background sm:p-8">
								<span className="rounded-full bg-foreground/85 px-3 py-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-background backdrop-blur">
									Behind the scenes · Landstraße
								</span>
								<p className="rounded-2xl border border-background/30 bg-background/15 p-5 font-display text-lg italic leading-snug backdrop-blur-md">
									„Dziadek prowadził adwokaturę przy Graben. Po jego śmierci nikt nie umiał się
									zdecydować, co zostawić. Wybierajcie."
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
								Ludzie, którzy pukają do drzwi
							</h2>
						</div>
						<p className="max-w-md text-foreground/70">
							Sami jeździmy, sami pakujemy, sami opowiadamy historię. Nie ma pośrednika między Tobą
							a wiedeńskim mieszkaniem.
						</p>
					</header>
					<div className="grid gap-6 md:grid-cols-2">
						{FOUNDERS.map((founder) => (
							<article
								key={founder.name}
								className="group/founder flex flex-col gap-5 rounded-3xl border border-border bg-card p-6"
							>
								<div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
									<div
										aria-hidden
										className="absolute inset-0"
										style={{
											backgroundImage: `linear-gradient(160deg, ${founder.hue}, oklch(0.27 0.005 280))`,
										}}
									/>
									<div className="relative flex h-full items-end p-5">
										<span className="rounded-full bg-background/85 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-foreground backdrop-blur">
											Współzałożyciel
										</span>
									</div>
								</div>
								<div>
									<p className="font-display text-2xl">{founder.name}</p>
									<p className="text-sm text-brass">{founder.role}</p>
									<p className="mt-3 text-foreground/80">{founder.bio}</p>
								</div>
							</article>
						))}
					</div>
				</Container>
			</Section>

			<Section spacing="lg" tone="muted">
				<Container size="xl">
					<div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
						<div>
							<Eyebrow>Sklep stacjonarny</Eyebrow>
							<h2 className="mt-3 font-display text-4xl font-semibold leading-tight md:text-5xl">
								Odwiedź nas w Nowym Targu
							</h2>
							<p className="mt-4 max-w-xl text-foreground/80">
								Stoły, regały, witryny i karty historii w wersji papierowej. W Nowym Targu możesz
								dotknąć każdego przedmiotu — i posłuchać, jak trafił do nas z Wiednia.
							</p>
							<dl className="mt-8 grid gap-3 text-sm">
								<div className="flex items-start gap-3">
									<PinIcon className="mt-0.5 size-4 text-brass" />
									<div>
										<dt className="font-semibold">Adres</dt>
										<dd className="text-foreground/70">{STORE_INFO.address}</dd>
									</div>
								</div>
								<div className="flex items-start gap-3">
									<ScrollIcon className="mt-0.5 size-4 text-brass" />
									<div>
										<dt className="font-semibold">Godziny otwarcia</dt>
										<dd className="text-foreground/70">{STORE_INFO.hours}</dd>
									</div>
								</div>
							</dl>
							<div className="mt-8 flex flex-wrap items-center gap-3">
								<CtaLink href="/kontakt" variant="primary">
									Odwiedź nas
								</CtaLink>
								<Link
									href={STORE_INFO.mapsHref}
									target="_blank"
									rel="noreferrer"
									className="inline-flex items-center gap-1.5 text-sm font-semibold uppercase tracking-[0.16em] text-foreground/70 hover:text-brass"
								>
									Pokaż na mapie
									<ArrowRightIcon className="size-4" />
								</Link>
							</div>
						</div>
						<div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-border bg-card">
							<div
								aria-hidden
								className="absolute inset-0"
								style={{
									backgroundImage:
										"radial-gradient(60% 60% at 30% 20%, oklch(0.85 0.05 70), transparent 60%), linear-gradient(160deg, oklch(0.74 0.06 50), oklch(0.43 0.07 150))",
								}}
							/>
							<div className="relative flex h-full items-end p-6 text-background">
								<p className="rounded-2xl border border-background/30 bg-background/15 p-5 font-display text-lg italic leading-snug backdrop-blur-md">
									„Wiedeńska kamienica w Tatry — atmosfera nie do pomylenia."
								</p>
							</div>
						</div>
					</div>
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
								<span className="grid size-10 place-items-center rounded-full bg-brass text-foreground">
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
					<div className="grid gap-6 md:grid-cols-3">
						<CtaCard
							href="/sklep"
							eyebrow="Najszybsza droga"
							title="Zobacz nasze antyki"
							description="12 unikatów aktualnie w sklepie."
						/>
						<CtaCard
							href="/kontakt"
							eyebrow="Pytania?"
							title="Napisz lub zadzwoń"
							description="Odpowiadamy w 12 godzin (średnia z 30 dni)."
						/>
						<CtaCard
							href="/dla-projektantow"
							eyebrow="B2B"
							title="Współpraca dla projektantów"
							description="Rezerwacja 14 dni, FV VAT, priorytetowy newsletter."
							highlight
						/>
					</div>
				</Container>
			</Section>
		</main>
	);
}

function CtaCard({
	href,
	eyebrow,
	title,
	description,
	highlight,
}: {
	href: string;
	eyebrow: string;
	title: string;
	description: string;
	highlight?: boolean;
}) {
	return (
		<Link
			href={href}
			className={`group/card flex flex-col justify-between gap-3 rounded-3xl border p-6 transition-colors ${highlight ? "border-brass bg-brass text-foreground" : "border-background/15 bg-background/5 text-background"} hover:border-brass`}
		>
			<span
				className={`text-[0.65rem] font-semibold uppercase tracking-[0.18em] ${highlight ? "text-foreground/80" : "text-brass"}`}
			>
				{eyebrow}
			</span>
			<p className="font-display text-2xl font-semibold leading-tight">{title}</p>
			<p className={`text-sm ${highlight ? "text-foreground/80" : "text-background/70"}`}>
				{description}
			</p>
			<span className="inline-flex items-center gap-1 text-sm font-semibold uppercase tracking-[0.16em]">
				Otwórz
				<ArrowRightIcon className="size-4 transition-transform group-hover/card:translate-x-0.5" />
			</span>
		</Link>
	);
}
