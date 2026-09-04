import type { Metadata } from "next";
import { Breadcrumbs, Container, Section } from "@/components/primitives";
import {
	FALLBACK_SHIPPING_OPTIONS,
	listCheckoutShippingOptions,
} from "@/lib/checkout/shipping-options";
import { CheckoutPageContent } from "./checkout-page-content";

export const metadata: Metadata = {
	title: "Płatność i dostawa",
	description: "Krok 2 z 3 — adres dostawy, sposób wysyłki i bezpieczna płatność Przelewy24.",
	robots: { index: false, follow: false },
};

/**
 * Dynamiczna: metody wysyłki i ich ceny pochodzą z Medusy i są edytowalne w
 * /magazyn. Prerender zapiekłby listę z czasu builda (a na buildzie nie ma
 * poświadczeń, więc zapiekłby wariant awaryjny) — klient widziałby nieaktualne
 * ceny dostawy.
 */
export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
	// Metody wysyłki z Medusy (nazwa, cena, widoczność ustawiane w /magazyn).
	// Brak tokenu serwisowego → lista awaryjna, żeby checkout nie padł.
	const fetched = await listCheckoutShippingOptions();
	const shippingOptions = fetched.length > 0 ? fetched : FALLBACK_SHIPPING_OPTIONS;

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

			<CheckoutPageContent shippingOptions={shippingOptions} />
		</main>
	);
}
