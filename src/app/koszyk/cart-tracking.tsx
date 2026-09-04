"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { ArrowRightIcon, GiftIcon } from "@/components/icons";
import { track } from "@/lib/analytics/posthog";

type CartTrackerProps = {
	itemsCount: number;
	cartValue: number;
};

/**
 * View-only effect — emit `view_cart` przy mount koszyka.
 * Reagent na `cartValue` (zmiana kwoty = nowy event).
 */
export function CartTracker({ itemsCount, cartValue }: CartTrackerProps) {
	const lastSnapshotRef = useRef<string | null>(null);

	useEffect(() => {
		const snapshot = `${itemsCount}:${cartValue}`;
		if (lastSnapshotRef.current === snapshot) return;
		lastSnapshotRef.current = snapshot;
		track({
			name: "view_cart",
			properties: { items_count: itemsCount, cart_value: cartValue },
		});
	}, [itemsCount, cartValue]);

	return null;
}

type CheckoutCtaProps = {
	href: string;
	cartValue: number;
	className?: string;
	children: React.ReactNode;
};

/**
 * "Przejdź do płatności" — emituje `checkout_started` z cart_value.
 */
export function CheckoutCta({ href, cartValue, className, children }: CheckoutCtaProps) {
	return (
		<Link
			href={href}
			onClick={() => track({ name: "checkout_started", properties: { cart_value: cartValue } })}
			className={
				className ??
				"inline-flex h-12 items-center justify-center gap-2 rounded-full bg-terracotta px-6 text-sm font-semibold uppercase tracking-[0.08em] text-terracotta-foreground transition-transform hover:-translate-y-0.5"
			}
		>
			{children}
			<ArrowRightIcon className="size-4" />
		</Link>
	);
}

/**
 * Pakowanie prezentowe — toggle z trackingiem `gift_wrapping_selected`.
 * Tracking strzela RAZ na sesję (gdy user włączy opcję).
 *
 * UWAGA: dedykacja przeniesiona do `<DedicationField>` — Notion explicite
 * traktuje ją jako osobne pole (klient może chcieć dedykację bez pakowania
 * premium, jeśli kupuje wazon „dla siebie", ale chce karty z dedykacją).
 */
export function GiftWrappingToggle() {
	const [enabled, setEnabled] = useState(false);
	const trackedRef = useRef(false);

	const handleToggle = (event: React.SyntheticEvent<HTMLDetailsElement>) => {
		const open = event.currentTarget.open;
		setEnabled(open);
		if (open && !trackedRef.current) {
			trackedRef.current = true;
			track({ name: "gift_wrapping_selected", properties: {} });
		}
	};

	return (
		<details
			className="group/upsell mt-6 rounded-2xl border border-border bg-card p-5"
			onToggle={handleToggle}
		>
			<summary className="flex cursor-pointer items-start justify-between gap-3 text-left">
				<div className="flex items-start gap-3">
					<span className="grid size-9 place-items-center rounded-full bg-terracotta text-terracotta-foreground">
						<GiftIcon className="size-5" />
					</span>
					<div>
						<p className="font-display text-lg">Pakowanie prezentowe (+25 zł)</p>
						<p className="text-sm text-foreground/70">
							Eleganckie pudełko zewnętrzne, ozdobna bibułka, karta historii.
						</p>
					</div>
				</div>
				<span className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em]">
					{enabled ? "Włączono" : "Dodaj"}
				</span>
			</summary>
			<p className="mt-4 text-xs text-foreground/60">
				Dedykację dodasz w polu poniżej — jest dostępna niezależnie od pakowania premium.
			</p>
		</details>
	);
}

/**
 * Dedykacja — niezależne pole (Notion: „Dedykacja — pole tekstowe (opcjonalne)").
 * Brak osobnego eventu PostHog; treść trafia w order metadata
 * (Medusa.cart.metadata.dedication) na etapie integracji z koszykiem.
 */
export function DedicationField() {
	const id = useId();
	return (
		<div className="mt-4 rounded-2xl border border-border bg-card p-5">
			<label htmlFor={id} className="block">
				<span className="font-display text-lg">Dedykacja</span>
				<span className="ml-2 text-xs font-semibold uppercase tracking-[0.14em] text-foreground/55">
					opcjonalnie
				</span>
				<p className="mt-1 text-sm text-foreground/70">
					Wpisz krótką wiadomość — wydrukujemy ją na karcie historii dołączanej do paczki.
				</p>
				<textarea
					id={id}
					name="dedication"
					rows={3}
					maxLength={240}
					placeholder="Dla Marty — żeby kawa smakowała jak w&nbsp;Wiedniu."
					className="mt-3 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus-visible:border-terracotta focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta"
				/>
			</label>
		</div>
	);
}
