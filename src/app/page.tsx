import Link from "next/link";
import {
	ArrowRightIcon,
	CompassIcon,
	HeartIcon,
	InstagramIcon,
	PackageIcon,
	PaletteIcon,
	PinIcon,
	ScrollIcon,
} from "@/components/icons";
import { BrassRule, Container, CtaLink, Eyebrow, Lead, Section } from "@/components/primitives";
import { ProductCard } from "@/components/product-card";
import { PRODUCTS } from "@/lib/mock/products";

const HERO_HEADLINE =
	"Ratujemy skarby z wiedeńskich mieszkań. Każdy przedmiot z prawdziwą historią.";
const HERO_SUB =
	"Zero pośredników, 100% pewność pochodzenia. Sklep w Nowym Targu + wysyłka w Polsce.";

/**
 * Kategorie z paletą brandbooka 2026-05-03.
 * Dwa hue per kategoria — gradient ciepły, „retro lampa".
 *  - hue   = wartość główna (jaśniejsza, bottom)
 *  - accent = wartość brudniejsza (ciemniejsza, top-left)
 */
const CATEGORIES = [
	{
		label: "Porcelana",
		href: "/sklep?kategoria=porcelana",
		hue: "oklch(0.92 0.025 80)" /* krem */,
		accent: "oklch(0.74 0.10 80)" /* mosiądz */,
		count: "Augarten · Rosenthal",
	},
	{
		label: "Szkło",
		href: "/sklep?kategoria=szklo",
		hue: "oklch(0.89 0.03 70)" /* jasny krem */,
		accent: "oklch(0.55 0.08 50)" /* brąz miodu */,
		count: "Karafki · kieliszki",
	},
	{
		label: "Dekoracje",
		href: "/sklep?kategoria=dekoracje",
		hue: "oklch(0.82 0.06 60)" /* ciepły piasek */,
		accent: "oklch(0.52 0.15 38)" /* terakota */,
		count: "Figurki · zegary",
	},
	{
		label: "Meble",
		href: "/sklep?kategoria=meble",
		hue: "oklch(0.74 0.04 70)" /* beż */,
		accent: "oklch(0.39 0.07 45)" /* brąz orzechowy */,
		count: "Lampy · krzesła",
	},
	{
		label: "Obrazy",
		href: "/sklep?kategoria=obrazy",
		hue: "oklch(0.84 0.04 90)" /* off-white ciepły */,
		accent: "oklch(0.18 0.025 35)" /* ink */,
		count: "Akwarele · oleje",
	},
	{
		label: "Prezenty",
		href: "/prezent",
		hue: "oklch(0.91 0.04 80)" /* krem */,
		accent: "oklch(0.52 0.15 38)" /* terakota */,
		count: "Z duszą",
	},
] as const;

const STORY_STEPS = [
	{
		icon: <PinIcon className="size-5" />,
		title: "Wiedeń",
		copy: "Pukamy do drzwi prywatnych kamienic.",
	},
	{
		icon: <ScrollIcon className="size-5" />,
		title: "Odkup",
		copy: "Bezpośrednio od właściciela — bez hurtowni.",
	},
	{
		icon: <CompassIcon className="size-5" />,
		title: "Selekcja",
		copy: "Wybieramy unikaty z udokumentowaną historią.",
	},
	{
		icon: <PackageIcon className="size-5" />,
		title: "Transport",
		copy: "Pakujemy w bibułkę, ubezpieczamy każdy przedmiot.",
	},
	{
		icon: <PaletteIcon className="size-5" />,
		title: "Nowy Targ",
		copy: "Inwentaryzacja, opisy, fotografia w naturalnym świetle.",
	},
	{
		icon: <HeartIcon className="size-5" />,
		title: "Twój dom",
		copy: "Drugie życie — z kartą historii i bibułką.",
	},
];

const TESTIMONIALS = [
	{
		quote:
			"Przyjechał wazon zapakowany jak relikwia. Karta z historią to detal, który zmienia wszystko.",
		author: "Anna",
		city: "Wrocław",
	},
	{
		quote:
			"Pracownia zamówiła komplet do projektu mieszkania klienta. FV w 24h, rezerwacja 14 dni — bezbłędnie.",
		author: "Tomasz",
		city: "Studio Kafle, Poznań",
	},
	{
		quote:
			"Odwiedziłam sklep w Nowym Targu — atmosfera jak w wiedeńskiej kamienicy. Każdy przedmiot z opowieścią.",
		author: "Magda",
		city: "Kraków",
	},
];

