import { CheckIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

type CheckboxInputProps = Omit<React.ComponentProps<"input">, "type">;

export function CheckboxInput({ className, ...props }: CheckboxInputProps) {
	return (
		<span
			className={cn(
				"relative inline-grid size-4 shrink-0 place-items-center",
				className,
			)}
		>
			<input type="checkbox" className="peer sr-only" {...props} />
			<span
				aria-hidden
				className={cn(
					"col-start-1 row-start-1 size-4 rounded border border-border bg-background transition-colors",
					"peer-checked:border-terracotta",
					"peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-terracotta",
					"peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
				)}
			/>
			<CheckIcon
				aria-hidden
				className={cn(
					"col-start-1 row-start-1 size-3 text-terracotta opacity-0 transition-opacity",
					"peer-checked:opacity-100",
				)}
				strokeWidth={2.5}
			/>
		</span>
	);
}
