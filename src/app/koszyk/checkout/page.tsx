import type { Metadata } from "next";
import { CheckoutProgress } from "@/components/checkout-progress";
import { Breadcrumbs, Container, CtaLink, Eyebrow, Section } from "@/components/primitives";
import { PRODUCTS } from "@/lib/mock/products";
import { CheckoutForm } from "./checkout-form";

export const metadata: Metadata = {
	title: "Płatność i dostawa",
	description: "Krok 2 z 3 — adres dostawy, sposób wysyłki i bezpieczna płatność Przelewy24.",
	robots: { index: false, follow: false },
};

const SAMPLE_ITEMS = PRODUCTS.slice(0, 2);

export default function CheckoutPage() {
	const subtotal = SAMPLE_ITEMS.reduce((acc, item) => acc + item.price, 0);

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

			<Section spacing="md">
				<Container size="xl">
					<div className="mb-10">
						<Eyebrow>Krok 2 z 3 · Dane / Wysyłka / Płatność</Eyebrow>
						<h1 className="mt-3 font-display text-5xl font-semibold leading-tight md:text-6xl">
							Płatność i dostawa
						</h1>
					</div>

					<CheckoutProgress step={2} />

					<CheckoutForm items={SAMPLE_ITEMS} subtotal={subtotal} />
				</Container>
			</Section>

			<Section spacing="md" tone="muted">
				<Container size="md">
					<div className="rounded-3xl border border-border bg-card p-8 text-center md:p-12">
						<Eyebrow className="justify-center">Wątpliwości?</Eyebrow>
						<h2 className="mt-3 font-display text-3xl font-semibold leading-tight md:text-4xl">
							Napisz — odpowiemy w kilka minut
						</h2>
						<p className="mx-auto mt-3 max-w-xl text-foreground/70">
							Każdy przedmiot to unikat. Jeśli masz pytanie o stan, wymiary albo wysyłkę — wolimy
							odpowiedzieć przed zakupem niż po.
						</p>
						<div className="mt-6 flex flex-wrap items-center justify-center gap-3">
							<CtaLink href="/kontakt">Zapytaj o cokolwiek</CtaLink>
							<CtaLink href="/wysylka" variant="secondary" withArrow={false}>
								Zobacz info o wysyłce
							</CtaLink>
						</div>
					</div>
				</Container>
			</Section>
		</main>
	);
}
