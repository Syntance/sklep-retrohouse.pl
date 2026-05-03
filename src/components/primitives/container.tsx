import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

type ContainerProps = ComponentProps<"div"> & {
	size?: "sm" | "md" | "lg" | "xl" | "full";
};

const sizeMap: Record<NonNullable<ContainerProps["size"]>, string> = {
	sm: "max-w-3xl",
	md: "max-w-5xl",
	lg: "max-w-6xl",
	xl: "max-w-7xl",
	full: "max-w-none",
};

export function Container({ className, size = "lg", ...props }: ContainerProps) {
	return (
		<div
			className={cn("mx-auto w-full px-5 sm:px-8 lg:px-12", sizeMap[size], className)}
			{...props}
		/>
	);
}
