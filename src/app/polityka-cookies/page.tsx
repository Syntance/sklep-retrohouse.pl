import type { Metadata } from "next";
import { Breadcrumbs, Container, Eyebrow, Section } from "@/components/primitives";
import { CookieSettingsButton } from "@/components/layout/site-footer/cookie-settings-button";
import { LEGAL_DOCUMENT_CONTACT } from "@/components/sections/legal-document-contact/presets";
import { LegalDocumentContactSection } from "@/components/sections/legal-document-contact/section";

export const metadata: Metadata = {
	title: "Polityka cookies",
	description:
		"Informacja o plikach cookie i innych technologiach śledzących stosowanych przez RetroHouse.",
	robots: { index: true, follow: true },
};

/**
 * Strona /polityka-cookies — placeholder na treść od prawnika.
 *
 * Wymogi art. 173 Prawa telekomunikacyjnego + stanowisko UODO 2023:
 *  - jakie kategorie cookies (niezbędne, analityczne, marketingowe)
 *  - kto je umieszcza (RetroHouse + third-party: PostHog, Sentry, Vercel)
 *  - jak zarządzać zgodami (przycisk Ustawienia cookies + link do banera)
 *  - brak pre-check na opcjonalnych (ciemny wzorzec = kara UODO)
 *
 * TODO: uzupełnij treść po konsultacji z radcą prawnym.
 */
export default function PolitykaCookiesPage() {
	return (
		<main id="main" className="flex flex-col">
			<Section spacing="sm">
				<Container size="md">
					<Breadcrumbs
						items={[{ label: "Home", href: "/" }, { label: "Polityka cookies" }]}
					/>
				</Container>
			</Section>

			<Section spacing="md">
				<Container size="md">
					<Eyebrow>Prawo telekomunikacyjne · art. 173</Eyebrow>
					<h1 className="mt-3 font-display text-[clamp(2.4rem,5vw,4rem)] font-semibold leading-[1.05]">
						Polityka cookies
					</h1>
					<p className="mt-4 max-w-2xl text-foreground/70">
						Informacja o plikach cookie i zarządzaniu zgodami.
					</p>

					<aside className="mt-6 rounded-2xl border border-brass/40 bg-terracotta/15 p-5 text-sm">
						<p className="font-display text-base font-semibold">Treść w opracowaniu</p>
						<p className="mt-1 text-foreground/80">
							Pełna polityka cookies — kategorie, dostawcy, okresy przechowywania —
							zostanie uzupełniona przez radcę prawnego przed uruchomieniem sprzedaży.
						</p>
					</aside>

					<div className="mt-8 space-y-6 text-foreground/80 leading-relaxed">
						<p>
							RetroHouse używa plików cookie i podobnych technologii wyłącznie po uzyskaniu
							Twojej zgody (z wyjątkiem cookies niezbędnych do działania serwisu).
						</p>
						<div className="rounded-xl border border-border bg-card p-4 text-sm">
							<p className="font-semibold text-foreground">Zarządzaj ustawieniami</p>
							<p className="mt-1 text-foreground/70">
								Możesz w każdej chwili zmienić swoje preferencje dotyczące plików cookie.
							</p>
							<div className="mt-3">
								<CookieSettingsButton />
							</div>
						</div>
					</div>
				</Container>
			</Section>

			<LegalDocumentContactSection {...LEGAL_DOCUMENT_CONTACT.cookies} />
		</main>
	);
}
