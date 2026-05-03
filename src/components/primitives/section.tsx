import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

type SectionProps = ComponentProps<"section"> & {
	tone?: "default" | "muted" | "ink" | "accent";
	spacing?: "sm" | "md" | "lg" | "xl";
	bleed?: boolean;
};

const toneMap: Record<NonNullable<SectionProps["tone"]>, string> = {
	default: "bg-background text-foreground",
	muted: "bg-secondary/60 text-foreground",
	ink: "bg-foreground text-background",
	accent: "bg-brass/15 text-foreground",
};

const spacingMap: Record<NonNullable<SectionProps["spacing"]>, string> = {
	sm: "py-12 md:py-16",
	md: "py-16 md:py-24",
	lg: "py-20 md:py-32",
	xl: "py-24 md:py-40",
};

export function Section({
	className,
	tone = "default",
	spacing = "md",
	bleed,
	...props
}: SectionProps) {
	return (
		<section
			className={cn("relative isolate", toneMap[tone], bleed ? "" : spacingMap[spacing], className)}
			{...props}
		/>
	);
}
