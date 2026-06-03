import type { Metadata } from "next";
import { Suspense } from "react";
import {
	CheckIcon,
	CompassIcon,
	GiftIcon,
	HeartIcon,
	PackageIcon,
	PhoneIcon,
	WhatsAppIcon,
} from "@/components/icons";
import { STORE_INFO } from "@/components/layout/site-header/nav-data";
import { Breadcrumbs, Container, Eyebrow, Lead, Section } from "@/components/primitives";
import { B2B_STATS } from "@/lib/mock/case-studies";
import { B2BFinalCta, B2BHeroCta, B2BWhatsAppLink } from "./b2b-cta";
import { BriefForm } from "./brief-form";

export const metadata: Metadata = {
	title: "Dla projektantów wnętrz — antyki z Wiednia z FV i rezerwacją 14 dni",
	description:
		"Sprowadzamy unikaty bezpośrednio od wiedeńskich właścicieli. 100% pewność pochodzenia, transparentny stan, rezerwacja 14 dni.",
	alternates: { canonical: "/dla-projektantow" },
};

const TRADE_TERMS = [
	{ label: "Rabat trade", detail: "10–15% od 3 sztuk lub koszyka >2 000 zł" },
	{ label: "Rezerwacja", detail: "Do 14 dni bez płatności — na czas prezentacji u klienta" },
	{ label: "FV VAT", detail: "Standardowo. NIP + dane firmy w briefie" },
	{ label: "Priorytetowy dostęp", detail: "Nowe dostawy z Wiednia e-mailem 48 h przed publikacją" },
	{ label: "Płatność", detail: "Przelew, termin 14 dni od odbioru" },
	{ label: "Dostawa", detail: "Kurier ubezpieczony, odbiór w NT, dostarczenie na plac budowy" },
];

