import type { Metadata } from "next";
import { Breadcrumbs, Container, Section } from "@/components/primitives";
import { CartContent } from "./cart-content";

export const metadata: Metadata = {
	title: "Koszyk",
	description:
		"Twój koszyk z unikatami z Wiednia. Każdy przedmiot rezerwowany na 15 minut. Bezpieczna płatność Przelewy24.",
	robots: { index: false, follow: false },
};

export default function KoszykPage() {
	return (
		<main id="main" className="flex flex-col">
			<Section spacing="sm">
				<Container size="xl">
					<Breadcrumbs
						items={[
							{ label: "Home", href: "/" },
							{ label: "Sklep", href: "/sklep" },
							{ label: "Koszyk" },
						]}
					/>
				</Container>
			</Section>

			<CartContent />
		</main>
	);
}
