"use client";

import { Loader2, Save } from "lucide-react";
import { useId, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { CheckboxInput } from "@/components/ui/checkbox-input";
import { Input } from "@/components/ui/input";
import type { PopupBanner, SiteSettings } from "@/lib/content/types";
import { saveCmsGlobalSettingsAction } from "../content-actions";
import { HeroImageField } from "../hero-image-field";

const inputClass =
	"h-10 w-full rounded-lg border border-input bg-transparent px-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export const EMPTY_POPUP_BANNER: PopupBanner = {
	enabled: false,
	title: "",
	body: "",
	imageUrl: "",
	ctaLabel: "",
	ctaHref: "",
	oncePerSession: true,
	delayMs: 1500,
};

type Props = {
	initial: PopupBanner;
	/** Reszta ustawień globalnych — zapis scala cały obiekt, nie tylko popup. */
	rest: Pick<SiteSettings, "announcementBar" | "footerText" | "socialLinks">;
};

export function PopupBannerEditor({ initial, rest }: Props) {
	const ids = {
		title: useId(),
		body: useId(),
		ctaLabel: useId(),
		ctaHref: useId(),
		delay: useId(),
		enabled: useId(),
		once: useId(),
	};

	const [form, setForm] = useState<PopupBanner>(initial);
	const [status, setStatus] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [saving, startSave] = useTransition();

	function patch(next: Partial<PopupBanner>) {
		setForm((prev) => ({ ...prev, ...next }));
		setStatus(null);
	}

	function handleSave() {
		setError(null);
		setStatus(null);

		if (form.enabled && !form.title.trim()) {
			setError("Włączony baner musi mieć tytuł.");
			return;
		}
		if (form.ctaLabel?.trim() && !form.ctaHref?.trim()) {
			setError("Podaj adres, do którego prowadzi przycisk.");
			return;
		}

		startSave(async () => {
			const result = await saveCmsGlobalSettingsAction({
				...rest,
				popupBanner: form,
			});
			if (!result.ok) {
				setError(result.error ?? "Nie udało się zapisać.");
				return;
			}
			setStatus("Zapisano. Zmiana jest widoczna w sklepie po odświeżeniu.");
		});
	}

	return (
		<div className="flex flex-col gap-5 rounded-xl border border-border bg-card p-5">
			<label className="flex cursor-pointer items-start gap-3 text-sm">
				<CheckboxInput
					id={ids.enabled}
					checked={form.enabled}
					onChange={(e) => patch({ enabled: e.target.checked })}
					className="mt-0.5"
				/>
				<span>
					<span className="font-medium">Baner włączony</span>
					<span className="mt-0.5 block text-xs text-muted-foreground">
						Wyłączony baner nie renderuje się w sklepie w ogóle.
					</span>
				</span>
			</label>

			<div className="grid gap-4 sm:grid-cols-2">
				<div className="flex flex-col gap-1.5 sm:col-span-2">
					<label htmlFor={ids.title} className="text-sm font-medium">
						Tytuł
					</label>
					<Input
						id={ids.title}
						value={form.title}
						onChange={(e) => patch({ title: e.target.value })}
						placeholder="np. Nowa dostawa mebli z lat 60."
						className={inputClass}
					/>
				</div>

				<div className="flex flex-col gap-1.5 sm:col-span-2">
					<label htmlFor={ids.body} className="text-sm font-medium">
						Treść
					</label>
					<textarea
						id={ids.body}
						rows={3}
						value={form.body ?? ""}
						onChange={(e) => patch({ body: e.target.value })}
						placeholder="Krótki tekst — dwa, trzy zdania."
						className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
					/>
				</div>

				<div className="flex flex-col gap-1.5">
					<label htmlFor={ids.ctaLabel} className="text-sm font-medium">
						Tekst przycisku
					</label>
					<Input
						id={ids.ctaLabel}
						value={form.ctaLabel ?? ""}
						onChange={(e) => patch({ ctaLabel: e.target.value })}
						placeholder="np. Zobacz nowości"
						className={inputClass}
					/>
				</div>

				<div className="flex flex-col gap-1.5">
					<label htmlFor={ids.ctaHref} className="text-sm font-medium">
						Adres przycisku
					</label>
					<Input
						id={ids.ctaHref}
						value={form.ctaHref ?? ""}
						onChange={(e) => patch({ ctaHref: e.target.value })}
						placeholder="/sklep"
						className={inputClass}
					/>
				</div>

				<div className="flex flex-col gap-1.5">
					<label htmlFor={ids.delay} className="text-sm font-medium">
						Opóźnienie (ms)
					</label>
					<Input
						id={ids.delay}
						type="number"
						min={0}
						max={60000}
						step={500}
						value={form.delayMs}
						onChange={(e) => patch({ delayMs: Number.parseInt(e.target.value, 10) || 0 })}
						className={inputClass}
					/>
				</div>

				<label className="flex cursor-pointer items-center gap-2 self-end pb-2 text-sm">
					<CheckboxInput
						id={ids.once}
						checked={form.oncePerSession}
						onChange={(e) => patch({ oncePerSession: e.target.checked })}
					/>
					<span>Pokaż raz na sesję</span>
				</label>
			</div>

			<div className="flex flex-col gap-2">
				<span className="text-sm font-medium">Zdjęcie (opcjonalne)</span>
				<HeroImageField
					label="Zdjęcie banera"
					value={form.imageUrl ?? ""}
					alt=""
					requiresRedeploy={false}
					onChangeUrl={(url) => patch({ imageUrl: url })}
					onChangeAlt={() => undefined}
				/>
			</div>

			{error ? (
				<p role="alert" className="text-sm text-destructive">
					{error}
				</p>
			) : null}
			{status ? (
				<p aria-live="polite" className="text-sm text-emerald-700 dark:text-emerald-400">
					{status}
				</p>
			) : null}

			<div className="flex justify-end">
				<Button type="button" onClick={handleSave} disabled={saving}>
					{saving ? (
						<Loader2 className="size-4 animate-spin" aria-hidden />
					) : (
						<Save className="size-4" aria-hidden />
					)}
					Zapisz baner
				</Button>
			</div>
		</div>
	);
}
