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
import { BrassRule, Container, CtaLink, Eyebrow, Section } from "@/components/primitives";
import { ProductCard } from "@/components/product-card";
import { PRODUCTS } from "@/lib/mock/products";

const HERO_HEADLINE = "Wiedeń trafia\u00a0do\u00a0polskich domów.";
const HERO_SUB =
	"Antyki, które kupujemy bezpośrednio od mieszkańców Wiednia. Każdy z\u00a0historią, kartą pochodzenia i\u00a0bibułką.";

const CATEGORIES = [
	{ label: "Porcelana", href: "/sklep?kategoria=porcelana" },
	{ label: "Szkło", href: "/sklep?kategoria=szklo" },
	{ label: "Dekoracje", href: "/sklep?kategoria=dekoracje" },
	{ label: "Meble", href: "/sklep?kategoria=meble" },
	{ label: "Obrazy", href: "/sklep?kategoria=obrazy" },
	{ label: "Prezenty", href: "/prezent" },
] as const;

const STORY_STEPS = [
	{
		icon: <PinIcon className="size-4" />,
		title: "Wiedeń",
		copy: "Pukamy do drzwi prywatnych kamienic.",
	},
	{
		icon: <ScrollIcon className="size-4" />,
		title: "Odkup",
		copy: "Bezpośrednio od właściciela — bez hurtowni.",
	},
	{
		icon: <CompassIcon className="size-4" />,
		title: "Selekcja",
		copy: "Tylko unikaty z udokumentowaną historią.",
	},
	{
		icon: <PackageIcon className="size-4" />,
		title: "Transport",
		copy: "Bibułka, ubezpieczenie, opieka nad każdą sztuką.",
	},
	{
		icon: <PaletteIcon className="size-4" />,
		title: "Nowy Targ",
		copy: "Inwentarz, opisy, fotografia w naturalnym świetle.",
	},
	{
		icon: <HeartIcon className="size-4" />,
		title: "Twój dom",
		copy: "Drugie życie — z kartą historii.",
	},
];

const HERO_QUOTE = {
	body: "Przyjechał wazon zapakowany jak relikwia. Karta z historią to detal, który zmienia wszystko.",
	author: "Anna · Wrocław",
};

// Sanity toggle docelowo: env.LIVE_SCHEDULED. Tu hardkod do podglądu sekcji.
const LIVE_SCHEDULED = true;
const LIVE_DATE = "Piątek 18:00";
const LIVE_DROP = "30 nowych antyków z Wiednia";

export default function HomePage() {
	const bestsellers = [...PRODUCTS].sort((a, b) => b.popularity - a.popularity).slice(0, 4);

	return (
		<main id="main" className="flex flex-col">
			<HeroSection />
			<TodaySection products={bestsellers} />
			<StorySection />
			<NewsletterSection />
		</main>
	);
}

/* ────────────────────────────────────────────────────────────────────────── */
/* 1. HERO — krótki headline, 1 CTA, mała ramka z cytatem, pasek live        */
/* ────────────────────────────────────────────────────────────────────────── */

function HeroSection() {
	return (
		<Section spacing="lg" tone="paper" className="overflow-hidden">
			<div
				aria-hidden="true"
				className="absolute inset-0 -z-10"
				style={{
					backgroundImage:
						"radial-gradient(70% 60% at 85% 5%, oklch(0.74 0.10 80 / 0.18), transparent 55%), radial-gradient(50% 50% at -5% 100%, oklch(0.52 0.15 38 / 0.10), transparent 55%)",
				}}
			/>
			<Container size="lg">
				<div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
					<div className="flex flex-col gap-6">
						<Eyebrow variant="script">witamy w naszym pokoju</Eyebrow>
						<h1 className="text-balance font-display text-[clamp(2rem,4.6vw,3.6rem)] font-medium leading-[1.05] text-foreground">
							{HERO_HEADLINE}
						</h1>
						<p className="max-w-xl text-pretty text-base leading-relaxed text-foreground/75 md:text-lg">
							{HERO_SUB}
						</p>
						<div className="mt-1 flex flex-wrap items-center gap-3">
							<CtaLink href="/sklep" variant="primary">
								Zobacz, co dziś znaleźliśmy
							</CtaLink>
							<CtaLink href="/o-nas" variant="ghost">
								Skąd to wszystko
							</CtaLink>
						</div>

						{LIVE_SCHEDULED ? (
							<Link
								href="/api/live.ics"
								className="group/live mt-2 inline-flex w-fit items-center gap-2 rounded-full border border-walnut/25 bg-background/60 px-4 py-2 text-xs text-foreground/75 backdrop-blur transition-colors hover:border-terracotta hover:text-terracotta"
							>
								<span
									aria-hidden="true"
									className="size-2 animate-pulse rounded-full bg-terracotta"
								/>
								<span className="cta-text">
									Następny live · {LIVE_DATE} — {LIVE_DROP}
								</span>
								<ArrowRightIcon className="size-3" />
							</Link>
						) : null}
					</div>

					<HeroQuote />
				</div>
			</Container>
		</Section>
	);
}

