"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

type PageHeroImageProps = {
	src: string;
	alt: string;
	className?: string;
	priority?: boolean;
	/** Etykieta w rogu (np. „Behind the scenes”). */
	badge?: string;
	/** Krótki podpis na zdjęciu — opcjonalny. */
	caption?: string;
};

const FALLBACK_GRADIENT =
	"radial-gradient(120% 80% at 30% 20%, oklch(0.92 0.04 80), transparent 60%), linear-gradient(160deg, oklch(0.55 0.08 60), oklch(0.39 0.07 45))";

/**
 * Hero z pliku w `public/` — gdy pliku jeszcze nie ma, pokazuje gradient marki.
 * Wrzuć JPG/WebP pod ścieżkę z `PAGE_HERO_IMAGES` bez zmiany kodu.
 */
export function PageHeroImage({
	src,
	alt,
	className,
	priority = false,
	badge,
	caption,
}: PageHeroImageProps) {
	const [missing, setMissing] = useState(false);
	const hasOverlay = Boolean(badge || caption);

	return (
		<div
			className={cn(
				"relative aspect-5/6 w-full overflow-hidden rounded-3xl border border-border bg-card shadow-xl",
				className,
			)}
		>
			{missing ? (
				<div aria-hidden className="absolute inset-0" style={{ backgroundImage: FALLBACK_GRADIENT }} />
			) : (
				<Image
					src={src}
					alt={alt}
					fill
					sizes="(max-width: 1024px) 100vw, 42vw"
					className="object-cover"
					priority={priority}
					onError={() => setMissing(true)}
				/>
			)}

			{hasOverlay ? (
				<div className="pointer-events-none relative flex h-full flex-col justify-between p-6 text-ink-foreground sm:p-8">
					{badge ? (
						<span className="w-fit rounded-full bg-ink/85 px-3 py-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-ink-foreground backdrop-blur">
							{badge}
						</span>
					) : (
						<span />
					)}
					{caption ? (
						<p className="rounded-2xl border border-ink-foreground/30 bg-ink-foreground/15 p-5 font-display text-lg italic leading-snug backdrop-blur-md">
							{caption}
						</p>
					) : null}
				</div>
			) : null}
		</div>
	);
}
