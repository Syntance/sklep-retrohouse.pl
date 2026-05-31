import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs, Container, Eyebrow, Section } from "@/components/primitives";

export const metadata: Metadata = {
	title: "Deklaracja dostępności",
	description:
		"Status zgodności z WCAG 2.2 AA. Zgodnie z European Accessibility Act od 28.06.2025.",
	robots: { index: true, follow: true },
};

export default function DeklaracjaPage() {
	return (
		<main id="main" className="flex flex-col">
			<Section spacing="sm">
				<Container size="md">
					<Breadcrumbs
						items={[{ label: "Home", href: "/" }, { label: "Deklaracja dostępności" }]}
					/>
				</Container>
			</Section>

			<Section spacing="md">
				<Container size="md">
					<Eyebrow>WCAG 2.2 AA · EAA 2025</Eyebrow>
					<h1 className="mt-3 font-display text-[clamp(2.4rem,5vw,4rem)] font-semibold leading-[1.05]">
						Deklaracja dostępności
					</h1>
					<p className="mt-4 max-w-2xl text-foreground/70">
						Sklep RetroHouse zobowiązuje się zapewnić dostępność strony zgodnie z European
						Accessibility Act (EAA) i Web Content Accessibility Guidelines 2.2 na poziomie AA.
					</p>
				</Container>
			</Section>

			<Section spacing="md">
				<Container size="md">
					<dl className="grid gap-y-4 rounded-2xl border border-border bg-card p-6 sm:grid-cols-[200px_1fr] md:p-8">
						<Row label="Status zgodności" value="Częściowa zgodność" />
						<Row label="Data publikacji" value={new Date().toLocaleDateString("pl-PL")} />
						<Row label="Data ostatniego przeglądu" value={new Date().toLocaleDateString("pl-PL")} />
						<Row
							label="Metoda oceny"
							value="Self-audit (axe DevTools, WAVE, manual VoiceOver/NVDA)"
						/>
						<Row label="Standard" value="WCAG 2.2 AA + EAA" />
						<Row label="Koordynator dostępności" value="Magdalena · access@sklep-retrohouse.pl" />
					</dl>
				</Container>
			</Section>

			<Section spacing="md">
				<Container size="md">
					<h2 className="font-display text-2xl font-semibold">Co już działa</h2>
					<ul className="mt-3 list-disc space-y-1 pl-6 text-foreground/80">
						<li>Skip-link „Przejdź do treści" jako pierwszy fokusowalny element</li>
						<li>Landmark roles: header, nav, main, footer</li>
						<li>Focus-visible z mosiądzowym outline na każdym interaktywnym elemencie</li>
						<li>Kontrast tekstów ≥ 4.5:1, UI ≥ 3:1</li>
						<li>Target size ≥ 24×24 px (WCAG 2.2)</li>
						<li>Wsparcie dla prefers-reduced-motion (animacje wyłączone)</li>
						<li>Aria-labels dla ikon, ról i statusów dynamicznych</li>
					</ul>

					<h2 className="mt-10 font-display text-2xl font-semibold">Co jest w trakcie</h2>
					<ul className="mt-3 list-disc space-y-1 pl-6 text-foreground/80">
						<li>Pełny audit WCAG 2.2 AA (planowany)</li>
						<li>Test screen reader matrix: VoiceOver / NVDA / TalkBack</li>
						<li>Pełne tłumaczenie alt-textów dla zdjęć produktów</li>
						<li>Tryb wysokiego kontrastu (forced-colors)</li>
					</ul>

					<h2 className="mt-10 font-display text-2xl font-semibold">
						Zgłoś problem z dostępnością
					</h2>
					<p className="mt-2 text-foreground/80">
						Jeśli napotkasz problem z dostępnością, napisz na{" "}
						<Link
							href="mailto:access@sklep-retrohouse.pl"
							className="font-semibold text-foreground underline underline-offset-4 hover:text-terracotta"
						>
							access@sklep-retrohouse.pl
						</Link>
						lub przez{" "}
						<Link
							href="/kontakt"
							className="font-semibold text-foreground underline underline-offset-4 hover:text-terracotta"
						>
							formularz kontaktowy
						</Link>
						. Odpowiemy w ciągu 14 dni roboczych. W przypadku braku satysfakcjonującej odpowiedzi
						możesz złożyć skargę do{" "}
						<Link
							href="https://uodo.gov.pl"
							target="_blank"
							rel="noreferrer"
							className="font-semibold text-foreground underline underline-offset-4 hover:text-terracotta"
						>
							UODO
						</Link>{" "}
						lub Rzecznika Praw Obywatelskich.
					</p>
				</Container>
			</Section>
		</main>
	);
}

function Row({ label, value }: { label: string; value: string }) {
	return (
		<div className="contents">
			<dt className="border-b border-border py-3 text-sm font-semibold uppercase tracking-[0.14em] text-foreground/60">
				{label}
			</dt>
			<dd className="border-b border-border py-3 text-sm text-foreground">{value}</dd>
		</div>
	);
}