const PROCESS = [
	{ title: "Wyślij brief", description: "Mood board (PDF / link / zdjęcia), opis stylistyki, budżet, termin." },
	{ title: "Selekcja w 24 h", description: "E-mailem dostajesz 3–5 propozycji z fotografią i pochodzeniem każdego obiektu." },
	{ title: "Rezerwacja 14 dni", description: "Wybrane przedmioty blokujemy — masz czas pokazać klientowi." },
	{ title: "FV VAT + dostawa", description: "Faktura po zatwierdzeniu, kurier ubezpieczony lub odbiór w NT." },
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
	const whatsappHref = `https://wa.me/${STORE_INFO.whatsapp.replace(/\s|\+/g, "")}`;
	const callMailto = `mailto:${STORE_INFO.emailB2B}?subject=Umowienie%20calla%2015%20min%20z%20RetroHouse`;

	return (
		<main id="main" className="flex flex-col">
			<Section spacing="sm">
				<Container size="xl">
					<Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Dla projektantów" }]} />
				</Container>
			</Section>

			<Section spacing="lg" className="overflow-hidden">
				<div
					aria-hidden="true"
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
							<div className="mt-8">
								<Suspense fallback={null}>
									<B2BHeroCta whatsappHref={whatsappHref} callMailto={callMailto} />
								</Suspense>
							</div>

							<dl className="mt-10 grid grid-cols-2 gap-6 border-t border-border pt-6 sm:grid-cols-4">
								{B2B_STATS.map((stat) => (
									<div key={stat.label}>
										<dt className="text-xs uppercase tracking-[0.18em] text-foreground/60">
											{stat.label}
										</dt>
										<dd className="mt-1 font-display text-2xl font-semibold text-foreground">
											{stat.value}
										</dd>
									</div>
								))}
							</dl>
						</div>

						<div className="relative aspect-[5/6] w-full overflow-hidden rounded-3xl border border-border bg-card shadow-xl">
							<div
								aria-hidden="true"
								className="absolute inset-0"
								style={{
									backgroundImage:
										"radial-gradient(70% 60% at 30% 20%, oklch(0.92 0.04 80), transparent 60%), linear-gradient(160deg, oklch(0.39 0.07 45), oklch(0.27 0.005 280))",
								}}
							/>
							<div className="relative flex h-full flex-col justify-between p-6 text-ink-foreground sm:p-8">
								<span className="rounded-full bg-ink/85 px-3 py-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-ink-foreground backdrop-blur">
									Mood board → selekcja w 24 h
								</span>
								<p className="rounded-2xl border border-ink-foreground/30 bg-ink-foreground/15 p-5 font-display text-lg italic leading-snug backdrop-blur-md">
									Trzy przedmioty z Wiednia potrafią zdefiniować całe wnętrze. Selekcję
									przygotowujemy w 24 godziny od briefu.
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

			<Section spacing="lg" id="zaufanie">
				<Container size="xl">
					<header className="mb-10 max-w-2xl">
						<Eyebrow>Zaufanie</Eyebrow>
						<h2 className="mt-3 font-display text-4xl font-semibold leading-tight md:text-5xl">
							Bezpośredni kontakt z założycielami — bez działu sprzedaży
						</h2>
					</header>

					<aside className="grid gap-5 rounded-3xl border border-walnut/15 bg-card p-6 md:grid-cols-[1fr_1.2fr] md:p-8">
						<div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
							<div
								aria-hidden="true"
								className="absolute inset-0"
								style={{
									backgroundImage:
										"radial-gradient(60% 60% at 30% 20%, oklch(0.92 0.04 80), transparent 60%), linear-gradient(160deg, oklch(0.74 0.06 50), oklch(0.39 0.07 45))",
								}}
							/>
							<span className="absolute bottom-3 left-3 rounded-full bg-ink-foreground/85 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-foreground backdrop-blur">
								Założyciele RetroHouse
							</span>
						</div>
						<div>
							<Eyebrow variant="script">poznajcie nas</Eyebrow>
							<p className="mt-3 font-display text-2xl leading-snug text-foreground">
								Pakujemy paczki, jeździmy do Wiednia, odpisujemy na briefy. Wszystko sami.
							</p>
							<p className="mt-3 text-sm text-foreground/70">
								Bez działu sprzedaży i pośredników. Twoje studio trafia bezpośrednio do osoby,
								która stoi w wiedeńskim mieszkaniu i sprawdza sygnatury — przewaga, której nie
								da inny antykwariat.
							</p>
						</div>
					</aside>

					<aside className="mt-6 rounded-3xl border border-dashed border-walnut/30 bg-cream/40 p-6 text-sm md:p-8">
						<Eyebrow>Pierwsze realizacje</Eyebrow>
						<p className="mt-3 max-w-2xl font-display text-xl leading-snug">
							Zbieramy referencje od pierwszych studiów, z którymi pracujemy w 2026 r.
						</p>
						<p className="mt-2 max-w-2xl text-foreground/70">
							Chcesz być pierwszym studiem, którego realizację tu opublikujemy? Wyślij brief —
							case study przygotowujemy razem (z mood boardem, fotografią profesjonalną i kartą
							pochodzenia każdego obiektu).
						</p>
					</aside>
				</Container>
			</Section>

			<Section spacing="lg" tone="ink" id="brief">
				<Container size="xl">
					<div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
						<BriefForm />

						<aside className="space-y-4">
							<div className="rounded-2xl border border-ink-foreground/15 bg-ink-foreground/5 p-6 text-sm">
								<Eyebrow className="text-brass before:bg-brass">Dlaczego my</Eyebrow>
								<ul className="mt-4 space-y-3">
									<TrustItem
										icon={<CheckIcon className="size-4" />}
										title="Odpowiemy w 24 h"
										description="Gwarancja czasu reakcji w dni robocze."
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
										<B2BWhatsAppLink
											href={whatsappHref}
											className="text-ink-foreground hover:text-terracotta"
										>
											WhatsApp · 15 min call
										</B2BWhatsAppLink>
									</li>
									<li className="flex items-start gap-3">
										<CompassIcon className="mt-0.5 size-4 text-brass" />
										<a
											href={`mailto:${STORE_INFO.emailB2B}`}
											className="text-ink-foreground hover:text-terracotta"
										>
											{STORE_INFO.emailB2B}
										</a>
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
										aria-hidden="true"
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
						<div className="mt-6">
							<B2BFinalCta
								whatsappHref={whatsappHref}
								emailHref={`mailto:${STORE_INFO.emailB2B}`}
							/>
						</div>
					</div>
				</Container>
			</Section>
		</main>
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
