import { cn } from "@/lib/utils";

const STEPS = ["Koszyk", "Dane", "Płatność", "Gotowe"] as const;

export function CheckoutProgress({ step }: { step: 1 | 2 | 3 | 4 }) {
	return (
		<ol
			aria-label="Postęp zakupu"
			className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs uppercase tracking-[0.16em]"
		>
			{STEPS.map((label, index) => {
				const value = index + 1;
				const state = value < step ? "done" : value === step ? "active" : "todo";
				return (
					<li
						key={label}
						aria-current={state === "active" ? "step" : undefined}
						className="flex items-center gap-2 text-foreground/60"
					>
						<span
							className={cn(
								"grid size-6 place-items-center rounded-full text-[0.7rem] font-semibold",
								state === "done" && "bg-success text-success-foreground",
								state === "active" && "bg-foreground text-background",
								state === "todo" && "border border-border bg-background text-foreground/60",
							)}
						>
							{state === "done" ? "✓" : value}
						</span>
						<span className={cn("font-semibold", state === "active" && "text-foreground")}>
							{label}
						</span>
						{value < STEPS.length ? (
							<span aria-hidden className="text-foreground/30">
								·
							</span>
						) : null}
					</li>
				);
			})}
		</ol>
	);
}
