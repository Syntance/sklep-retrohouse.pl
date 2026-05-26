"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { ClipboardIcon } from "@/components/icons";
import { ProductConditionModal } from "@/components/product-condition-modal";
import { track } from "@/lib/analytics/posthog";
import { hashConditionDescriptionSync } from "@/lib/condition-hash";
import { TERMS_VERSION, PRIVACY_VERSION } from "@/lib/legal-versions";
import type { Product } from "@/lib/mock/products";
import type { OrderAcceptance, LineItemAcceptance } from "@/lib/order-acceptance";

type AcceptanceStepProps = {
	items: Product[];
	/** Wywoływane gdy wszystkie checkboxy zaznaczone — zwraca gotowy obiekt akceptacji. */
	onComplete: (acceptance: OrderAcceptance) => void;
	/** Wywoływane gdy jakikolwiek checkbox zostaje odznaczony. */
	onIncomplete: () => void;
};

type ItemModalState = {
	open: boolean;
	product: Product | null;
};

/**
 * Krok 4 checkoutu — akceptacje UPK:
 *  - per-przedmiot (art. 43a ust. 4 UPK) — osobny checkbox dla każdej pozycji
 *  - globalny: regulamin
 *  - globalny: polityka prywatności
 *
 * Żaden checkbox NIE jest pre-checked (wymóg prawny — dark pattern zakazany).
 * Przycisk Zapłać jest disabled dopóki wszystkie nie są zaznaczone.
 */
export function AcceptanceStep({ items, onComplete, onIncomplete }: AcceptanceStepProps) {
	const [itemAccepted, setItemAccepted] = useState<Record<string, boolean>>({});
	const [termsAccepted, setTermsAccepted] = useState(false);
	const [privacyAccepted, setPrivacyAccepted] = useState(false);
	const [modal, setModal] = useState<ItemModalState>({ open: false, product: null });
	const orderId = useId();

	const allItemsAccepted = items.every((item) => itemAccepted[item.slug]);
	const isComplete = allItemsAccepted && termsAccepted && privacyAccepted;

	const handleItemCheck = (product: Product, checked: boolean) => {
		const next = { ...itemAccepted, [product.slug]: checked };
		setItemAccepted(next);

		if (checked) {
			track({
				name: "item_acceptance_checked",
				properties: {
					product_id: product.slug,
					order_draft_id: orderId,
				},
			});
		}

		checkCompletion(next, termsAccepted, privacyAccepted);
	};

	const handleTerms = (checked: boolean) => {
		setTermsAccepted(checked);
		if (checked) {
			track({
				name: "terms_accepted",
				properties: { terms_version: TERMS_VERSION, order_draft_id: orderId },
			});
		}
		checkCompletion(itemAccepted, checked, privacyAccepted);
	};

	const handlePrivacy = (checked: boolean) => {
		setPrivacyAccepted(checked);
		if (checked) {
			track({
				name: "privacy_accepted",
				properties: { privacy_version: PRIVACY_VERSION, order_draft_id: orderId },
			});
		}
		checkCompletion(itemAccepted, termsAccepted, checked);
	};

	const checkCompletion = (
		items_: Record<string, boolean>,
		terms: boolean,
		privacy: boolean,
	) => {
		const allItems = items.every((item) => items_[item.slug]);
		if (allItems && terms && privacy) {
			const now = new Date().toISOString();
			const lineItems: LineItemAcceptance[] = items.map((product) => ({
				productSlug: product.slug,
				acceptedAt: now,
				productDescriptionSnapshot: product.condition,
				productDescriptionVersion: hashConditionDescriptionSync(product.condition),
			}));
			onComplete({
				items: lineItems,
				termsAcceptedAt: now,
				termsVersion: TERMS_VERSION,
				privacyAcceptedAt: now,
				privacyVersion: PRIVACY_VERSION,
			});
		} else {
			onIncomplete();
		}
	};

	return (
		<>
			<fieldset className="rounded-2xl border border-border bg-card p-6 md:p-8">
				<p className="font-sans text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-brass">
					Akceptacje
				</p>
				<legend className="mt-2 font-display text-2xl">4 · Potwierdzenia przed zakupem</legend>

				<div className="mt-6 space-y-5">
					{/* Per-przedmiot */}
					<div className="space-y-3">
						<p className="text-sm font-semibold text-foreground/70">
							Stan każdego przedmiotu (art. 43a ust. 4 UPK)
						</p>
						{items.map((product) => (
							<ItemAcceptanceRow
								key={product.slug}
								product={product}
								checked={itemAccepted[product.slug] ?? false}
								onChange={(checked) => handleItemCheck(product, checked)}
								onDescriptionClick={() => setModal({ open: true, product })}
							/>
						))}
					</div>

					<div className="h-px bg-border" />

					{/* Regulamin */}
					<GlobalCheckbox
						id="terms"
						checked={termsAccepted}
						onChange={handleTerms}
						label={
							<>
								Akceptuję{" "}
								<Link
									href="/regulamin"
									target="_blank"
									rel="noopener"
									className="font-semibold underline-offset-4 hover:underline"
								>
									regulamin sklepu
								</Link>{" "}
								RetroHouse.
							</>
						}
					/>

					{/* Polityka prywatności */}
					<GlobalCheckbox
						id="privacy"
						checked={privacyAccepted}
						onChange={handlePrivacy}
						label={
							<>
								Akceptuję{" "}
								<Link
									href="/polityka-prywatnosci"
									target="_blank"
									rel="noopener"
									className="font-semibold underline-offset-4 hover:underline"
								>
									politykę prywatności
								</Link>
								.
							</>
						}
					/>
				</div>

				{/* Pouczenie ustawowe art. 12 UPK */}
				<div className="mt-6 rounded-xl border border-border bg-cream px-5 py-4 text-sm leading-relaxed text-foreground/80">
					<p>
						Masz{" "}
						<strong className="font-semibold text-foreground">
							14 dni na odstąpienie od umowy
						</strong>{" "}
						od dnia otrzymania przesyłki. Szczegóły i formularz:{" "}
						<Link
							href="/odstapienie"
							className="font-semibold underline-offset-4 hover:underline"
						>
							/odstapienie
						</Link>
						. Antyki są rzeczami używanymi — odpowiadasz za zmniejszenie wartości wynikłe z
						korzystania ponad sprawdzenie charakteru przedmiotu (art. 34 ust. 4 UPK).
					</p>
				</div>

				{!isComplete ? (
					<p className="mt-4 text-xs text-foreground/55" role="status" aria-live="polite">
						Zaznacz wszystkie pola, aby przejść do płatności.
					</p>
				) : null}
			</fieldset>

			{/* Modal / drawer opisu stanu */}
			{modal.open && modal.product ? (
				<ProductConditionModal
					product={modal.product}
					onClose={() => setModal({ open: false, product: null })}
				/>
			) : null}
		</>
	);
}

