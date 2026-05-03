import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/**
 * Eyebrow — mały tekst akcentu nad nagłówkiem.
 * Brandbook 2026-05-03: terakota jako kolor akcentu wyróżniającego.
 * Linia przed tekstem w mosiądzu (ozdobnik z brandbooka).
 */
export function Eyebrow({ className, children, ...props }: ComponentProps<"span">) {
	return (
		<span
			className={cn(
				"inline-flex items-center gap-2 font-sans text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-terracotta",
				"before:h-px before:w-8 before:bg-terracotta before:content-['']",
				className,
			)}
			{...props}
		>
			{children}
		</span>
	);
}
