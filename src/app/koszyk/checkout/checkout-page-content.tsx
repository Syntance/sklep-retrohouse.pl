"use client";

import { CheckoutProgress } from "@/components/checkout-progress";
import { Container, CtaLink, Eyebrow, Section } from "@/components/primitives";
import { useCartProducts } from "@/lib/cart/use-cart-products";
import { CONTACT_FAST_RESPONSE } from "@/lib/contact/response-time";
import { CheckoutForm } from "./checkout-form";

export function CheckoutPageContent() {
	const products = useCartProducts();
	const subtotal = products.reduce((acc, item) => acc + item.price, 0);

	if (products.length === 0) {
		return (
			<Section spacing="md">
				<Container size="md">
					<div className="rounded-3xl border border-border bg-card p-10 text-center md:p-14">
						<Eyebrow className="justify-center">Brak pozycji</Eyebrow>
						<h2 className="mt-4 font-display text-3xl font-semibold leading-tight">
							Koszyk jest pusty
						</h2>
						<p className="mx-auto mt-3 max-w-md text-foreground/70">
							Dodaj przedmiot ze sklepu, a potem wróć tutaj przez ikonę koszyka.
						</p>
						<div className="mt-6">
							<CtaLink href="/sklep">Przeglądaj sklep</CtaLink>
						</div>
					</div>
				</Container>
			</Section>
		);
	}

	return (
		<>
			<Section spacing="md">
				<Container size="xl">
					<div className="mb-10">
						<Eyebrow>Krok 2 z 3 · Dane / Wysyłka / Płatność</Eyebrow>
						<h1 className="mt-3 font-display text-5xl font-semibold leading-tight md:text-6xl">
							Płatność i dostawa
						</h1>
					</div>

					<CheckoutProgress step={2} />

					<CheckoutForm items={products} subtotal={subtotal} />
				</Container>
			</Section>

			<Section spacing="md" tone="muted">
				<Container size="md">
					<div className="rounded-3xl border border-border bg-card p-8 text-center md:p-12">
						<Eyebrow className="justify-center">Wątpliwości?</Eyebrow>
						<h2 className="mt-3 font-display text-3xl font-semibold leading-tight md:text-4xl">
							Napisz — odpowiemy {CONTACT_FAST_RESPONSE.within}
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
		</>
	);
}
