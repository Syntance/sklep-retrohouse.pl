import { cn } from "@/lib/utils";

type RadioInputProps = Omit<React.ComponentProps<"input">, "type">;

export function RadioInput({ className, ...props }: RadioInputProps) {
	return (
		<input
			type="radio"
			className={cn(
				"size-4 shrink-0 cursor-pointer appearance-none rounded-full border border-border bg-background transition-colors",
				"checked:border-terracotta checked:bg-background checked:shadow-[inset_0_0_0_0.25rem_var(--color-terracotta)]",
				"focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta",
				"disabled:cursor-not-allowed disabled:opacity-50",
				className,
			)}
			{...props}
		/>
	);
}