// Sanity toggle docelowo: env.LIVE_SCHEDULED. Tu hardkod do podglądu sekcji.
const LIVE_SCHEDULED = true;
const LIVE_DATE = "Piątek 18:00";
const LIVE_DROP = "30 nowych antyków z Wiednia";

export default function HomePage() {
	const bestsellers = [...PRODUCTS].sort((a, b) => b.popularity - a.popularity).slice(0, 4);

	return (
		<main id="main" className="flex flex-col">
			<HeroSection />
			<CategoriesSection />
			<BestsellersSection products={bestsellers} />
			{LIVE_SCHEDULED ? <LiveSection date={LIVE_DATE} drop={LIVE_DROP} /> : null}
			<StorySection />
			<SocialProofSection />
			<FooterCtaSection />
		</main>
	);
}

function HeroSection() {
	return (
		<Section spacing="xl" tone="paper" grain className="overflow-hidden">
			<div
				aria-hidden="true"
				className="absolute inset-0 -z-10"
				style={{
					backgroundImage:
						"radial-gradient(70% 60% at 80% 10%, oklch(0.74 0.10 80 / 0.20), transparent 55%), radial-gradient(60% 50% at 0% 100%, oklch(0.52 0.15 38 / 0.10), transparent 55%)",
				}}
			/>
			<Container size="xl">
				<div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
					<div className="flex flex-col gap-7">
						<Eyebrow>Wiedeń → Nowy Targ</Eyebrow>
						<h1 className="text-balance font-display text-[clamp(2.4rem,5.5vw,4.6rem)] font-semibold leading-[1.04] text-foreground">
							{HERO_HEADLINE}
						</h1>
						<Lead>{HERO_SUB}</Lead>
						<div className="mt-2 flex flex-wrap items-center gap-3">
							<CtaLink href="/sklep" variant="primary">
								Zobacz co dziś znaleźliśmy
							</CtaLink>
							<CtaLink href="/kontakt" variant="ghost">
								Odwiedź nas w Nowym Targu
							</CtaLink>
						</div>
						<dl className="mt-6 grid grid-cols-3 gap-6 border-t border-walnut/20 pt-6 text-left">
							<div>
								<dt className="text-xs uppercase tracking-[0.18em] text-foreground/65">
									Pochodzenie
								</dt>
								<dd className="mt-1 font-display text-2xl font-semibold text-foreground">100%</dd>
								<p className="text-xs text-foreground/60">wiedeńskie kamienice</p>
							</div>
							<div>
								<dt className="text-xs uppercase tracking-[0.18em] text-foreground/65">
									Co 2 tygodnie
								</dt>
								<dd className="mt-1 font-display text-2xl font-semibold text-foreground">
									nowa dostawa
								</dd>
								<p className="text-xs text-foreground/60">świeżo z Wiednia</p>
							</div>
							<div>
								<dt className="text-xs uppercase tracking-[0.18em] text-foreground/65">Wysyłka</dt>
								<dd className="mt-1 font-display text-2xl font-semibold text-foreground">
									2–3 dni
								</dd>
								<p className="text-xs text-foreground/60">ubezpieczona, w PL</p>
							</div>
						</dl>
					</div>

					<HeroVisual />
				</div>
			</Container>
		</Section>
	);
}

function HeroVisual() {
	return (
		<div className="relative aspect-[5/6] w-full overflow-hidden rounded-3xl border border-walnut/20 bg-card shadow-xl">
			<div
				aria-hidden="true"
				className="absolute inset-0"
				style={{
					backgroundImage:
						"radial-gradient(120% 80% at 30% 20%, oklch(0.92 0.04 80), transparent 60%), radial-gradient(80% 90% at 90% 90%, oklch(0.52 0.15 38), transparent 60%), linear-gradient(160deg, oklch(0.78 0.04 70), oklch(0.39 0.07 45))",
				}}
			/>
			<div
				aria-hidden="true"
				className="absolute inset-0 mix-blend-soft-light opacity-50 [background-image:repeating-linear-gradient(0deg,transparent_0_2px,oklch(0.18_0.025_35_/_0.06)_2px_3px)]"
			/>
			<div className="relative flex h-full flex-col justify-between p-6 text-ink-foreground sm:p-8">
				<div className="flex items-center justify-between gap-2">
					<span className="rounded-full bg-ink/85 px-3 py-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-ink-foreground backdrop-blur">
						Behind the scenes
					</span>
					<span className="rounded-full bg-ink-foreground/85 px-3 py-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-foreground backdrop-blur">
						Wiedeń, 3. dzielnica
					</span>
				</div>
				<div className="rounded-2xl border border-ink-foreground/30 bg-ink-foreground/20 p-5 backdrop-blur-md">
					<p className="font-display text-lg italic leading-snug text-ink">
						„Patrzcie co przywieźliśmy z Landstraße — komplet Augarten z 1934 roku, prosto z
						apartamentu po profesorze."
					</p>
					<p className="mt-3 text-xs uppercase tracking-[0.16em] text-ink/75">
						Dziennik dostawy · {new Date().toLocaleDateString("pl-PL")}
					</p>
				</div>
			</div>
		</div>
	);
}

