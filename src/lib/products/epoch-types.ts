/** Opcja epoki — value = slug w metadata produktu, label = wyświetlana nazwa. */
export type EpochOption = {
	value: string;
	label: string;
};

/** Domyślna lista epok (fallback gdy brak konfiguracji w Medusa Store). */
export const DEFAULT_EPOCH_OPTIONS: EpochOption[] = [
	{ value: "secesja", label: "Secesja" },
	{ value: "art-deco", label: "Art Deco" },
	{ value: "lata-50", label: "Lata 50." },
	{ value: "lata-60-70", label: "Lata 60.–70." },
	{ value: "inne", label: "Inne" },
];

export function parseEpochsJson(raw: string | null | undefined): EpochOption[] | null {
	if (!raw?.trim()) return null;
	try {
		const parsed = JSON.parse(raw) as unknown;
		if (!Array.isArray(parsed)) return null;
		const epochs = parsed
			.map((item): EpochOption | null => {
				if (!item || typeof item !== "object") return null;
				const obj = item as Record<string, unknown>;
				const value = typeof obj.value === "string" ? obj.value.trim() : "";
				const label = typeof obj.label === "string" ? obj.label.trim() : "";
				return value && label ? { value, label } : null;
			})
			.filter((item): item is EpochOption => item !== null);
		return epochs.length > 0 ? epochs : null;
	} catch {
		return null;
	}
}

export function epochLabelFor(value: string, options: EpochOption[]): string {
	return options.find((option) => option.value === value)?.label ?? (value || "—");
}
