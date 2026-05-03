import type { Metadata } from "next";
import Link from "next/link";
import {
	ArrowRightIcon,
	CheckIcon,
	CompassIcon,
	GiftIcon,
	HeartIcon,
	PackageIcon,
	PhoneIcon,
	WhatsAppIcon,
} from "@/components/icons";
import { STORE_INFO } from "@/components/layout/site-header/nav-data";
import { Breadcrumbs, Container, CtaLink, Eyebrow, Lead, Section } from "@/components/primitives";
import { CASE_STUDIES } from "@/lib/mock/case-studies";

export const metadata: Metadata = {
	title: "Dla projektantów wnętrz — antyki z Wiednia z FV i rezerwacją 14 dni",
	description:
		"Sprowadzamy unikaty bezpośrednio od wiedeńskich właścicieli. 100% pewność pochodzenia, transparentny stan, rezerwacja 14 dni.",
	alternates: { canonical: "/dla-projektantow" },
};

const TRADE_TERMS = [
	{
		label: "Rabat trade",
		detail: "10–15% od 3 sztuk lub koszyka >2 000 zł",
	},
	{
		label: "Rezerwacja",
		detail: "Do 14 dni bez płatności — na czas prezentacji u klienta",
	},
	{
		label: "FV VAT",
		detail: "Standardowo. NIP + dane firmy w briefie",
	},
	{
		label: "Priorytetowy dostęp",
		detail: "Nowe dostawy z Wiednia mailem 48 h przed publikacją",
	},
	{
		label: "Płatność",
		detail: "Przelew, termin 14 dni od odbioru",
	},
	{
		label: "Dostawa",
		detail: "Kurier ubezpieczony, odbiór w NT, dostarczenie na plac budowy",
	},
];

const PROCESS = [
	{
		title: "Wyślij brief",
		description: "Mood board (PDF / link / zdjęcia), opis stylistyki, budżet, termin.",
	},
	{
		title: "Selekcja w 24 h",
		description: "Mailem dostajesz 3–5 propozycji z fotografią i pochodzeniem każdego obiektu.",
	},
	{
		title: "Rezerwacja 14 dni",
		description: "Wybrane przedmioty blokujemy — masz czas pokazać klientowi.",
	},
	{
		title: "FV VAT + dostawa",
		description: "Faktura po zatwierdzeniu, kurier ubezpieczony lub odbiór w NT.",
	},
];

const FAQS = [
	{
		question: "Jak dokładnie wygląda rezerwacja na 14 dni?",
		answer:
			"Po wysłaniu briefu i wybraniu przedmiotów oznaczamy je w systemie jako zarezerwowane na Twoje studio. Inni klienci nie mogą ich kupić. Rezerwacja wygasa automatycznie po 14 dniach, chyba że wcześniej potwierdzisz zamówienie.",
	},
	{
		question: "Co jeśli klient się rozmyśli — czy mogę zwrócić przedmiot?",
		answer:
			"Tak — w ramach 14-dniowego prawa odstąpienia (zgodnie z UPK). Przedmiot wraca w stanie nienaruszonym, koszt zwrotu po stronie studio. Standardowo wnosimy też do umowy klauzulę „zwrot bez przyczyny” dla projektantów premium.",
	},
	{
		question: "Dostarczacie poza Polskę (Czechy, Słowacja, Niemcy)?",
		answer:
			"Tak — indywidualnie po ustaleniach. Mamy doświadczenie z dostawami CZ/DE. Wycena na bazie wymiarów i adresu placu budowy.",
	},
	{
		question: "Czy mogę przyjechać osobiście obejrzeć przedmioty?",
		answer:
			"Oczywiście. Sklep w Nowym Targu otwarty wt–pt 11–18 i sob 10–14. Polecamy umówić wizytę — przygotujemy wybrane przedmioty z magazynu.",
	},
	{
		question: "Jak wygląda FV? Mixed VAT (przedmioty używane)?",
		answer:
			"Standardowa FV VAT — przedmioty używane na procedurze marży (art. 120 UPTU) lub ogólnej zasadzie po Twojej stronie. Możemy przygotować obie wersje.",
	},
	{
		question: "Mogę dostać wcześniejszy podgląd dostawy z Wiednia?",
		answer:
			"Tak — to jeden z bonusów dla projektantów. Zapis do priorytetowego newslettera B2B daje 48 h przewagi nad sklepem.",
	},
];