function CategoriesSection() {
	return (
		<Section spacing="lg">
			<Container size="xl">
				<header className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
					<div className="max-w-xl">
						<Eyebrow>Co znaleźliśmy w tym sezonie</Eyebrow>
						<h2 className="mt-3 font-display text-4xl font-semibold leading-tight md:text-5xl">
							Kategorie dla osób z duszą
						</h2>
					</div>
					<CtaLink href="/sklep" variant="underline" withArrow={false}>
						Zobacz wszystkie produkty
					</CtaLink>
				</header>

				<ul className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
					{CATEGORIES.map((category) => (
						<li key={category.label}>
							<Link
								href={category.href}
								className="group/cat relative flex aspect-[3/4] flex-col justify-end overflow-hidden rounded-xl border border-walnut/15 p-4 text-foreground shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-walnut/30 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
								style={{
									backgroundImage: `linear-gradient(160deg, ${category.hue}, ${category.accent})`,
								}}
							>
								<span
									aria-hidden="true"
									className="absolute inset-0 mix-blend-overlay opacity-50 [background-image:repeating-linear-gradient(135deg,transparent_0_2px,oklch(0.18_0.025_35_/_0.06)_2px_3px)]"
								/>
								<span className="absolute inset-x-0 top-0 h-px scale-x-0 origin-left bg-terracotta transition-transform duration-500 group-hover/cat:scale-x-100" />
								<span className="relative font-display text-xl font-semibold">
									{category.label}
								</span>
								<span className="relative text-[0.7rem] uppercase tracking-[0.14em] text-foreground/70">
									{category.count}
								</span>
							</Link>
						</li>
					))}
				</ul>
			</Container>
		</Section>
	);
}

function BestsellersSection({ products }: { products: typeof PRODUCTS }) {
	return (
		<Section spacing="lg" tone="cream">
			<Container size="xl">
				<header className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
					<div className="max-w-xl">
						<Eyebrow>Bestsellery z ostatnich tygodni</Eyebrow>
						<h2 className="mt-3 font-display text-4xl font-semibold leading-tight md:text-5xl">
							Każdy przedmiot — jeden raz
						</h2>
						<Lead className="mt-4">
							Sprawdź unikaty, które klienci rezerwują najszybciej. Każdy z nich jest 1 z 1 — gdy
							zniknie z listingu, więcej go nie będzie.
						</Lead>
					</div>
					<CtaLink href="/sklep" variant="underline" withArrow={false}>
						Zobacz wszystkie
					</CtaLink>
				</header>

				<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
					{products.map((product) => (
						<ProductCard key={product.slug} product={product} source="/" />
					))}
				</div>
			</Container>
		</Section>
	);
}

function LiveSection({ date, drop }: { date: string; drop: string }) {
	return (
		<Section spacing="md" tone="ink">
			<Container size="xl">
				<div className="flex flex-col gap-6 rounded-3xl border border-ink-foreground/10 bg-ink-foreground/[0.04] p-6 md:flex-row md:items-center md:justify-between md:p-10">
					<div className="flex items-start gap-4">
						<span
							aria-hidden="true"
							className="grid size-12 place-items-center rounded-full bg-terracotta text-terracotta-foreground"
						>
							<span className="size-2.5 animate-pulse rounded-full bg-terracotta-foreground" />
						</span>
						<div>
							<p className="font-sans text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-brass">
								Następny live · IG @retrohouse
							</p>
							<h2 className="mt-2 font-display text-2xl font-semibold md:text-3xl">
								{date} — {drop}
							</h2>
							<p className="mt-1 text-sm text-ink-foreground/70">
								Rezerwacje obowiązują kolejnością DM. Powiadomimy Cię na 30 min przed startem.
							</p>
						</div>
					</div>
					<div className="flex flex-col items-stretch gap-3 sm:flex-row md:items-center">
						<form
							action="/api/live-reminder"
							method="post"
							className="flex flex-col gap-2 sm:flex-row"
						>
							<label htmlFor="live-email" className="sr-only">
								E-mail do powiadomienia
							</label>
							<input
								id="live-email"
								name="email"
								type="email"
								required
								autoComplete="email"
								placeholder="twój e-mail"
								className="h-11 w-full rounded-full border border-ink-foreground/30 bg-ink-foreground/5 px-5 text-sm text-ink-foreground placeholder:text-ink-foreground/55 focus-visible:border-terracotta focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta sm:w-72"
							/>
							<button
								type="submit"
								className="cta-text inline-flex h-11 items-center justify-center gap-2 rounded-full bg-terracotta px-5 text-sm text-terracotta-foreground transition-all hover:-translate-y-0.5 hover:shadow-lg"
							>
								Powiadom mnie
								<ArrowRightIcon className="size-4" />
							</button>
						</form>
						<Link
							href="/api/live.ics"
							className="cta-text inline-flex items-center justify-center gap-2 text-sm text-ink-foreground/80 hover:text-terracotta"
						>
							Dodaj do kalendarza
							<ArrowRightIcon className="size-4" />
						</Link>
					</div>
				</div>
			</Container>
		</Section>
	);
}

