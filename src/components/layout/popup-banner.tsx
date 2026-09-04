"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { CloseIcon } from "@/components/icons";
import type { PopupBanner as PopupBannerContent } from "@/lib/content/types";

const SESSION_KEY = "rh_popup_dismissed";

/**
 * Baner popup sterowany z CMS (/magazyn/cms/banery-popup).
 *
 * Nie blokuje pierwszego renderu ani LCP — montuje się dopiero po
 * `delayMs`, a `prefers-reduced-motion` wyłącza animację wejścia.
 */
export function PopupBanner({ banner }: { banner: PopupBannerContent }) {
	const titleId = useId();
	const [open, setOpen] = useState(false);
	const closeRef = useRef<HTMLButtonElement>(null);
	const dialogRef = useRef<HTMLDivElement>(null);
	const restoreFocusRef = useRef<HTMLElement | null>(null);

	useEffect(() => {
		if (!banner.enabled || !banner.title.trim()) return;

		if (banner.oncePerSession) {
			try {
				if (sessionStorage.getItem(SESSION_KEY) === "1") return;
			} catch {
				/* prywatne okno / zablokowane storage — pokazujemy baner */
			}
		}

		const timer = setTimeout(() => setOpen(true), Math.max(0, banner.delayMs));
		return () => clearTimeout(timer);
	}, [banner.enabled, banner.title, banner.oncePerSession, banner.delayMs]);

	const dismiss = useCallback(() => {
		setOpen(false);
		if (!banner.oncePerSession) return;
		try {
			sessionStorage.setItem(SESSION_KEY, "1");
		} catch {
			/* brak storage — po prostu pokaże się ponownie */
		}
	}, [banner.oncePerSession]);

	useEffect(() => {
		if (!open) return;

		// `aria-modal` obiecuje czytnikowi ekranu, że reszta strony jest poza
		// zasięgiem — bez pułapki na Tab ta obietnica jest nieprawdziwa.
		restoreFocusRef.current = document.activeElement as HTMLElement | null;
		closeRef.current?.focus();

		const onKey = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				dismiss();
				return;
			}
			if (event.key !== "Tab") return;

			const focusables = dialogRef.current?.querySelectorAll<HTMLElement>(
				'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])',
			);
			if (!focusables || focusables.length === 0) return;

			const first = focusables[0];
			const last = focusables[focusables.length - 1];
			if (event.shiftKey && document.activeElement === first) {
				event.preventDefault();
				last.focus();
			} else if (!event.shiftKey && document.activeElement === last) {
				event.preventDefault();
				first.focus();
			}
		};

		document.addEventListener("keydown", onKey);
		return () => {
			document.removeEventListener("keydown", onKey);
			restoreFocusRef.current?.focus?.();
		};
	}, [open, dismiss]);

	if (!open) return null;

	const hasCta = Boolean(banner.ctaLabel?.trim() && banner.ctaHref?.trim());

	return (
		<div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
			<button
				type="button"
				aria-label="Zamknij baner"
				onClick={dismiss}
				className="absolute inset-0 cursor-default border-0 bg-foreground/30 p-0"
			/>
			<div
				ref={dialogRef}
				role="dialog"
				aria-modal="true"
				aria-labelledby={titleId}
				className="relative z-10 flex w-[min(92vw,26rem)] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-xl motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95"
			>
				<button
					ref={closeRef}
					type="button"
					onClick={dismiss}
					aria-label="Zamknij"
					className="absolute top-3 right-3 z-10 inline-flex size-8 items-center justify-center rounded-full bg-background/90 text-foreground/70 transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta"
				>
					<CloseIcon className="size-4" aria-hidden />
				</button>

				{banner.imageUrl ? (
					<span className="relative block aspect-[3/2] w-full bg-muted">
						{/* Bez `unoptimized`: baner potrafi wejść tuż po pierwszym renderze,
						    a surowy plik z uploadu bywa wielkością pełnego zdjęcia. */}
						<Image
							src={banner.imageUrl}
							alt={banner.imageAlt?.trim() ?? ""}
							fill
							sizes="(max-width: 640px) 92vw, 26rem"
							className="object-cover"
							loading="lazy"
						/>
					</span>
				) : null}

				<div className="flex flex-col gap-3 p-6">
					<h2 id={titleId} className="font-display text-xl font-semibold leading-tight">
						{banner.title}
					</h2>
					{banner.body?.trim() ? (
						<p className="text-sm text-foreground/70">{banner.body}</p>
					) : null}
					{hasCta ? (
						<Link
							href={banner.ctaHref as string}
							onClick={dismiss}
							className="mt-1 inline-flex h-11 items-center justify-center rounded-full bg-terracotta px-5 text-sm font-semibold text-terracotta-foreground transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
						>
							{banner.ctaLabel}
						</Link>
					) : null}
				</div>
			</div>
		</div>
	);
}
