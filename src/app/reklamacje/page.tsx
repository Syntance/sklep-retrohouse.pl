import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs, Container, Eyebrow, Section } from "@/components/primitives";

export const metadata: Metadata = {
	title: "Reklamacje",
	description:
		"Procedura reklamacyjna RetroHouse — rękojmia, uszkodzenia podczas transportu, terminy rozpatrzenia.",
	robots: { index: true, follow: true },
};

/**
 * Strona /reklamacje — placeholder na treść od prawnika.
 *
 * Minimalne wymogi UPK / KC:
 *  - rękojmia za wady (2 lata, rzeczy używane — min. 1 rok; art. 43a–43g UPK)
 *  - uszkodzenia transportowe (24 h na zgłoszenie ze zdjęciami)
 *  - termin rozpatrzenia (14 dni)
 *  - wynik: zwrot lub obniżka ceny (wymiana niemożliwa — unikat)
 *  - dane kontaktowe do reklamacji
 *
 * TODO: uzupełnij treść po konsultacji z radcą prawnym.
 */
export default function ReklamacjePage() {
	return (
		<main id="main" className="flex flex-col">
			<Section spacing="sm">
				<Container size="md">
					<Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Reklamacje" }]} />
				</Container>
			</Section>

			<Section spacing="md">
				<Container size="md">
					<Eyebrow>Rękojmia · UPK art. 43a</Eyebrow>
					<h1 className="mt-3 font-display text-[clamp(2.4rem,5vw,4rem)] font-semibold leading-[1.05]">
						Reklamacje
					</h1>
					<p className="mt-4 max-w-2xl text-foreground/70">
						Jak zgłosić reklamację i jakie masz prawa.
					</p>

					<aside className="mt-6 rounded-2xl border border-brass/40 bg-terracotta/15 p-5 text-sm">
						<p className="font-display text-base font-semibold">Treść w opracowaniu</p>
						<p className="mt-1 text-foreground/80">
							Pełna procedura reklamacyjna, w tym warunki rękojmi za wady rzeczy używanych,
							zostanie uzupełniona przez radcę prawnego przed uruchomieniem sprzedaży.
						</p>
					</aside>

					<div className="mt-8 space-y-6 text-foreground/80 leading-relaxed">
						<p>
							Reklamacje rozpatrujemy w terminie{" "}
							<strong className="font-semibold text-foreground">14 dni</strong> od zgłoszenia.
						</p>
						<p>
							W przypadku uszkodzenia podczas transportu — zgłoś reklamację ze zdjęciami
							paczki i przedmiotu w ciągu 24 h od dostawy. Zwracamy pieniądze lub obniżamy
							cenę. Wymiana jest niemożliwa, bo każdy antyk to unikat.
						</p>
						<p>
							Opis stanu przedmiotu akceptujesz w koszyku przed zakupem — opisane ślady
							użytkowania nie stanowią wady w rozumieniu rękojmi.
						</p>
						<p className="rounded-xl border border-border bg-card p-4 text-sm">
							Reklamacje przyjmujemy przez e-mail:{" "}
							<Link
								href="mailto:kontakt@retrohouse.pl"
								className="font-semibold underline underline-offset-4 hover:text-terracotta"
							>
								kontakt@retrohouse.pl
							</Link>{" "}
							lub przez{" "}
							<Link
								href="/kontakt"
								className="font-semibold underline underline-offset-4 hover:text-terracotta"
							>
								formularz kontaktowy
							</Link>
							.
						</p>
					</div>
				</Container>
			</Section>
		</main>
	);
}