function StorySection() {
	return (
		<Section spacing="lg" id="historia">
			<Container size="xl">
				<div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
					<div className="order-2 lg:order-1">
						<div className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-walnut/20 shadow-card">
							<div
								aria-hidden="true"
								className="absolute inset-0"
								style={{
									backgroundImage:
										"radial-gradient(70% 60% at 30% 20%, oklch(0.92 0.04 80), transparent 60%), linear-gradient(160deg, oklch(0.78 0.04 70), oklch(0.39 0.07 45))",
								}}
							/>
							<div className="relative flex h-full items-end p-6">
								<p className="rounded-2xl border border-ink-foreground/40 bg-ink-foreground/30 p-5 font-display text-lg italic leading-snug text-ink backdrop-blur">
									„Pukamy do drzwi mieszkania w 7. dzielnicy. Pani Marta otwiera i mówi: «Wszystko
									po prababci. Wybierajcie». To jest nasza codzienność."
								</p>
							</div>
						</div>
					</div>
					<div className="order-1 lg:order-2">
						<Eyebrow>Nasza historia</Eyebrow>
						<h2 className="mt-3 font-display text-4xl font-semibold leading-tight md:text-5xl">
							Odkupujemy bezpośrednio od wiedeńskich właścicieli — prosto z kamienic, bez hurtowni i
							pośredników.
						</h2>
						<p className="mt-6 max-w-2xl text-pretty text-base leading-relaxed text-foreground/80 md:text-lg">
							Pukamy do drzwi prywatnych mieszkań przy Ringstraße, w Leopoldstadt i na Mariahilf.
							Słuchamy historii, oglądamy serwisy w witrynach, sprawdzamy sygnatury. Najpiękniejsze
							przedmioty ratujemy przed strychem albo śmietnikiem — i przywozimy do Nowego Targu.
							Każdy z nich dostaje kartę z opisem pochodzenia.
						</p>

						<ol className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3">
							{STORY_STEPS.map((step, index) => (
								<li
									key={step.title}
									className="rounded-xl border border-walnut/15 bg-card p-5 shadow-card transition-colors hover:border-walnut/35"
								>
									<div className="flex items-center gap-2 text-terracotta">
										{step.icon}
										<span className="font-sans text-[0.65rem] font-semibold uppercase tracking-[0.16em]">
											Krok {String(index + 1).padStart(2, "0")}
										</span>
									</div>
									<p className="mt-3 font-display text-lg font-semibold leading-snug">
										{step.title}
									</p>
									<p className="mt-1 text-sm text-foreground/70">{step.copy}</p>
								</li>
							))}
						</ol>

						<CtaLink href="/o-nas" variant="primary" className="mt-10">
							Poznaj całą historię
						</CtaLink>
					</div>
				</div>
			</Container>
		</Section>
	);
}

