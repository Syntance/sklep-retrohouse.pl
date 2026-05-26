import type { Metadata } from "next";
import Link from "next/link";
import { CheckIcon, GiftIcon, PackageIcon, ShieldIcon } from "@/components/icons";
import { Breadcrumbs, Container, CtaLink, Eyebrow, Lead, Section } from "@/components/primitives";

export const metadata: Metadata = {
	title: "Wysyłka i zwroty",
	description:
		"InPost, kurier, odbiór osobisty w Nowym Targu. Pakowanie z bibułką i kartą historii. 14 dni na zwrot.",
};

const SHIPPING = [
	{
		method: "InPost Paczkomaty",
		time: "2–3 dni robocze",
		price: "19 zł (gratis od 500 zł)",
	},
	{
		method: "Kurier DPD / DHL",
		time: "1–2 dni robocze",
		price: "29 zł — większe gabaryty",
	},
	{
		method: "Odbiór osobisty (Nowy Targ)",
		time: "Tego samego dnia",
		price: "0 zł",
	},
];

const PACKAGING = [
	"Bibułka ochronna i ozdobna",
	"Karta z historią przedmiotu",
	"Wizytówka RetroHouse",
	"Ubezpieczenie przesyłki",
];

const FAQS = [
	{
		question: "Czy wysyłacie meble?",
		answer:
			"Tak — kurierem z ubezpieczeniem. Większe gabaryty wymagają ustaleń logistyki (czas, miejsce odbioru).",
	},
	{
		question: "Czy wysyłacie za granicę?",
		answer:
			"Aktualnie wysyłamy w Polsce. Indywidualnie — Czechy, Słowacja, Niemcy. Napisz na kontakt@retrohouse.pl.",
	},
	{
		question: "Czy mogę zarezerwować przedmiot?",
		answer: "Klienci indywidualni — 24 h. Projektanci wnętrz po wysłaniu briefu — do 14 dni.",
	},
];

