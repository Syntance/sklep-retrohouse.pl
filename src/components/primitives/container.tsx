import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/**
 * Container — kontener treści z domyślnie „książkową" szerokością.
 *
 * Zmiana 2026-05-03 (uproszczenie): default `md` (max-w-5xl, 64rem). Wcześniej
 * `lg` (max-w-6xl) wyglądał korporacyjnie i wytrącał intymność strony retro.
 * Sekcje hero/listing produktowy wciąż mogą jawnie chcieć `lg`/`xl`, ale
 * większość stron (story, blog, kontakt, koszyk, legal) zyskuje na zwężeniu.
 */
type ContainerProps = ComponentProps<"div"> & {
	size?: "sm" | "md" | "lg" | "xl" | "full";
};

const sizeMap: Record<NonNullable<ContainerProps["size"]>, string> = {
	sm: "max-w-2xl",
	md: "max-w-5xl",
	lg: "max-w-6xl",
	xl: "max-w-7xl",
	full: "max-w-none",
};

export function Container({ className, size = "md", ...props }: ContainerProps) {
	return (
		<div
			className={cn("mx-auto w-full px-6 sm:px-8 lg:px-10", sizeMap[size], className)}
			{...props}
		/>
	);
}
