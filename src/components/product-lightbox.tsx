"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CloseIcon, ZoomIcon } from "@/components/icons";
import { track } from "@/lib/analytics/posthog";
import { cn } from "@/lib/utils";

export type GallerySlot = {
	label: string;
	hueIndex: number;
	weight: number;
};

type ProductLightboxProps = {
	productName: string;
	hues: readonly [string, string, string];
	slots: GallerySlot[];
};

/**
 * Lightbox PDP — natywny <dialog>, focus trap (przeglądarka), Esc zamyka,
 * ←/→ zmiana zdjęcia. Zero zewnętrznych deps.
 *
 * Eventy:
 *  - image_zoom przy KAŻDYM otwarciu (z aktualnym index).
 *
 * Pełen ekran (--w-full --h-full) przez `dialog[open]:flex` i `m-0`.
 */
export function ProductLightbox({ productName, hues, slots }: ProductLightboxProps) {
	const dialogRef = useRef<HTMLDialogElement>(null);
	const [index, setIndex] = useState(0);
	const [isOpen, setIsOpen] = useState(false);

	const open = useCallback((nextIndex: number) => {
		setIndex(nextIndex);
		setIsOpen(true);
		track({ name: "image_zoom", properties: { image_index: nextIndex } });
	}, []);

	const close = useCallback(() => setIsOpen(false), []);

	useEffect(() => {
		const dialog = dialogRef.current;
		if (!dialog) return;
		if (isOpen && !dialog.open) dialog.showModal();
		if (!isOpen && dialog.open) dialog.close();
	}, [isOpen]);

	useEffect(() => {
		if (!isOpen) return;
		const handler = (event: KeyboardEvent) => {
			if (event.key === "ArrowRight") {
				event.preventDefault();
				setIndex((prev) => (prev + 1) % slots.length);
			} else if (event.key === "ArrowLeft") {
				event.preventDefault();
				setIndex((prev) => (prev - 1 + slots.length) % slots.length);
			}
		};
		window.addEventListener("keydown", handler);
		return () => window.removeEventListener("keydown", handler);
	}, [isOpen, slots.length]);

	const [primary, secondary, accent] = hues;
	const activeSlot = slots[index];
	const huePalette = [primary, secondary, accent];

	return (
		<>
			<div className="grid gap-3">
				<button
					type="button"
					onClick={() => open(0)}
					className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-border bg-card text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-terracotta"
					aria-label={`Powiększ zdjęcie: ${productName}`}
				>
					<div
						aria-hidden="true"
						className="absolute inset-0"
						style={{
							backgroundImage: `radial-gradient(120% 80% at 30% 20%, ${primary}, transparent 60%), radial-gradient(80% 80% at 80% 90%, ${secondary}, transparent 70%), linear-gradient(135deg, ${accent}, ${primary})`,
						}}
					/>
					<span className="absolute right-4 top-4 inline-flex items-center gap-2 rounded-full bg-ink-foreground/85 px-3 py-1.5 text-xs font-semibold text-foreground backdrop-blur">
						<ZoomIcon className="size-3.5" />
						Powiększ
					</span>
					<span className="absolute bottom-4 left-4 cta-text text-[0.7rem] text-ink-foreground drop-shadow">
						Główne zdjęcie · {productName}
					</span>
				</button>

				<ul className="grid grid-cols-5 gap-2">
					{slots.map((slot, i) => (
						<li key={slot.label}>
							<button
								type="button"
								onClick={() => open(i)}
								aria-label={`Otwórz zdjęcie ${i + 1}: ${slot.label}`}
								className={cn(
									"relative block aspect-square w-full overflow-hidden rounded-xl border border-border bg-card transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta",
								)}
							>
								<div
									aria-hidden="true"
									className="absolute inset-0"
									style={{
										backgroundImage: `linear-gradient(${i * 30}deg, ${primary}, ${secondary} 60%, ${accent})`,
										opacity: slot.weight,
									}}
								/>
								<span className="absolute inset-x-1 bottom-1 rounded bg-ink-foreground/80 px-1.5 py-0.5 text-center text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-foreground">
									{slot.label}
								</span>
							</button>
						</li>
					))}
				</ul>
			</div>

			<dialog
				ref={dialogRef}
				onClose={close}
				aria-label={`Galeria: ${productName}`}
				className="m-0 h-full max-h-screen w-full max-w-full bg-ink/95 p-0 backdrop:bg-ink/80"
			>
				<div className="flex h-full w-full flex-col items-center justify-center gap-6 p-4 sm:p-8">
					<button
						type="button"
						onClick={close}
						className="absolute right-4 top-4 inline-flex size-11 items-center justify-center rounded-full border border-ink-foreground/30 bg-ink-foreground/10 text-ink-foreground transition-colors hover:bg-ink-foreground/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink-foreground"
						aria-label="Zamknij galerię"
					>
						<CloseIcon className="size-5" />
					</button>

					<figure className="relative aspect-[4/3] w-full max-w-4xl overflow-hidden rounded-2xl border border-ink-foreground/15">
						<div
							aria-hidden="true"
							className="absolute inset-0"
							style={{
								backgroundImage: `linear-gradient(${index * 24}deg, ${huePalette[index % 3]}, ${huePalette[(index + 1) % 3]} 60%, ${huePalette[(index + 2) % 3]})`,
							}}
						/>
						<figcaption className="absolute bottom-4 left-4 cta-text text-xs text-ink-foreground">
							{activeSlot?.label} · {index + 1}/{slots.length}
						</figcaption>
					</figure>

					<nav aria-label="Nawigacja zdjęć" className="flex flex-wrap items-center justify-center gap-2">
						<button
							type="button"
							onClick={() => setIndex((prev) => (prev - 1 + slots.length) % slots.length)}
							className="cta-text inline-flex h-11 items-center justify-center rounded-full border border-ink-foreground/30 bg-ink-foreground/10 px-4 text-xs text-ink-foreground transition-colors hover:bg-ink-foreground/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink-foreground"
						>
							← Poprzednie
						</button>
						<button
							type="button"
							onClick={() => setIndex((prev) => (prev + 1) % slots.length)}
							className="cta-text inline-flex h-11 items-center justify-center rounded-full border border-ink-foreground/30 bg-ink-foreground/10 px-4 text-xs text-ink-foreground transition-colors hover:bg-ink-foreground/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink-foreground"
						>
							Następne →
						</button>
					</nav>
				</div>
			</dialog>
		</>
	);
}