function SocialProofSection() {
	return (
		<Section spacing="lg" tone="cream">
			<Container size="xl">
				<header className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
					<div className="max-w-xl">
						<Eyebrow>Zaufali nam</Eyebrow>
						<h2 className="mt-3 font-display text-4xl font-semibold leading-tight md:text-5xl">
							Klienci, projektanci, kolekcjonerzy
						</h2>
					</div>
					<Link
						href="https://instagram.com/retrohouse"
						target="_blank"
						rel="noreferrer"
						className="cta-text group/cta inline-flex items-center gap-2 text-sm text-foreground transition-colors hover:text-terracotta"
					>
						Obserwuj @retrohouse
						<InstagramIcon className="size-4" />
					</Link>
				</header>
				<BrassRule className="mb-10 max-w-xs" />
				<div className="grid gap-4 md:grid-cols-3">
					{TESTIMONIALS.map((testimonial) => (
						<figure
							key={testimonial.author}
							className="flex h-full flex-col gap-4 rounded-xl border border-walnut/15 bg-card p-6 shadow-card transition-transform hover:-translate-y-1"
						>
							<svg
								role="presentation"
								focusable="false"
								className="size-7 text-terracotta"
								viewBox="0 0 24 24"
								fill="currentColor"
							>
								<title>Cudzysłów otwarcia opinii</title>
								<path d="M9 7H5a2 2 0 0 0-2 2v6h6V9H7c0-1 .5-2 2-2V7Zm10 0h-4a2 2 0 0 0-2 2v6h6V9h-2c0-1 .5-2 2-2V7Z" />
							</svg>
							<blockquote className="font-display text-xl leading-snug text-foreground">
								„{testimonial.quote}"
							</blockquote>
							<figcaption className="mt-auto flex items-center justify-between text-sm">
								<span className="font-semibold">{testimonial.author}</span>
								<span className="text-foreground/60">{testimonial.city}</span>
							</figcaption>
						</figure>
					))}
				</div>
			</Container>
		</Section>
	);
}

function FooterCtaSection() {
	return (
		<Section spacing="lg" className="overflow-hidden">
			<Container size="xl">
				<div className="relative overflow-hidden rounded-3xl border border-walnut/15 bg-ink p-8 text-ink-foreground shadow-xl md:p-14">
					<div
						aria-hidden="true"
						className="absolute inset-0 -z-0"
						style={{
							backgroundImage:
								"radial-gradient(60% 60% at 100% 0%, oklch(0.74 0.10 80 / 0.30), transparent 60%), radial-gradient(50% 60% at 0% 100%, oklch(0.52 0.15 38 / 0.30), transparent 60%)",
						}}
					/>
					<div className="relative grid gap-10 md:grid-cols-[1.2fr_0.8fr] md:items-center">
						<div>
							<Eyebrow>Zostań w kręgu</Eyebrow>
							<h2 className="mt-3 font-display text-4xl font-semibold leading-tight md:text-5xl">
								Dołącz do społeczności RetroHouse
							</h2>
							<p className="mt-4 max-w-xl text-pretty text-base leading-relaxed text-ink-foreground/75 md:text-lg">
								Co 2 tygodnie ślemy maila ze świeżą dostawą z Wiednia. Bez spamu, z linkiem do
								priorytetowej rezerwacji.
							</p>
						</div>
						<form action="/api/newsletter" method="post" className="flex flex-col gap-3">
							<label htmlFor="hero-newsletter-email" className="sr-only">
								E-mail
							</label>
							<input
								id="hero-newsletter-email"
								name="email"
								type="email"
								required
								autoComplete="email"
								placeholder="twój e-mail"
								className="h-12 w-full rounded-full border border-ink-foreground/25 bg-ink-foreground/5 px-5 text-sm text-ink-foreground placeholder:text-ink-foreground/55 focus-visible:border-terracotta focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta"
							/>
							<button
								type="submit"
								className="cta-text inline-flex h-12 items-center justify-center gap-2 rounded-full bg-terracotta px-6 text-sm text-terracotta-foreground transition-all hover:-translate-y-0.5 hover:shadow-lg"
							>
								Zapisz się
								<ArrowRightIcon className="size-4" />
							</button>
							<p className="text-xs text-ink-foreground/55">
								Klikając „Zapisz się" akceptujesz{" "}
								<Link
									href="/polityka-prywatnosci"
									className="underline underline-offset-4 hover:text-terracotta"
								>
									politykę prywatności
								</Link>
								.
							</p>
						</form>
					</div>
				</div>

				<aside className="mt-6 flex flex-col items-start justify-between gap-3 rounded-2xl border border-walnut/15 bg-cream p-5 md:flex-row md:items-center">
					<div>
						<p className="font-sans text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-terracotta">
							Pracujesz z wnętrzami?
						</p>
						<p className="mt-1 font-display text-lg leading-snug">
							Zobacz warunki dla projektantów — rezerwacja 14 dni, FV VAT, priorytetowy newsletter.
						</p>
					</div>
					<CtaLink href="/dla-projektantow" variant="secondary">
						Warunki B2B
					</CtaLink>
				</aside>
			</Container>
		</Section>
	);
}
