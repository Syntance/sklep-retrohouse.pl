"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ClipboardIcon } from "@/components/icons";
import { hashConditionDescriptionSync } from "@/lib/condition-hash";
import type { Product } from "@/lib/mock/products";
import { cn } from "@/lib/utils";

type ConditionAcceptanceDialogProps = {
	product: Product;
	open: boolean;
	onConfirm: () => void;
	onRevert: () => void;
};

/**
 * Modal UPK (art. 43a ust. 4) — pojawia się po dodaniu do koszyka.
 * „Zapoznałem się” zamyka i zostawia produkt w koszyku.
 * „Cofnij” usuwa produkt z koszyka.
 */
export function ConditionAcceptanceDialog({
	product,
	open,
	onConfirm,
	onRevert,
}: ConditionAcceptanceDialogProps) {
	const [showCondition, setShowCondition] = useState(false);
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	useEffect(() => {
		if (open) setShowCondition(false);
	}, [open, product.slug]);

	useEffect(() => {
		if (!open) return;
		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		return () => {
			document.body.style.overflow = previousOverflow;
		};
	}, [open]);

	useEffect(() => {
		if (!open) return;
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") onRevert();
		};
		document.addEventListener("keydown", onKeyDown);
		return () => document.removeEventListener("keydown", onKeyDown);
	}, [open, onRevert]);

	if (!open || !mounted) return null;

	return createPortal(
		<div
			role="dialog"
			aria-modal="true"
			aria-labelledby="condition-acceptance-title"
			aria-describedby="condition-acceptance-desc"
			className="fixed inset-0 z-100 flex items-center justify-center p-4"
		>
			<div className="absolute inset-0 bg-ink/60 backdrop-blur-sm" aria-hidden="true" />

			<div className="relative z-10 w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl sm:p-8">
				<p className="font-sans text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-brass">
					Opis stanu przedmiotu
				</p>
				<h2
					id="condition-acceptance-title"
					className="mt-2 font-display text-2xl font-semibold leading-tight"
				>
					{product.name}
				</h2>

				<p
					id="condition-acceptance-desc"
					className="mt-4 text-sm leading-relaxed text-foreground/80"
				>
					Zapoznałem się z opisem stanu i akceptuję wszystkie wskazane ślady użytkowania,
					uszkodzenia i naprawy.
				</p>

				<button
					type="button"
					onClick={() => setShowCondition((value) => !value)}
					aria-expanded={showCondition}
					className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-terracotta hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
				>
					<ClipboardIcon className="size-3.5" aria-hidden />
					{showCondition ? "Ukryj opis stanu" : "Zobacz opis stanu"}
				</button>

				<div
					className={cn(
						"grid transition-[grid-template-rows,opacity] duration-300 ease-out",
						showCondition ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
					)}
				>
					<div className="overflow-hidden">
						<div className="mt-3 rounded-xl border border-border bg-cream px-4 py-3 text-sm leading-relaxed text-foreground/80">
							{product.condition}
							<p className="mt-2 text-xs text-foreground/55">
								Wersja opisu:{" "}
								<code className="font-mono">
									{hashConditionDescriptionSync(product.condition)}
								</code>
							</p>
						</div>
					</div>
				</div>

				<div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
					<button
						type="button"
						onClick={onRevert}
						className="inline-flex h-11 items-center justify-center rounded-full border border-border bg-background px-6 text-sm font-semibold uppercase tracking-[0.08em] text-foreground transition-colors hover:border-terracotta hover:text-terracotta focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
					>
						Cofnij
					</button>
					<button
						type="button"
						onClick={onConfirm}
						className="inline-flex h-11 items-center justify-center rounded-full bg-terracotta px-6 text-sm font-semibold uppercase tracking-[0.08em] text-terracotta-foreground shadow-md transition-transform hover:-translate-y-px focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
					>
						Zapoznałem się
					</button>
				</div>
			</div>
		</div>,
		document.body,
	);
}
