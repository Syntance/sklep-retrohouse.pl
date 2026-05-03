import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/**
 * Sekcja — kontener tonalny zgodny z brandbookiem RetroHouse 2026-05-03.
 *
 * Tony:
 *  - default — białe tło UI (czyste sekcje produktowe, neutral background)
 *  - paper   — beż #CDB99F, tło "papier" do hero/storytelling/o-nas (z subtle paper-grain)
 *  - cream   — krem #E8DCC0, alt sekcje, mniej intensywne niż paper
 *  - ink     — czerń złamana brązem #2D1810, footer / dramatic callout
 *  - accent  — bladszy odcień terakoty (15%), do banerów promocyjnych
 *  - muted   — alias na cream (back-compat).
 */
type SectionProps = ComponentProps<"section"> & {
	tone?: "default" | "paper" | "cream" | "muted" | "ink" | "accent";
	spacing?: "sm" | "md" | "lg" | "xl";
	bleed?: boolean;
	/** Dodaje delikatną teksturę papieru. Sensowne tylko dla `paper` i `cream`. */
	grain?: boolean;
};

const toneMap: Record<NonNullable<SectionProps["tone"]>, string> = {
	default: "bg-background text-foreground",
	paper: "bg-paper text-paper-foreground",
	cream: "bg-cream text-cream-foreground",
	muted: "bg-cream text-cream-foreground", // alias
	ink: "bg-ink text-ink-foreground",
	accent: "bg-terracotta/12 text-foreground",
};

const spacingMap: Record<NonNullable<SectionProps["spacing"]>, string> = {
	sm: "py-10 md:py-14",
	md: "py-14 md:py-20",
	lg: "py-18 md:py-28",
	xl: "py-22 md:py-36",
};

/**
 * Tony „papier" i „krem" automatycznie dostają subtelny grain — to ich
 * tożsamość („papierowe" sekcje brandbooka). Można jawnie wyłączyć
 * przez `grain={false}` jeśli komuś przeszkadza w konkretnym layoucie.
 */
export function Section({
	className,
	tone = "default",
	spacing = "md",
	bleed,
	grain,
	...props
}: SectionProps) {
	const autoGrain = grain ?? (tone === "paper" || tone === "cream");
	return (
		<section
			className={cn(
				"relative isolate",
				toneMap[tone],
				autoGrain && "paper-grain",
				bleed ? "" : spacingMap[spacing],
				className,
			)}
			{...props}
		/>
	);
}

/**
 * Złoty/mosiężny separator — element dekoracyjny brandbooka.
 * Cienka linia z gradientem fadeout po bokach. Idealny między sekcjami.
 */
export function BrassRule({ className }: { className?: string }) {
	return <hr className={cn("brass-rule mx-auto w-full max-w-md", className)} />;
}
