"use client";

import { hashConditionDescriptionSync } from "@/lib/condition-hash";
import type { Product } from "@/lib/products/types";

type ProductConditionModalProps = {
	product: Product;
	onClose: () => void;
};

export function ProductConditionModal({ product, onClose }: ProductConditionModalProps) {
	return (
		<div
			role="dialog"
			aria-modal="true"
			aria-labelledby="condition-modal-title"
			className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
		>
			<div
				className="absolute inset-0 bg-ink/60 backdrop-blur-sm"
				onClick={onClose}
				aria-hidden="true"
			/>
			<div className="relative z-10 w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-xl sm:p-8">
				<h2
					id="condition-modal-title"
					className="font-display text-2xl font-semibold leading-tight"
				>
					Opis stanu: {product.name}
				</h2>
				<p className="mt-4 leading-relaxed text-foreground/80">{product.condition}</p>
				<p className="mt-3 text-xs text-foreground/55">
					Wersja opisu:{" "}
					<code className="font-mono">
						{hashConditionDescriptionSync(product.condition)}
					</code>
				</p>
				<button
					type="button"
					onClick={onClose}
					className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-full bg-ink px-6 text-sm font-semibold uppercase tracking-[0.08em] text-ink-foreground hover:bg-ink/90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
				>
					Zamknij
				</button>
			</div>
		</div>
	);
}
