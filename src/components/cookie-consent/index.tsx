"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useId, useRef } from "react";
import { useConsent } from "@/lib/analytics/use-consent";

/**
 * Dialog „Dostosuj" (@base-ui Dialog) — dynamiczny: otwierany rzadko,
 * a jego kod nie musi wchodzić do initial JS. Montowany dopiero przy
 * pierwszym otwarciu (potem zostaje, żeby zamknięcie miało animację).
 */
const CustomizeDialog = dynamic(
	() => import("./customize-dialog").then((m) => m.CustomizeDialog),
	{ ssr: false },
);

/**
 * CookieConsentBanner — sticky bottom + 3 przyciski równoważne (UODO 2023).
 *
 * Reguły:
 * - Aktywny opt-in (PT art. 173, EAA, RODO).
 * - 3 CTA tej samej wagi: Akceptuj wszystko / Odrzuć wszystko / Dostosuj.
 *   ZAKAZ ciemnych wzorców (kolorowy „Akceptuj" + szary „Odrzuć").
 * - Banner NIE blokuje scroll — content dostępny od razu.
 * - Esc nie zamyka bannera (świadomy wybór wymagany).
 * - Re-open w stopce: <button> z `data-cookie-settings>`.
 */
export function CookieConsentBanner() {
	const headingId = useId();
	const { consent, isLoaded, isOpen, open, close, update } = useConsent();
	const dialogEverOpenedRef = useRef(false);
	if (isOpen) dialogEverOpenedRef.current = true;

	if (!isLoaded) return null;
	const showBanner = consent === null;

	const handleAcceptAll = () => {
		update({ analytics: true, marketing: true, preferences: true });
	};
	const handleRejectAll = () => {
		update({ analytics: false, marketing: false, preferences: false });
	};
	const handleSaveCustom = (next: { analytics: boolean; marketing: boolean; preferences: boolean }) => {
		update(next);
	};

	return (
		<>
			{showBanner ? (
				<div
					role="region"
					aria-labelledby={headingId}
					aria-describedby={`${headingId}-desc`}
					className="fixed inset-x-0 bottom-0 z-50 px-4 pb-4 sm:inset-x-auto sm:bottom-4 sm:left-4 sm:max-w-xl sm:px-0"
				>
					<div className="rounded-2xl border border-walnut/15 bg-background p-5 shadow-xl sm:p-6">
						<h2 id={headingId} className="font-display text-lg font-medium leading-snug">
							Pliki cookie i prywatność
						</h2>
						<p id={`${headingId}-desc`} className="mt-2 text-sm leading-relaxed text-foreground/70">
							Używamy plików cookie, by lepiej rozumieć jak korzystasz ze sklepu (PostHog, hosting w EU). Możesz zaakceptować wszystko, odrzucić wszystko albo wybrać po swojemu. Bez Twojej zgody — żadna analityka się nie uruchomi.{" "}
							<Link
								href="/polityka-prywatnosci"
								className="underline decoration-walnut/40 underline-offset-4 hover:text-terracotta hover:decoration-terracotta"
							>
								Polityka prywatności
							</Link>
							.
						</p>

						<div className="mt-5 grid gap-2 sm:grid-cols-3">
							<button
								type="button"
								onClick={handleRejectAll}
								className="cta-text inline-flex h-11 items-center justify-center rounded-full border border-walnut/25 bg-background px-4 text-[0.7rem] text-foreground/75 transition-colors hover:border-terracotta hover:text-terracotta focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta"
							>
								Odrzuć wszystko
							</button>
							<button
								type="button"
								onClick={open}
								className="cta-text inline-flex h-11 items-center justify-center rounded-full border border-walnut/25 bg-background px-4 text-[0.7rem] text-foreground/75 transition-colors hover:border-terracotta hover:text-terracotta focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta"
							>
								Dostosuj
							</button>
							<button
								type="button"
								onClick={handleAcceptAll}
								className="cta-text inline-flex h-11 items-center justify-center rounded-full bg-terracotta px-4 text-[0.7rem] text-terracotta-foreground transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta"
							>
								Akceptuj wszystko
							</button>
						</div>
					</div>
				</div>
			) : null}

			{dialogEverOpenedRef.current ? (
				<CustomizeDialog
					open={isOpen}
					current={consent}
					onClose={close}
					onSave={handleSaveCustom}
				/>
			) : null}
		</>
	);
}
