import type { Metadata } from "next";
import { Suspense } from "react";
import { Breadcrumbs, Container, Eyebrow, Section } from "@/components/primitives";
import { KontoDashboard } from "./konto-dashboard";

export const metadata: Metadata = {
	title: "Moje konto",
	description:
		"Panel klienta RetroHouse: zamówienia, reklamacje i odstąpienie od umowy. Logowanie kodem na e-mail z zamówienia.",
	robots: { index: false, follow: false },
	alternates: { canonical: "/konto" },
};

export default function KontoPage() {
	return (
		<main id="main" className="flex flex-col">
			<Section spacing="sm">
				<Container size="md">
					<Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Moje konto" }]} />
				</Container>
			</Section>

			<Section spacing="md">
				<Container size="md">
					<Eyebrow>Panel klienta</Eyebrow>
					<h1 className="mt-3 font-display text-[clamp(2rem,4vw,3rem)] font-semibold leading-[1.08]">
						Moje konto
					</h1>
					<p className="mt-3 max-w-xl text-foreground/70">
						Zamówienia, reklamacje i zwroty w jednym miejscu — bez ponownego logowania na
						każdej stronie.
					</p>

					<div className="mt-8">
						<Suspense
							fallback={
								<div className="py-16 text-center text-foreground/70">Ładowanie…</div>
							}
						>
							<KontoDashboard />
						</Suspense>
					</div>
				</Container>
			</Section>
		</main>
	);
}
