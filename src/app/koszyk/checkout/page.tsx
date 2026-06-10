import type { Metadata } from "next";
import { Breadcrumbs, Container, Section } from "@/components/primitives";
import { CheckoutPageContent } from "./checkout-page-content";

export const metadata: Metadata = {
	title: "Płatność i dostawa",
	description: "Krok 2 z 3 — adres dostawy, sposób wysyłki i bezpieczna płatność Tpay.",
	robots: { index: false, follow: false },
};

export default function CheckoutPage() {
	return (
		<main id="main" className="flex flex-col">
			<Section spacing="sm">
				<Container size="xl">
					<Breadcrumbs
						items={[
							{ label: "Home", href: "/" },
							{ label: "Koszyk", href: "/koszyk" },
							{ label: "Płatność" },
						]}
					/>
				</Container>
			</Section>

			<CheckoutPageContent />
		</main>
	);
}
