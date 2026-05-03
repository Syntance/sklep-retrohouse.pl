import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

type EyebrowVariant = "default" | "script";

type EyebrowProps = ComponentProps<"span"> & {
	/**
	 * `default` — Inter UPPERCASE z mosiężną kreską (oryginalny brandbook).
	 * `script`  — Playfair italic, lowercase, bez kreski. Cieplejszy, bardziej
	 *             „domowy". Używać tam, gdzie chcemy intymności (hero, story,
	 *             newsletter).
	 */
	variant?: EyebrowVariant;
};

/**
 * Eyebrow — mały tekst akcentu nad nagłówkiem.
 *
 * Brandbook 2026-05-03: terakota jako kolor akcentu.
 * 2026-05-03 (uproszczenie): drugi wariant `script` (Playfair italic) —
 * całość strony zyskuje na ciepłej intymności gdy tekst nie krzyczy capslockiem.
 */
export function Eyebrow({ className, variant = "default", children, ...props }: EyebrowProps) {
	if (variant === "script") {
		return (
			<span
				className={cn(
					"script-eyebrow inline-block text-base text-terracotta md:text-lg",
					className,
				)}
				{...props}
			>
				{children}
			</span>
		);
	}
	return (
		<span
			className={cn(
				"inline-flex items-center gap-2 font-sans text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-terracotta",
				"before:h-px before:w-8 before:bg-brass before:content-['']",
				className,
			)}
			{...props}
		>
			{children}
		</span>
	);
}
