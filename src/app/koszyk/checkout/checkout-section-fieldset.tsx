import type { CheckoutStep } from "@/lib/analytics/events";

type CheckoutSectionFieldsetProps = {
	step: number;
	title: string;
	eyebrow?: string;
	children: React.ReactNode;
	dataStep?: CheckoutStep;
};

/**
 * Sekcja checkoutu — pełna ramka z zaokrąglonymi narożnikami; tytuł siedzi
 * w przerwie górnej krawędzi: jeden blok `bg-background` maskuje linię pod
 * całością (cyfra + kropka + tekst), bez dodatkowych masek wokół kropki.
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
			className="relative min-w-0 rounded-2xl border border-border bg-card px-6 pb-6 pt-8 md:px-8 md:pb-8 md:pt-9"
		>
			<legend className="absolute inset-x-6 top-0 flex justify-center md:inset-x-8">
				<span className="inline-flex -translate-y-1/2 items-center gap-x-3 bg-background px-4 py-2 font-display text-2xl font-normal leading-none tracking-normal lining-nums">
					<span className="-translate-y-[0.12em]">{step}</span>
					<span
						aria-hidden
						className="size-1 shrink-0 rounded-full bg-foreground/35"
					/>
					<span className="-translate-y-[0.12em]">{title}</span>
				</span>
			</legend>
			{eyebrow ? (
				<p className="font-sans text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-brass">
					{eyebrow}
				</p>
			) : null}
			<div className={eyebrow ? "mt-6 space-y-3" : "mt-2 space-y-3"}>{children}</div>
		</fieldset>
	);
}
