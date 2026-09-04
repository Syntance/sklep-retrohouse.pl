"use client";

import Link from "next/link";
import { CheckoutProgress } from "@/components/checkout-progress";
import {
	ArrowRightIcon,
	CheckIcon,
	ClockIcon,
	PackageIcon,
	PinIcon,
	ShieldIcon,
} from "@/components/icons";
import { Container, CtaLink, Eyebrow, Section } from "@/components/primitives";
import { track } from "@/lib/analytics/posthog";
import { useCartStore } from "@/lib/cart/store";
import { useCartProducts } from "@/lib/cart/use-cart-products";
import { formatPrice } from "@/lib/format";
import { CartTracker, CheckoutCta, DedicationField, GiftWrappingToggle } from "./cart-tracking";

export function CartContent() {
	const products = useCartProducts();
	const removeItem = useCartStore((state) => state.removeItem);

	const subtotal = products.reduce((acc, item) => acc + item.price, 0);
	const shippingFree = subtotal >= 500;
	const shipping = shippingFree ? 0 : products.length > 0 ? 19 : 0;
	const total = subtotal + shipping;

	if (products.length === 0) {
		return (
			<Section spacing="md">
				<Container size="md">
					<div className="rounded-3xl border border-border bg-card p-10 text-center md:p-14">
						<Eyebrow className="justify-center">Koszyk pusty</Eyebrow>
						<h2 className="mt-4 font-display text-3xl font-semibold leading-tight">
							Jeszcze nic tu nie ma
						</h2>
						<p className="mx-auto mt-3 max-w-md text-foreground/70">
							Dodaj unikat ze sklepu — zostaniesz na stronie produktu, a pozycja pojawi się tutaj po
							kliknięciu ikony koszyka.
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
			<CartTracker itemsCount={products.length} cartValue={total} />

			<Section spacing="md">
				<Container size="xl">
					<div className="mb-10">
						<Eyebrow>Krok 1 z 3 · Koszyk</Eyebrow>
						<h1 className="mt-3 font-display text-5xl font-semibold leading-tight md:text-6xl">
							Twój koszyk
						</h1>
					</div>

					<CheckoutProgress step={1} />

					<div className="mt-10 grid gap-10 lg:grid-cols-[1.4fr_1fr]">
						<div>
							<ul className="space-y-4">
								{products.map((item) => {
									const [primary, secondary] = item.imageHues;
									return (
										<li
											key={item.slug}
											className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 sm:flex-row"
										>
											<div className="relative aspect-square w-full sm:w-32">
												<div
													aria-hidden
													className="absolute inset-0 overflow-hidden rounded-xl"
													style={{
														backgroundImage: `linear-gradient(160deg, ${primary}, ${secondary})`,
													}}
												/>
											</div>
											<div className="flex flex-1 flex-col">
												<div className="flex items-start justify-between gap-3">
													<div>
														<p className="font-sans text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-brass">
															{item.epochLabel} · {item.categoryLabel}
														</p>
														<p className="mt-1 font-display text-xl">
															<Link href={`/sklep/${item.slug}`} className="hover:text-terracotta">
																{item.name}
															</Link>
														</p>
													</div>
													<button
														type="button"
														onClick={() => {
															removeItem(item.slug);
															track({
																name: "remove_from_cart",
																properties: { product_id: item.slug },
															});
														}}
														className="text-xs font-semibold uppercase tracking-[0.14em] text-foreground/60 hover:text-destructive"
													>
														Usuń
													</button>
												</div>
												<div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-foreground/60">
													<span className="inline-flex items-center gap-1 rounded-full bg-cream px-2.5 py-1 font-semibold uppercase tracking-[0.14em] text-foreground">
														Ilość: 1 — unikat
													</span>
													<span className="inline-flex items-center gap-1.5">
														<ClockIcon className="size-3.5 text-brass" />
														Zarezerwowane na 15 min
													</span>
												</div>
												<p className="mt-auto pt-3 font-display text-2xl font-semibold tabular">
													{formatPrice(item.price)}
												</p>
											</div>
										</li>
									);
								})}
							</ul>

							<GiftWrappingToggle />
							<DedicationField />
						</div>

						<aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
							<div className="rounded-2xl border border-border bg-card p-6">
								<p className="font-sans text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-brass">
									Podsumowanie
								</p>
								<dl className="mt-4 space-y-2 text-sm">
									<div className="flex items-center justify-between">
										<dt>Suma cząstkowa</dt>
										<dd className="tabular">{formatPrice(subtotal)}</dd>
									</div>
									<div className="flex items-center justify-between">
										<dt>Wysyłka ubezpieczona</dt>
										<dd className="tabular">
											{shippingFree ? "0 zł (gratis)" : formatPrice(shipping)}
										</dd>
									</div>
									{shippingFree ? (
										<p className="rounded-md bg-success/10 p-2 text-xs text-success">
											Darmowa wysyłka — przekroczyłeś próg 500 zł
										</p>
									) : (
										<p className="text-xs text-foreground/60">
											Brakuje {formatPrice(500 - subtotal)} do darmowej wysyłki.
										</p>
									)}
								</dl>
								<div className="mt-4 flex items-baseline justify-between border-t border-border pt-4">
									<dt className="font-display text-lg">Razem</dt>
									<dd className="font-display text-3xl font-semibold tabular">
										{formatPrice(total)}
									</dd>
								</div>
							</div>

							<CheckoutCta
								href="/koszyk/checkout"
								cartValue={total}
								className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-terracotta px-6 text-sm font-semibold uppercase tracking-[0.08em] text-terracotta-foreground transition-transform hover:-translate-y-0.5"
							>
								Przejdź do płatności
							</CheckoutCta>
							<Link
								href="/sklep"
								className="inline-flex items-center gap-1.5 text-sm font-semibold text-foreground/70 hover:text-terracotta"
							>
								<ArrowRightIcon className="size-4 -rotate-180" />
								Kontynuuj zakupy
							</Link>

							<ul className="space-y-2 rounded-2xl border border-border bg-cream p-4 text-xs text-foreground/70">
								<TrustLine
									icon={<ShieldIcon className="size-4" />}
									text="Bezpieczna płatność Przelewy24 (BLIK, karta, szybki przelew)"
								/>
								<TrustLine
									icon={<PackageIcon className="size-4" />}
									text="Ubezpieczona wysyłka — 2–3 dni roboczych"
								/>
								<TrustLine icon={<CheckIcon className="size-4" />} text="14 dni na zwrot" />
								<TrustLine
									icon={<PinIcon className="size-4" />}
									text="🇦🇹 Bezpośrednio z Wiednia — bez pośredników"
								/>
							</ul>
						</aside>
					</div>
				</Container>
			</Section>
		</>
	);
}

function TrustLine({ icon, text }: { icon: React.ReactNode; text: string }) {
	return (
		<li className="flex items-start gap-2">
			<span className="mt-0.5 text-brass">{icon}</span>
			<span>{text}</span>
		</li>
	);
}