/* ─────────────────────────────────────────────── */
/* Sub-komponenty                                  */
/* ─────────────────────────────────────────────── */

function ItemAcceptanceRow({
	product,
	checked,
	onChange,
	onDescriptionClick,
}: {
	product: Product;
	checked: boolean;
	onChange: (checked: boolean) => void;
	onDescriptionClick: () => void;
}) {
	const id = useId();
	return (
		<div className="flex items-start gap-3 rounded-xl border border-border bg-background p-4">
			<input
				id={id}
				type="checkbox"
				checked={checked}
				onChange={(e) => onChange(e.target.checked)}
				className="mt-1 size-4 shrink-0 rounded border-border text-terracotta focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta"
				aria-describedby={`${id}-desc`}
			/>
			<div className="min-w-0 flex-1">
				<label htmlFor={id} id={`${id}-desc`} className="cursor-pointer text-sm leading-snug">
					Zapoznałem/am się z opisem stanu{" "}
					<strong className="font-semibold">{product.name}</strong> i akceptuję wszystkie
					wskazane ślady użytkowania, uszkodzenia i naprawy.
				</label>
				<button
					type="button"
					onClick={onDescriptionClick}
					className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.12em] text-terracotta hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
				>
					<ClipboardIcon className="size-3.5" />
					Zobacz opis stanu
				</button>
			</div>
		</div>
	);
}

function GlobalCheckbox({
	id,
	checked,
	onChange,
	label,
}: {
	id: string;
	checked: boolean;
	onChange: (checked: boolean) => void;
	label: React.ReactNode;
}) {
	return (
		<label htmlFor={id} className="flex cursor-pointer items-start gap-3 text-sm">
			<input
				id={id}
				type="checkbox"
				checked={checked}
				onChange={(e) => onChange(e.target.checked)}
				className="mt-0.5 size-4 shrink-0 rounded border-border text-terracotta focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta"
			/>
			<span className="leading-snug">{label}</span>
		</label>
	);
}
