import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export function Eyebrow({ className, children, ...props }: ComponentProps<"span">) {
	return (
		<span
			className={cn(
				"inline-flex items-center gap-2 font-sans text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-brass",
				"before:h-px before:w-8 before:bg-brass/60 before:content-['']",
				className,
			)}
			{...props}
		>
			{children}
		</span>
	);
}
