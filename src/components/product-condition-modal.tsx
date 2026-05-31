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
				{product.defects.length > 0 ? (
					<div className="mt-5">
						<h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-foreground/60">
							Wady i ubytki
						</h3>
						<ul className="mt-2 flex flex-col gap-2">
							{product.defects.map((defect) => (
								<li key={defect.label} className="flex gap-2 text-sm text-foreground/80">
									<span aria-hidden className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" />
									<span>
										<span className="font-medium text-foreground">{defect.label}</span>
										{defect.note ? <span className="text-foreground/65"> — {defect.note}</span> : null}
									</span>
								</li>
							))}
						</ul>
					</div>
				) : null}
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
