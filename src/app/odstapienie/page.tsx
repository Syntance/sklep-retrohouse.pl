import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs, Container, Eyebrow, Section } from "@/components/primitives";

export const metadata: Metadata = {
	title: "Odstąpienie od umowy",
	description:
		"Prawo odstąpienia od umowy zawartej na odległość — 14 dni bez podania przyczyny (art. 27 UPK). Formularz i procedura.",
	robots: { index: true, follow: true },
};

/**
 * Strona /odstapienie — placeholder na treść od prawnika.
 *
 * Minimalne wymogi UPK (art. 27–38):
 *  - pouczenie o prawie odstąpienia (termin, sposób, skutki)
 *  - wzór formularza odstąpienia (załącznik nr 2 do UPK)
 *  - koszty zwrotu (kupujący ponosi)
 *  - termin zwrotu pieniędzy (14 dni od dostawy zwrotu)
 *  - odpowiedzialność za zmniejszenie wartości (art. 34 ust. 4)
 *
 * TODO: uzupełnij treść po konsultacji z radcą prawnym.
 */
export default function OdstapienePage() {
	return (
		<main id="main" className="flex flex-col">
			<Section spacing="sm">
				<Container size="md">
					<Breadcrumbs
						items={[{ label: "Home", href: "/" }, { label: "Odstąpienie od umowy" }]}
					/>
				</Container>
			</Section>

			<Section spacing="md">
				<Container size="md">
					<Eyebrow>Twoje prawa · art. 27 UPK</Eyebrow>
					<h1 className="mt-3 font-display text-[clamp(2.4rem,5vw,4rem)] font-semibold leading-[1.05]">
						Odstąpienie od umowy
					</h1>
					<p className="mt-4 max-w-2xl text-foreground/70">
						Prawo do zwrotu bez podania przyczyny — 14 dni od dnia dostawy.
					</p>

					<aside className="mt-6 rounded-2xl border border-brass/40 bg-terracotta/15 p-5 text-sm">
						<p className="font-display text-base font-semibold">Treść w opracowaniu</p>
						<p className="mt-1 text-foreground/80">
							Pełna treść pouczenia, formularz odstąpienia (załącznik nr 2 do UPK) oraz
							procedura krok po kroku zostaną uzupełnione przez radcę prawnego przed
							uruchomieniem sprzedaży.
						</p>
					</aside>

					<div className="mt-8 space-y-6 text-foreground/80 leading-relaxed">
						<p>
							Masz <strong className="font-semibold text-foreground">14 dni</strong> na
							odstąpienie od umowy zawartej na odległość, licząc od dnia otrzymania przesyłki
							— bez podania przyczyny (art. 27 ustawy o prawach konsumenta z 30.05.2014).
						</p>
						<p>
							Antyki to rzeczy używane. Zapoznajesz się z opisem stanu przedmiotu przed
							zakupem i akceptujesz go w koszyku — opisane ślady użytkowania nie są
							podstawą reklamacji.
						</p>
						<p>
							Odpowiadasz finansowo za zmniejszenie wartości przedmiotu wynikłe z korzystania
							ponad to, co konieczne do sprawdzenia jego charakteru (art. 34 ust. 4 UPK).
						</p>
						<p className="rounded-xl border border-border bg-card p-4 text-sm">
							Aby odstąpić od umowy — napisz na{" "}
							<Link
								href="mailto:kontakt@sklep-retrohouse.pl"
								className="font-semibold underline underline-offset-4 hover:text-terracotta"
							>
								kontakt@sklep-retrohouse.pl
							</Link>{" "}
							z numerem zamówienia. Formularz w formacie PDF zostanie udostępniony
							w e-mailu z potwierdzeniem zamówienia.
						</p>
					</div>
				</Container>
			</Section>
		</main>
	);
}
