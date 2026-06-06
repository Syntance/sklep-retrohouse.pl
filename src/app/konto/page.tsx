import type { Metadata } from "next";
import { Suspense } from "react";
import { Breadcrumbs, Container, Eyebrow, Section } from "@/components/primitives";
import { LEGAL_DOCUMENT_CONTACT } from "@/components/sections/legal-document-contact/presets";
import { LegalDocumentContactSection } from "@/components/sections/legal-document-contact/section";
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
					<Eyebrow className="mt-[50px]">Moje konto</Eyebrow>
					<div className="mt-6">
						<Suspense
							fallback={<div className="py-16 text-center text-foreground/70">Ładowanie…</div>}
						>
							<KontoDashboard />
						</Suspense>
					</div>
				</Container>
			</Section>

			<LegalDocumentContactSection {...LEGAL_DOCUMENT_CONTACT.konto} />
		</main>
	);
}