export default function DlaProjektantowPage() {
	return (
		<main id="main" className="flex flex-col">
			<Section spacing="sm">
				<Container size="xl">
					<Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Dla projektantów" }]} />
				</Container>
			</Section>

			<Section spacing="lg" className="overflow-hidden">
				<div
					aria-hidden
					className="absolute inset-0 -z-10"
					style={{
						backgroundImage:
							"radial-gradient(60% 50% at 90% 0%, oklch(0.39 0.06 245 / 0.18), transparent 60%), radial-gradient(50% 60% at 0% 100%, oklch(0.74 0.10 80 / 0.15), transparent 60%), linear-gradient(180deg, oklch(0.97 0.012 80) 0%, oklch(0.94 0.013 75) 100%)",
					}}
				/>
				<Container size="xl">
					<div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
						<div>
							<Eyebrow>B2B · Studio &amp; architekci</Eyebrow>
							<h1 className="mt-3 font-display text-[clamp(2.4rem,5.5vw,4.6rem)] font-semibold leading-[1.04]">
								Antyki z Wiednia dla Twoich projektów — z FV, rezerwacją i selekcją w 24h
							</h1>
							<Lead className="mt-6">
								Sprowadzamy unikaty bezpośrednio od wiedeńskich właścicieli. 100% pewność
								pochodzenia, transparentny stan, rezerwacja na czas prezentacji u klienta.
							</Lead>
							<div className="mt-8 flex flex-wrap items-center gap-3">
								<CtaLink href="#brief" variant="primary">
									Wyślij brief
								</CtaLink>
								<Link
									href={`https://wa.me/${STORE_INFO.whatsapp.replace(/\s|\+/g, "")}`}
									target="_blank"
									rel="noreferrer"
									className="inline-flex items-center gap-2 rounded-full border border-foreground/15 bg-background px-5 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-foreground hover:border-terracotta hover:text-terracotta"
								>
									<WhatsAppIcon className="size-4" />
									WhatsApp · 15 min call
								</Link>
							</div>
							<dl className="mt-10 grid grid-cols-3 gap-6 border-t border-border pt-6">
								<Stat label="Średni czas odpowiedzi" value="12 h" />
								<Stat label="Rezerwacja" value="14 dni" />
								<Stat label="Nowe dostawy" value="co 2 tyg" />
							</dl>
						</div>

						<div className="relative aspect-[5/6] w-full overflow-hidden rounded-3xl border border-border bg-card shadow-xl">
							<div
								aria-hidden
								className="absolute inset-0"
								style={{
									backgroundImage:
										"radial-gradient(70% 60% at 30% 20%, oklch(0.92 0.04 80), transparent 60%), linear-gradient(160deg, oklch(0.39 0.07 45), oklch(0.27 0.005 280))",
								}}
							/>
							<div className="relative flex h-full flex-col justify-between p-6 text-ink-foreground sm:p-8">
								<span className="rounded-full bg-ink/85 px-3 py-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-ink-foreground backdrop-blur">
									Realizacja · Studio Zaleska, Kraków
								</span>
								<p className="rounded-2xl border border-ink-foreground/30 bg-ink-foreground/15 p-5 font-display text-lg italic leading-snug backdrop-blur-md">
									„Trzy przedmioty z Wiednia zdefiniowały całe wnętrze. RetroHouse dostarczył w 5
									dni od briefu."
								</p>
							</div>
						</div>
					</div>
				</Container>
			</Section>

			<Section spacing="lg" id="warunki">
				<Container size="xl">
					<header className="mb-10 max-w-3xl">
						<Eyebrow>Warunki współpracy</Eyebrow>
						<h2 className="mt-3 font-display text-4xl font-semibold leading-tight md:text-5xl">
							Co dostajesz jako studio
						</h2>
					</header>
					<div className="overflow-hidden rounded-2xl border border-border bg-card">
						<table className="w-full text-left">
							<thead className="bg-cream text-xs uppercase tracking-[0.14em] text-foreground/60">
								<tr>
									<th className="px-5 py-3 font-semibold">Warunek</th>
									<th className="px-5 py-3 font-semibold">Detal</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-border text-sm">
								{TRADE_TERMS.map((term) => (
									<tr key={term.label}>
										<td className="px-5 py-4 font-semibold">{term.label}</td>
										<td className="px-5 py-4 text-foreground/80">{term.detail}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</Container>
			</Section>

			<Section spacing="lg" tone="muted">
				<Container size="xl">
					<header className="mb-10 max-w-2xl">
						<Eyebrow>Proces</Eyebrow>
						<h2 className="mt-3 font-display text-4xl font-semibold leading-tight md:text-5xl">
							Cztery kroki — od briefu do FV
						</h2>
					</header>
					<ol className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
						{PROCESS.map((step, index) => (
							<li
								key={step.title}
								className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-6"
							>
								<span className="font-display text-3xl font-semibold text-brass tabular">
									{String(index + 1).padStart(2, "0")}
								</span>
								<p className="font-display text-xl">{step.title}</p>
								<p className="text-sm text-foreground/70">{step.description}</p>
							</li>
						))}
					</ol>
				</Container>
			</Section>

			<Section spacing="lg">
				<Container size="xl">
					<header className="mb-10 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
						<div>
							<Eyebrow>Realizacje</Eyebrow>
							<h2 className="mt-3 font-display text-4xl font-semibold leading-tight md:text-5xl">
								Wybrane projekty z RetroHouse
							</h2>
						</div>
						<Link
							href="/blog?kategoria=realizacje"
							className="group/cta inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-foreground hover:text-terracotta"
						>
							Zobacz wszystkie na blogu
							<ArrowRightIcon className="size-4" />
						</Link>
					</header>
					<ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
						{CASE_STUDIES.map((study) => (
							<li
								key={study.slug}
								className="group/card flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-0.5 hover:shadow-lg"
							>
								<div className="relative aspect-[4/5] overflow-hidden">
									<div
										aria-hidden
										className="absolute inset-0 transition-transform duration-700 group-hover/card:scale-[1.04]"
										style={{
											backgroundImage: `radial-gradient(60% 60% at 30% 20%, ${study.hue}, transparent 60%), linear-gradient(160deg, oklch(0.55 0.08 60), oklch(0.27 0.005 280))`,
										}}
									/>
									<span className="absolute left-3 top-3 rounded-full bg-ink-foreground/85 px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-foreground backdrop-blur">
										{study.studio}
									</span>
								</div>
								<div className="flex flex-1 flex-col gap-2 p-5">
									<p className="text-xs text-brass">{study.city}</p>
									<h3 className="font-display text-lg leading-tight">{study.title}</h3>
									<p className="text-sm text-foreground/70">{study.summary}</p>
								</div>
							</li>
						))}
					</ul>
				</Container>
			</Section>

			<Section spacing="lg" tone="ink" id="brief">
				<Container size="xl">
					<div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
						<form
							action="/api/b2b-brief"
							method="post"
							className="rounded-3xl border border-ink-foreground/15 bg-ink-foreground/5 p-6 md:p-10"
						>
							<Eyebrow className="text-brass before:bg-brass">Formularz briefu B2B</Eyebrow>
							<h2 className="mt-3 font-display text-4xl font-semibold leading-tight">
								Wyślij brief — odpiszemy w 24h
							</h2>
							<p className="mt-2 text-ink-foreground/70">
								Im więcej szczegółów, tym lepsza selekcja. Nie potrzebujemy gotowych decyzji —
								wystarczy mood board i kierunek.
							</p>

							<div className="mt-6 grid gap-4 sm:grid-cols-2">
								<DarkField label="Imię i nazwisko" name="name" required />
								<DarkField label="Studio / firma" name="studio" required />
								<DarkField label="E-mail" name="email" type="email" required />
								<DarkField label="Telefon / WhatsApp" name="phone" type="tel" />
								<DarkField label="NIP (opcjonalnie)" name="nip" className="sm:col-span-2" />
								<DarkField
									label="Link do mood boardu lub opis briefu"
									name="brief"
									textarea
									required
									className="sm:col-span-2"
								/>
								<DarkSelect
									label="Budżet orientacyjny"
									name="budget"
									options={[
										{ value: "do-2k", label: "do 2 000 zł" },
										{ value: "2-5k", label: "2 000 – 5 000 zł" },
										{ value: "5-15k", label: "5 000 – 15 000 zł" },
										{ value: "15k-plus", label: "15 000+ zł" },
									]}
								/>
								<DarkSelect
									label="Termin realizacji"
									name="timeline"
									options={[
										{ value: "<2t", label: "< 2 tygodnie" },
										{ value: "2-4t", label: "2 – 4 tygodnie" },
										{ value: "1-3m", label: "1 – 3 miesiące" },
										{ value: "elastyczne", label: "Elastyczne" },
									]}
								/>
							</div>

							<label className="mt-4 flex items-start gap-2 text-sm text-ink-foreground/80">
								<input
									type="checkbox"
									name="newsletter"
									className="mt-1 size-4 rounded border-ink-foreground/30 bg-ink-foreground/10 text-brass"
								/>
								<span>
									Chcę dostawać priorytetowy newsletter B2B z nowymi dostawami z Wiednia (48 h przed
									publikacją w sklepie).
								</span>
							</label>

							<button
								type="submit"
								className="mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-terracotta px-6 text-sm font-semibold uppercase tracking-[0.16em] text-foreground transition-transform hover:translate-y-[-1px]"
							>
								Wyślij brief
								<ArrowRightIcon className="size-4" />
							</button>
							<p className="mt-3 text-xs text-ink-foreground/60">
								Odpowiemy w ciągu 24 h roboczych. Priorytet na zapytania B2B.
							</p>
						</form>

						<aside className="space-y-4">
							<div className="rounded-2xl border border-ink-foreground/15 bg-ink-foreground/5 p-6 text-sm">
								<Eyebrow className="text-brass before:bg-brass">Dlaczego my</Eyebrow>
								<ul className="mt-4 space-y-3">
									<TrustItem
										icon={<CheckIcon className="size-4" />}
										title="Odpowiemy w 24 h"
										description="Gwarancja czasu reakcji — średnia 12 h."
									/>
									<TrustItem
										icon={<PackageIcon className="size-4" />}
										title="Rezerwacja 14 dni"
										description="Bezpieczna prezentacja u klienta."
									/>
									<TrustItem
										icon={<GiftIcon className="size-4" />}
										title="Priorytetowy dostęp"
										description="Newsletter B2B 48 h przed publikacją w sklepie."
									/>
									<TrustItem
										icon={<HeartIcon className="size-4" />}
										title="Pochodzenie 100%"
										description="Każdy obiekt z udokumentowaną historią z Wiednia."
									/>
								</ul>
							</div>

							<div className="rounded-2xl border border-ink-foreground/15 bg-ink-foreground/5 p-6 text-sm">
								<Eyebrow className="text-brass before:bg-brass">Bezpośredni kontakt</Eyebrow>
								<ul className="mt-4 space-y-3">
									<li className="flex items-start gap-3">
										<PhoneIcon className="mt-0.5 size-4 text-brass" />
										<div>
											<p className="font-semibold text-ink-foreground">{STORE_INFO.phone}</p>
											<p className="text-ink-foreground/60">wt–pt 11–18, sob 10–14</p>
										</div>
									</li>
									<li className="flex items-start gap-3">
										<WhatsAppIcon className="mt-0.5 size-4 text-brass" />
										<Link
											href={`https://wa.me/${STORE_INFO.whatsapp.replace(/\s|\+/g, "")}`}
											target="_blank"
											rel="noreferrer"
											className="text-ink-foreground hover:text-terracotta"
										>
											WhatsApp · 15 min call
										</Link>
									</li>
									<li className="flex items-start gap-3">
										<CompassIcon className="mt-0.5 size-4 text-brass" />
										<Link
											href={`mailto:${STORE_INFO.emailB2B}`}
											className="text-ink-foreground hover:text-terracotta"
										>
											{STORE_INFO.emailB2B}
										</Link>
									</li>
								</ul>
							</div>
						</aside>
					</div>
				</Container>
			</Section>

			<Section spacing="lg" tone="muted">
				<Container size="md">
					<Eyebrow>FAQ projektantów</Eyebrow>
					<h2 className="mt-3 font-display text-3xl font-semibold leading-tight md:text-4xl">
						Pytania, które dostajemy najczęściej
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
					<div className="rounded-3xl border border-border bg-card p-8 text-center md:p-12">
						<Eyebrow className="justify-center">Masz projekt w trakcie?</Eyebrow>
						<h2 className="mt-3 font-display text-3xl font-semibold leading-tight md:text-4xl">
							Napisz — odpiszemy w 24h
						</h2>
						<p className="mx-auto mt-3 max-w-xl text-foreground/70">
							Krótki brief wystarczy. Pomożemy uciąć czas selekcji o połowę.
						</p>
						<div className="mt-6 flex flex-wrap items-center justify-center gap-3">
							<CtaLink href="#brief">Wypełnij brief</CtaLink>
							<Link
								href={`https://wa.me/${STORE_INFO.whatsapp.replace(/\s|\+/g, "")}`}
								target="_blank"
								rel="noreferrer"
								className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-5 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-foreground hover:border-terracotta hover:text-terracotta"
							>
								<WhatsAppIcon className="size-4" />
								WhatsApp
							</Link>
						</div>
					</div>
				</Container>
			</Section>
		</main>
	);
}

function Stat({ label, value }: { label: string; value: string }) {
	return (
		<div>
			<dt className="text-xs uppercase tracking-[0.18em] text-foreground/60">{label}</dt>
			<dd className="mt-1 font-display text-2xl font-semibold text-foreground">{value}</dd>
		</div>
	);
}

function TrustItem({
	icon,
	title,
	description,
}: {
	icon: React.ReactNode;
	title: string;
	description: string;
}) {
	return (
		<li className="flex items-start gap-3">
			<span className="mt-0.5 grid size-7 place-items-center rounded-full bg-ink-foreground/10 text-brass">
				{icon}
			</span>
			<div>
				<p className="font-semibold text-ink-foreground">{title}</p>
				<p className="text-ink-foreground/70">{description}</p>
			</div>
		</li>
	);
}

function DarkField({
	label,
	name,
	type = "text",
	textarea,
	required,
	className,
}: {
	label: string;
	name: string;
	type?: string;
	textarea?: boolean;
	required?: boolean;
	className?: string;
}) {
	const id = `b2b-${name}`;
	return (
		<label htmlFor={id} className={className}>
			<span className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-foreground/70">
				{label} {required ? <span aria-hidden>*</span> : null}
			</span>
			{textarea ? (
				<textarea
					id={id}
					name={name}
					required={required}
					rows={5}
					minLength={50}
					className="mt-2 w-full rounded-xl border border-ink-foreground/20 bg-ink-foreground/10 px-3 py-2 text-sm text-ink-foreground placeholder:text-ink-foreground/50 focus-visible:border-terracotta focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta"
					placeholder="Mood board, paleta, klucz designerski, status projektu…"
				/>
			) : (
				<input
					id={id}
					name={name}
					type={type}
					required={required}
					className="mt-2 h-11 w-full rounded-xl border border-ink-foreground/20 bg-ink-foreground/10 px-3 text-sm text-ink-foreground placeholder:text-ink-foreground/50 focus-visible:border-terracotta focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta"
				/>
			)}
		</label>
	);
}

function DarkSelect({
	label,
	name,
	options,
}: {
	label: string;
	name: string;
	options: Array<{ value: string; label: string }>;
}) {
	const id = `b2b-${name}`;
	return (
		<label htmlFor={id}>
			<span className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-foreground/70">
				{label}
			</span>
			<select
				id={id}
				name={name}
				defaultValue=""
				className="mt-2 h-11 w-full rounded-xl border border-ink-foreground/20 bg-ink-foreground/10 px-3 text-sm text-ink-foreground focus-visible:border-terracotta focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta"
			>
				<option value="" disabled>
					Wybierz…
				</option>
				{options.map((option) => (
					<option key={option.value} value={option.value}>
						{option.label}
					</option>
				))}
			</select>
		</label>
	);
}
