import type { CheckoutStep } from "@/lib/analytics/events";

type CheckoutSectionFieldsetProps = {
	step: number;
	title: string;
	eyebrow?: string;
	children: React.ReactNode;
	dataStep?: CheckoutStep;
};

/**
 * Sekcja checkoutu — natywny `fieldset + legend`.
 * Przeglądarka automatycznie przerywa górną krawędź pod legendą,
 * więc zero tła potrzebne, narożniki prawidłowe.
 */
export function CheckoutSectionFieldset({
	step,
	title,
	eyebrow,
	children,
	dataStep,
}: CheckoutSectionFieldsetProps) {
	return (
		<fieldset
			data-step={dataStep}
			className="min-w-0 rounded-2xl border border-border bg-card px-6 pb-6 pt-2 md:px-8 md:pb-8 md:pt-4"
		>
			<legend className="mx-auto flex items-center gap-x-3 px-4 py-1 font-display text-2xl font-normal leading-none tracking-normal lining-nums">
				<span className="-translate-y-[0.12em]">{step}</span>
				<span aria-hidden className="size-1 shrink-0 rounded-full bg-foreground/35" />
				<span className="-translate-y-[0.12em]">{title}</span>
			</legend>
			{eyebrow ? (
				<p className="mt-4 font-sans text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-brass">
					{eyebrow}
				</p>
			) : null}
			<div className={eyebrow ? "mt-4 space-y-3" : "mt-4 space-y-3"}>{children}</div>
		</fieldset>
	);
}