export default function WysylkaPage() {
	return (
		<main id="main" className="flex flex-col">
			<Section spacing="sm">
				<Container size="xl">
					<Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Wysyłka i zwroty" }]} />
				</Container>
			</Section>

			<Section spacing="md">
				<Container size="md">
					<Eyebrow>Logistyka i pakowanie</Eyebrow>
					<h1 className="mt-3 font-display text-[clamp(2.4rem,5vw,4rem)] font-semibold leading-[1.05]">
						Wysyłka, pakowanie i zwroty
					</h1>
					<Lead className="mt-4">
						Każdy przedmiot pakujemy z należytą starannością — bibułka, karta z historią, wizytówka.
						Ubezpieczona przesyłka w 2–3 dni.
					</Lead>
				</Container>
			</Section>

			<Section spacing="md">
				<Container size="md">
					<header className="mb-6">
						<Eyebrow>Wysyłka</Eyebrow>
						<h2 className="mt-3 font-display text-3xl font-semibold leading-tight md:text-4xl">
							Trzy sposoby — Ty wybierasz
						</h2>
					</header>
					<div className="overflow-hidden rounded-2xl border border-border bg-card">
						<table className="w-full text-left text-sm">
							<thead className="bg-cream text-xs uppercase tracking-[0.14em] text-foreground/60">
								<tr>
									<th className="px-5 py-3 font-semibold">Opcja</th>
									<th className="px-5 py-3 font-semibold">Czas</th>
									<th className="px-5 py-3 font-semibold">Cena</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-border">
								{SHIPPING.map((row) => (
									<tr key={row.method}>
										<td className="px-5 py-4 font-semibold">{row.method}</td>
										<td className="px-5 py-4 text-foreground/80">{row.time}</td>
										<td className="px-5 py-4 text-foreground/80">{row.price}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
					<p className="mt-3 text-xs text-foreground/60">
						Darmowa wysyłka InPost obowiązuje przy zamówieniach od 500 zł (brutto, po rabatach).
					</p>
				</Container>
			</Section>

			<Section spacing="md" tone="muted">
				<Container size="md">
					<div className="grid gap-10 md:grid-cols-[1.2fr_1fr] md:items-start">
						<div>
							<Eyebrow>Pakowanie</Eyebrow>
							<h2 className="mt-3 font-display text-3xl font-semibold leading-tight md:text-4xl">
								Każdy przedmiot pakujemy z najwyższą starannością
							</h2>
							<ul className="mt-6 space-y-3">
								{PACKAGING.map((item) => (
									<li key={item} className="flex items-start gap-3 text-foreground/80">
										<span className="mt-0.5 grid size-7 place-items-center rounded-full bg-terracotta/20 text-brass">
											<CheckIcon className="size-4" />
										</span>
										{item}
									</li>
								))}
							</ul>
							<aside className="mt-8 flex items-start gap-3 rounded-2xl border border-brass/40 bg-terracotta/15 p-5">
								<span className="grid size-9 place-items-center rounded-full bg-ink text-brass">
									<GiftIcon className="size-5" />
								</span>
								<div>
									<p className="font-display text-lg">Pakowanie prezentowe (+25 zł)</p>
									<p className="text-sm text-foreground/80">
										Eleganckie pudełko, dedykacja, premium unboxing.
									</p>
								</div>
							</aside>
						</div>
						<div className="relative aspect-[3/4] w-full overflow-hidden rounded-3xl border border-border bg-card">
							<div
								aria-hidden
								className="absolute inset-0"
								style={{
									backgroundImage:
										"radial-gradient(70% 60% at 30% 20%, oklch(0.92 0.04 80), transparent 60%), linear-gradient(160deg, oklch(0.74 0.10 80), oklch(0.39 0.07 45))",
								}}
							/>
							<div className="relative flex h-full items-end p-6 text-ink-foreground">
								<p className="rounded-2xl border border-ink-foreground/30 bg-ink-foreground/15 p-4 text-sm leading-snug backdrop-blur-md">
									Premium unboxing — zdjęcie zapakowanej paczki
								</p>
							</div>
						</div>
					</div>
				</Container>
			</Section>

			<Section spacing="md">
				<Container size="md">
					<div className="grid gap-6 md:grid-cols-2">
						<article className="rounded-2xl border border-border bg-card p-6">
							<div className="flex items-center gap-2 text-brass">
								<ShieldIcon className="size-5" />
								<span className="font-sans text-[0.65rem] font-semibold uppercase tracking-[0.18em]">
									Ubezpieczenie
								</span>
							</div>
							<h2 className="mt-3 font-display text-2xl">Każdą przesyłkę ubezpieczamy</h2>
							<p className="mt-2 text-foreground/80">
								Wszystkie przesyłki są ubezpieczone. Jeśli przedmiot dotrze uszkodzony —
								zwracamy pieniądze lub obniżamy cenę. Wymiana jest niemożliwa, bo każdy antyk
								to unikat. Szczegóły procedury:{" "}
								<Link
									href="/reklamacje"
									className="font-semibold underline-offset-4 hover:underline hover:text-terracotta"
								>
									/reklamacje
								</Link>
								.
							</p>
						</article>
						<article className="rounded-2xl border border-border bg-card p-6">
							<div className="flex items-center gap-2 text-brass">
								<PackageIcon className="size-5" />
								<span className="font-sans text-[0.65rem] font-semibold uppercase tracking-[0.18em]">
									Zwroty
								</span>
							</div>
							<h2 className="mt-3 font-display text-2xl">14 dni na zwrot</h2>
							<ul className="mt-2 space-y-1 text-foreground/80">
								<li>· bez podania przyczyny (zgodnie z ustawą)</li>
								<li>· przedmiot w stanie nienaruszonym</li>
								<li>· koszt zwrotu po stronie kupującego</li>
								<li>· zwrot pieniędzy w 7 dni roboczych</li>
							</ul>
						</article>
					</div>
				</Container>
			</Section>

		{/* Sekcja 4: Odstąpienie od umowy (art. 27 UPK) */}
		<Section spacing="md">
			<Container size="md">
				<Eyebrow>Twoje prawa</Eyebrow>
				<h2 className="mt-3 font-display text-3xl font-semibold leading-tight md:text-4xl">
					Odstąpienie od umowy
				</h2>
				<div className="mt-6 space-y-4 rounded-2xl border border-border bg-card p-6 text-foreground/80 leading-relaxed md:p-8">
					<p>
						Masz{" "}
						<strong className="font-semibold text-foreground">
							14 dni na odstąpienie od umowy
						</strong>{" "}
						od dnia otrzymania przesyłki — to Twoje ustawowe prawo (art. 27 UPK).
					</p>
					<p>
						Antyki to rzeczy używane. Przed zakupem zapoznajesz się z opisem stanu przedmiotu
						i akceptujesz go w koszyku — opisane ślady użytkowania nie są podstawą reklamacji.
					</p>
					<p>
						Odpowiadasz finansowo za zmniejszenie wartości przedmiotu wynikłe z korzystania
						ponad to, co konieczne do sprawdzenia (art. 34 ust. 4 UPK). Dla unikatów oznacza
						to, że ekspozycja, używanie czy próby renowacji mogą zostać wycenione i odjęte od
						zwrotu.
					</p>
					<p>
						Pełna procedura, koszty i formularz:{" "}
						<Link
							href="/odstapienie"
							className="font-semibold underline-offset-4 hover:underline hover:text-terracotta"
						>
							/odstapienie
						</Link>
						.
					</p>
				</div>
			</Container>
		</Section>

		{/* Sekcja 5: FAQ */}
		<Section spacing="md" tone="muted">
			<Container size="md">
				<Eyebrow>FAQ</Eyebrow>
				<h2 className="mt-3 font-display text-3xl font-semibold leading-tight md:text-4xl">
					Najczęstsze pytania o logistykę
				</h2>
					<dl className="mt-6 divide-y divide-border rounded-2xl border border-border bg-card">
						{FAQS.map((faq) => (
							<details
								key={faq.question}
								className="group/qa px-6 py-5 transition-colors open:bg-cream"
							>
								<summary className="flex cursor-pointer items-center justify-between gap-3 text-left">
									<dt className="font-display text-lg">{faq.question}</dt>
									<span
										aria-hidden
										className="text-2xl font-light leading-none text-brass transition-transform group-open/qa:rotate-45"
									>
										+
									</span>
								</summary>
								<dd className="mt-3 text-sm leading-relaxed text-foreground/80">{faq.answer}</dd>
							</details>
						))}
					</dl>
				</Container>
			</Section>

			<Section spacing="md">
				<Container size="md">
					<div className="flex flex-col items-start gap-4 rounded-3xl border border-border bg-card p-8 md:flex-row md:items-center md:justify-between md:p-12">
						<div>
							<p className="font-display text-2xl">Wątpliwość, której nie ma w FAQ?</p>
							<p className="mt-1 text-foreground/70">
								Napisz lub zadzwoń. Wolimy odpowiedzieć przed zakupem niż po.
							</p>
						</div>
						<div className="flex flex-wrap gap-3">
							<CtaLink href="/kontakt">Napisz do nas</CtaLink>
							<CtaLink href="/sklep" variant="secondary" withArrow={false}>
								Wróć do sklepu
							</CtaLink>
						</div>
					</div>
				</Container>
			</Section>
		</main>
	);
}