function HeroQuote() {
	return (
		<aside
			className="relative w-full overflow-hidden rounded-2xl border border-walnut/15 bg-card p-7 shadow-card md:p-9"
			aria-label="Opinia klientki"
		>
			<div
				aria-hidden="true"
				className="absolute inset-0 -z-10"
				style={{
					backgroundImage:
						"radial-gradient(80% 60% at 30% 10%, oklch(0.92 0.04 80 / 0.55), transparent 60%)",
				}}
			/>
			<svg
				role="presentation"
				focusable="false"
				className="size-7 text-terracotta"
				viewBox="0 0 24 24"
				fill="currentColor"
			>
				<title>Cudzysłów</title>
				<path d="M9 7H5a2 2 0 0 0-2 2v6h6V9H7c0-1 .5-2 2-2V7Zm10 0h-4a2 2 0 0 0-2 2v6h6V9h-2c0-1 .5-2 2-2V7Z" />
			</svg>
			<blockquote className="mt-4 font-display text-xl leading-snug text-foreground md:text-2xl">
				„{HERO_QUOTE.body}”
			</blockquote>
			<p className="mt-5 text-xs uppercase tracking-[0.16em] text-foreground/60">
				{HERO_QUOTE.author}
			</p>
		</aside>
	);
}

/* ────────────────────────────────────────────────────────────────────────── */
/* 2. „Co dziś znaleźliśmy" — bestsellery + chips kategorii                  */
/* ────────────────────────────────────────────────────────────────────────── */

function TodaySection({ products }: { products: typeof PRODUCTS }) {
	return (
		<Section spacing="lg" tone="cream">
			<Container size="lg">
				<header className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
					<div className="max-w-xl">
						<Eyebrow>Co dziś znaleźliśmy</Eyebrow>
						<h2 className="mt-3 font-display text-3xl font-medium leading-tight md:text-4xl">
							Każdy przedmiot — jeden raz.
						</h2>
					</div>
					<CtaLink href="/sklep" variant="underline" withArrow={false}>
						Zobacz wszystkie
					</CtaLink>
				</header>

				<div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
					{products.map((product) => (
						<ProductCard key={product.slug} product={product} source="/" />
					))}
				</div>

				<nav
					aria-label="Kategorie"
					className="mt-10 flex flex-wrap items-center justify-center gap-2"
				>
					<span className="cta-text mr-2 text-xs text-foreground/55">Po kategorii:</span>
					{CATEGORIES.map((category) => (
						<Link
							key={category.label}
							href={category.href}
							className="rounded-full border border-walnut/20 bg-background/70 px-4 py-1.5 text-sm text-foreground/80 transition-all hover:border-terracotta hover:text-terracotta focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
						>
							{category.label}
						</Link>
					))}
				</nav>
			</Container>
		</Section>
	);
}

/* ────────────────────────────────────────────────────────────────────────── */
/* 3. Historia — 1 cytat z Wiednia + 6 kroków + CTA                          */
/* ────────────────────────────────────────────────────────────────────────── */

