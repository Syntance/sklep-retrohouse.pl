import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export function Lead({ className, ...props }: ComponentProps<"p">) {
	return (
		<p
			className={cn(
				"max-w-2xl text-pretty font-sans text-lg leading-relaxed text-foreground/80 md:text-xl",
				className,
			)}
			{...props}
		/>
	);
}
