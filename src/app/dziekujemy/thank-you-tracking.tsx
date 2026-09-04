"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { ArrowRightIcon, GiftIcon, InstagramIcon, PinIcon } from "@/components/icons";
import { trackMetaPurchase } from "@/lib/analytics/marketing";
import { track } from "@/lib/analytics/posthog";

type PurchaseTrackerProps = {
	orderId: string;
	value: number;
	itemsCount: number;
};

/**
 * Emit `purchase` raz na orderId. Wartość mock — etap 2 podpięty Medusa
 * webhook + persistent dedup po order_id (Redis / Upstash).
 */
export function PurchaseTracker({ orderId, value, itemsCount }: PurchaseTrackerProps) {
	const trackedRef = useRef<string | null>(null);

	useEffect(() => {
		if (trackedRef.current === orderId) return;
		trackedRef.current = orderId;
		track({
			name: "purchase",
			properties: { value, currency: "PLN", order_id: orderId, items: itemsCount },
		});
		trackMetaPurchase({
			value,
			currency: "PLN",
			orderId,
			itemsCount,
		});
	}, [orderId, value, itemsCount]);

	return null;
}

export function UgcCtaCard({ href }: { href: string }) {
	return (
		<div className="rounded-2xl border border-border bg-cream p-5">
			<div className="flex items-start gap-3">
				<span className="grid size-10 place-items-center rounded-full bg-terracotta text-terracotta-foreground">
					<GiftIcon className="size-5" />
				</span>
				<div>
					<p className="font-display text-lg">Wrzuć zdjęcie z otwarcia paczki</p>
					<p className="mt-1 text-sm text-foreground/70">
						Oznacz <strong>@retrohouse</strong> na IG, a my odpowiemy kodem rabatowym -10% na
						kolejne zakupy.
					</p>
				</div>
			</div>
			<Link
				href={href}
				target="_blank"
				rel="noreferrer"
				onClick={() => track({ name: "ugc_cta_clicked", properties: {} })}
				className="mt-4 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-foreground hover:text-terracotta"
			>
				<InstagramIcon className="size-4" />
				Otwórz Instagrama
			</Link>
		</div>
	);
}

export function ReviewCard({ href }: { href: string }) {
	return (
		<Link
			href={href}
			target="_blank"
			rel="noreferrer"
			onClick={() => track({ name: "review_google_clicked", properties: {} })}
			className="group/card flex h-full flex-col justify-between gap-3 rounded-2xl border border-border bg-card p-6 transition-colors hover:border-terracotta"
		>
			<div className="flex items-center gap-2 text-brass">
				<PinIcon className="size-5" />
				<span className="font-sans text-[0.65rem] font-semibold uppercase tracking-[0.18em]">
					30 sekund — Twój głos waży
				</span>
			</div>
			<p className="font-display text-2xl">Zostaw opinię w Google</p>
			<p className="text-sm text-foreground/70">
				Pomożesz innym znaleźć nasz sklep w Nowym Targu — i utwierdzisz nas, że robimy dobrą robotę.
			</p>
			<span className="inline-flex items-center gap-1 text-sm font-semibold text-foreground">
				Otwórz wizytówkę
				<ArrowRightIcon className="size-4 transition-transform group-hover/card:translate-x-0.5" />
			</span>
		</Link>
	);
}
