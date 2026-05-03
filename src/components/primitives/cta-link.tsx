import Link from "next/link";
import type { ComponentProps } from "react";
import { ArrowRightIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "underline";

const variantMap: Record<Variant, string> = {
	primary:
		"inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-background shadow-md transition-all hover:bg-primary hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring active:translate-y-px",
	secondary:
		"inline-flex items-center gap-2 rounded-full border border-foreground/15 bg-background px-6 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-foreground transition-colors hover:border-brass hover:text-brass focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring",
	ghost:
		"inline-flex items-center gap-1.5 text-sm font-semibold text-foreground/80 transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring",
	underline:
		"group/cta inline-flex items-center gap-1.5 text-sm font-semibold uppercase tracking-[0.16em] text-foreground after:block after:h-px after:w-full after:scale-x-100 after:origin-left after:bg-current after:transition-transform hover:after:scale-x-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring",
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
				<ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-0.5 group-hover/cta:translate-x-0.5" />
			) : null}
		</Link>
	);
}
