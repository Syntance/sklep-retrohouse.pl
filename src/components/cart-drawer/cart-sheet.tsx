"use client";

import Link from "next/link";
import { useEffect } from "react";
import { CloseIcon } from "@/components/icons";
import { CtaLink } from "@/components/primitives";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { formatPrice } from "@/lib/format";
import { useCartStore } from "@/lib/cart/store";
import { useCartMounted, useCartProducts } from "@/lib/cart/use-cart-products";
import { track } from "@/lib/analytics/posthog";

type CartSheetProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

/**
 * Zawartość wysuwanego koszyka — wydzielona z index.tsx i ładowana
 * dynamicznie (next/dynamic) dopiero przy pierwszym otwarciu lub na idle.
 * Sheet (@base-ui) + lista produktów nie wchodzą dzięki temu do initial JS
 * każdej strony. Trigger (ikona + badge) zostaje w index.tsx.
 *
 * Animacja wejścia: Base UI `data-starting-style` odpala transition także
 * przy montowaniu w stanie open — pierwsze otwarcie wygląda identycznie.
 */
export default function CartSheet({ open, onOpenChange }: CartSheetProps) {
	const mounted = useCartMounted();
	const products = useCartProducts();
	const removeItem = useCartStore((state) => state.removeItem);

	const subtotal = products.reduce((acc, item) => acc + item.price, 0);
	const shippingFree = subtotal >= 500;
	const shipping = shippingFree ? 0 : products.length > 0 ? 19 : 0;
	const total = subtotal + shipping;

	useEffect(() => {
		if (!open || !mounted || products.length === 0) return;
		track({
			name: "view_cart",
			properties: { items_count: products.length, cart_value: total },
		});
	}, [open, mounted, products.length, total]);

	const setOpen = onOpenChange;

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent
				side="right"
				showCloseButton={false}
				className="flex h-full w-full gap-0 border-border bg-card p-0 sm:max-w-md"
			>
				<SheetHeader className="border-b border-border px-5 py-4 pr-14">
					<SheetTitle className="font-display text-2xl font-semibold">Twój koszyk</SheetTitle>
					<SheetDescription className="sr-only">
						Podgląd pozycji w koszyku. Pełny koszyk i checkout na osobnej stronie.
					</SheetDescription>
					<button
						type="button"
						onClick={() => setOpen(false)}
						aria-label="Zamknij koszyk"
						className="absolute top-3.5 right-3.5 grid size-9 place-items-center rounded-full text-foreground/70 transition-colors hover:bg-cream hover:text-terracotta focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
					>
						<CloseIcon className="size-4" />
					</button>
				</SheetHeader>

				<div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-5 py-4">
					{products.length === 0 ? (
						<div className="flex flex-1 flex-col items-center justify-center py-12 text-center">
							<p className="font-display text-xl font-semibold">Koszyk jest pusty</p>
							<p className="mt-2 max-w-xs text-sm text-foreground/70">
								Dodaj unikat ze sklepu — pojawi się tutaj po akceptacji opisu stanu.
							</p>
							<CtaLink
								href="/sklep"
								className="mt-6"
								onClick={() => setOpen(false)}
							>
								Przeglądaj sklep
							</CtaLink>
						</div>
					) : (
						<ul className="space-y-4">
							{products.map((item) => {
								const [primary, secondary] = item.imageHues;
								return (
									<li
										key={item.slug}
										className="flex gap-3 rounded-xl border border-border bg-background p-3"
									>
										<Link
											href={`/sklep/${item.slug}`}
											onClick={() => setOpen(false)}
											className="relative size-16 shrink-0 overflow-hidden rounded-lg"
											aria-label={item.name}
										>
											<div
												aria-hidden
												className="absolute inset-0"
												style={{
													backgroundImage: `linear-gradient(160deg, ${primary}, ${secondary})`,
												}}
											/>
										</Link>
										<div className="min-w-0 flex-1">
											<div className="flex items-start justify-between gap-2">
												<div className="min-w-0">
													<p className="truncate font-sans text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-brass">
														{item.epochLabel}
													</p>
													<Link
														href={`/sklep/${item.slug}`}
														onClick={() => setOpen(false)}
														className="mt-0.5 line-clamp-2 font-display text-sm leading-snug hover:text-terracotta"
													>
														{item.name}
													</Link>
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
													className="shrink-0 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-foreground/55 hover:text-destructive"
												>
													Usuń
												</button>
											</div>
											<p className="mt-2 font-display text-lg font-semibold tabular">
												{formatPrice(item.price)}
											</p>
										</div>
									</li>
								);
							})}
						</ul>
					)}
				</div>

				{products.length > 0 ? (
					<div className="mt-auto border-t border-border bg-cream px-5 py-4">
						<dl className="space-y-1.5 text-sm">
							<div className="flex items-center justify-between">
								<dt className="text-foreground/70">Suma cząstkowa</dt>
								<dd className="tabular">{formatPrice(subtotal)}</dd>
							</div>
							<div className="flex items-center justify-between">
								<dt className="text-foreground/70">Wysyłka</dt>
								<dd className="tabular">
									{shippingFree ? "0 zł" : formatPrice(shipping)}
								</dd>
							</div>
							<div className="flex items-baseline justify-between border-t border-border pt-3">
								<dt className="font-display text-lg">Razem</dt>
								<dd className="font-display text-2xl font-semibold tabular">
									{formatPrice(total)}
								</dd>
							</div>
						</dl>

						<CtaLink
							href="/koszyk"
							className="mt-4 w-full justify-center"
							onClick={() => setOpen(false)}
						>
							Zobacz cały koszyk
						</CtaLink>
					</div>
				) : null}
			</SheetContent>
		</Sheet>
	);
}
