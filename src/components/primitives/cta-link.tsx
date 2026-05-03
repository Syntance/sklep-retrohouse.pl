import Link from "next/link";
import type { ComponentProps } from "react";
import { ArrowRightIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

/**
 * CTA wg brandbooka 2026-05-03:
 *  - primary   — terakota fill, biały text, UPPERCASE, Inter SemiBold, tracking +0.08em
 *  - secondary — biała ramka brąz orzechowy, text ink, hover terakota
 *  - ghost     — bez ramki, mała wersja inline (pod tekst)
 *  - underline — link text z gradient underline (do "Zobacz więcej" itp.)
 *  - dark      — odwrotny do primary (białe na ink — używany na tle paper/cream gdy primary za jaskrawy)
 */
type Variant = "primary" | "secondary" | "ghost" | "underline" | "dark";

const baseFocus =
	"focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring";

const variantMap: Record<Variant, string> = {
	primary: cn(
		"group/cta inline-flex items-center gap-2 rounded-full bg-terracotta px-6 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-terracotta-foreground shadow-md transition-all",
		"hover:-translate-y-0.5 hover:shadow-lg hover:bg-terracotta/95",
		"active:translate-y-0 active:shadow-sm",
		baseFocus,
	),
	secondary: cn(
		"group/cta inline-flex items-center gap-2 rounded-full border border-walnut/30 bg-background px-6 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-foreground transition-colors",
		"hover:border-terracotta hover:text-terracotta",
		baseFocus,
	),
	ghost: cn(
		"inline-flex items-center gap-1.5 text-sm font-semibold text-foreground/80 transition-colors",
		"hover:text-terracotta",
		baseFocus,
	),
	underline: cn(
		"group/cta inline-flex items-center gap-1.5 text-sm font-semibold uppercase tracking-[0.08em] text-foreground",
		"after:block after:h-px after:w-full after:origin-left after:scale-x-100 after:bg-terracotta after:transition-transform",
		"hover:text-terracotta hover:after:scale-x-0",
		baseFocus,
	),
	dark: cn(
		"group/cta inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-ink-foreground shadow-md transition-all",
		"hover:-translate-y-0.5 hover:shadow-lg hover:bg-ink/90",
		"active:translate-y-0 active:shadow-sm",
		baseFocus,
	),
};

type CtaLinkProps = ComponentProps<typeof Link> & {
	variant?: Variant;
	withArrow?: boolean;
};

export function CtaLink({
	className,
	variant = "primary",
	withArrow = true,
	children,
	...props
}: CtaLinkProps) {
	return (
		<Link className={cn(variantMap[variant], className)} {...props}>
			<span className="flex items-center gap-2">{children}</span>
			{withArrow ? (
				<ArrowRightIcon className="size-4 transition-transform duration-300 group-hover/cta:translate-x-0.5" />
			) : null}
		</Link>
	);
}
