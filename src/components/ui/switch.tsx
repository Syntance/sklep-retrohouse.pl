"use client";

import { cn } from "@/lib/utils";

type SwitchProps = {
	checked: boolean;
	onCheckedChange: (checked: boolean) => void;
	disabled?: boolean;
	id?: string;
	"aria-label"?: string;
	className?: string;
};

export function Switch({
	checked,
	onCheckedChange,
	disabled,
	id,
	"aria-label": ariaLabel,
	className,
}: SwitchProps) {
	return (
		<button
			type="button"
			role="switch"
			id={id}
			aria-checked={checked}
			aria-label={ariaLabel}
			disabled={disabled}
			onClick={() => onCheckedChange(!checked)}
			className={cn(
				"relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border border-transparent transition-colors",
				"focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
				checked ? "bg-primary" : "bg-input",
				disabled && "cursor-not-allowed opacity-50",
				className,
			)}
		>
			<span
				aria-hidden
				className={cn(
					"pointer-events-none block size-5 rounded-full bg-background shadow-sm transition-transform",
					checked ? "translate-x-[1.35rem]" : "translate-x-0.5",
				)}
			/>
		</button>
	);
}