function StorySection() {
	return (
		<Section spacing="lg" id="historia">
			<Container size="lg">
				<div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
					<div className="order-2 lg:order-1">
						<div className="relative aspect-4/5 overflow-hidden rounded-2xl border border-walnut/15 shadow-card">
							<div
								aria-hidden="true"
								className="absolute inset-0"
								style={{
									backgroundImage:
										"radial-gradient(70% 60% at 30% 20%, oklch(0.92 0.04 80), transparent 60%), linear-gradient(160deg, oklch(0.78 0.04 70), oklch(0.39 0.07 45))",
								}}
							/>
							<div className="relative flex h-full items-end p-6">
								<p className="rounded-2xl border border-ink-foreground/30 bg-ink-foreground/25 p-5 font-display text-lg italic leading-snug text-ink backdrop-blur">
									„Pukamy do drzwi w 7. dzielnicy. Pani Marta otwiera i mówi: «Wszystko po prababci.
									Wybierajcie». To jest nasza codzienność.”
								</p>
							</div>
						</div>
					</div>

					<div className="order-1 lg:order-2">
						<Eyebrow>Skąd to wszystko</Eyebrow>
						<h2 className="mt-3 font-display text-3xl font-medium leading-tight md:text-4xl">
							Bezpośrednio od wiedeńczyków, prosto z&nbsp;ich kamienic.
						</h2>
						<p className="mt-5 max-w-2xl text-pretty text-base leading-relaxed text-foreground/75">
							Pukamy do drzwi prywatnych mieszkań przy Ringstraße, w&nbsp;Leopoldstadt
							i&nbsp;na&nbsp;Mariahilf. Słuchamy historii, sprawdzamy sygnatury. Najpiękniejsze
							przedmioty ratujemy przed strychem albo śmietnikiem — i&nbsp;przywozimy do Nowego
							Targu z&nbsp;kartą pochodzenia.
						</p>

						<BrassRule className="my-8 max-w-[140px]" />

						<ol className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3">
							{STORY_STEPS.map((step, index) => (
								<li key={step.title} className="flex flex-col gap-1.5">
									<div className="flex items-center gap-2 text-terracotta">
										{step.icon}
										<span className="cta-text text-[0.65rem] text-foreground/55">
											{String(index + 1).padStart(2, "0")}
										</span>
									</div>
									<p className="font-display text-base font-medium leading-snug">{step.title}</p>
									<p className="text-sm text-foreground/65">{step.copy}</p>
								</li>
							))}
						</ol>

						<div className="mt-8 flex flex-wrap gap-3">
							<CtaLink href="/o-nas" variant="primary">
								Poznaj całą historię
							</CtaLink>
							<CtaLink href="/dla-projektantow" variant="ghost">
								Współpraca B2B
							</CtaLink>
						</div>
					</div>
				</div>
			</Container>
		</Section>
	);
}

/* ────────────────────────────────────────────────────────────────────────── */
/* 4. Newsletter — jedna prosta sekcja na ink                                */
/* ────────────────────────────────────────────────────────────────────────── */

function NewsletterSection() {
	return (
		<Section spacing="md" tone="ink">
			<Container size="md">
				<div className="grid gap-8 md:grid-cols-[1.2fr_0.8fr] md:items-end">
					<div>
						<Eyebrow variant="script" className="text-brass">
							list co dwa tygodnie
						</Eyebrow>
						<h2 className="mt-3 font-display text-3xl font-medium leading-tight text-ink-foreground md:text-4xl">
							Zostań w&nbsp;kręgu RetroHouse.
						</h2>
						<p className="mt-4 max-w-md text-base leading-relaxed text-ink-foreground/75">
							Świeża dostawa z&nbsp;Wiednia w&nbsp;Twojej skrzynce. Bez spamu, z&nbsp;linkiem
							do&nbsp;priorytetowej rezerwacji.
						</p>
						<div className="mt-5 flex flex-wrap items-center gap-2">
							<Link
								href="https://instagram.com/retrohouse"
								target="_blank"
								rel="noreferrer"
								className="cta-text inline-flex items-center gap-2 text-xs text-ink-foreground/65 hover:text-terracotta"
							>
								<InstagramIcon className="size-4" />
								@retrohouse
							</Link>
						</div>
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
							Klikając „Zapisz się” akceptujesz{" "}
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
			</Container>
		</Section>
	);
}
