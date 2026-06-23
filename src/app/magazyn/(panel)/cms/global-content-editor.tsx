"use client";

import { Loader2, Save } from "lucide-react";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { SiteSettings } from "@/lib/content/types";
import { saveCmsGlobalSettingsAction } from "./content-actions";
import { cmsSaveSuccessMessage } from "./cms-save-feedback";

const inputClass =
	"w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

type CmsGlobalSettings = Pick<SiteSettings, "announcementBar" | "footerText" | "socialLinks">;

type Props = {
	siteSettings: SiteSettings;
};

export function GlobalContentEditor({ siteSettings: initialSettings }: Props) {
	const [settings, setSettings] = useState<CmsGlobalSettings>({
		announcementBar: initialSettings.announcementBar,
		footerText: initialSettings.footerText,
		socialLinks: initialSettings.socialLinks,
	});
	const [error, setError] = useState<string | null>(null);
	const [successMessage, setSuccessMessage] = useState<string | null>(null);
	const [pending, startTransition] = useTransition();

	function onSubmit(e: React.FormEvent) {
		e.preventDefault();
		setError(null);
		setSuccessMessage(null);

		if (settings.announcementBar?.enabled && !settings.announcementBar.text?.trim()) {
			setError("Pasek informacyjny: wpisz tekst lub odznacz „Włączony”.");
			return;
		}

		startTransition(async () => {
			const result = await saveCmsGlobalSettingsAction(settings);
			if (!result.ok) {
				setError(result.error);
				return;
			}
			setSuccessMessage(cmsSaveSuccessMessage());
		});
	}

	return (
		<form onSubmit={onSubmit} className="flex max-w-3xl flex-col gap-6">
			<fieldset className="flex flex-col gap-3 rounded-xl border border-border p-4">
				<legend className="px-1 text-sm font-medium">Pasek informacyjny</legend>
				<p className="text-xs text-muted-foreground">
					Tekst publikuje się od razu po zapisie. Zdjęcia — po przycisku Redeploy u góry.
				</p>
				<label className="flex items-center gap-2 text-sm">
					<input
						type="checkbox"
						checked={settings.announcementBar?.enabled ?? false}
						onChange={(e) => {
							setSettings((s) => ({
								...s,
								announcementBar: {
									enabled: e.target.checked,
									text: s.announcementBar?.text ?? "",
									link: s.announcementBar?.link,
								},
							}));
						}}
						className="size-4"
					/>
					Włączony
				</label>
				<Input
					value={settings.announcementBar?.text ?? ""}
					onChange={(e) => {
						setSettings((s) => ({
							...s,
							announcementBar: {
								enabled: s.announcementBar?.enabled ?? true,
								text: e.target.value,
								link: s.announcementBar?.link,
							},
						}));
					}}
					placeholder="Tekst paska"
					className="h-10"
				/>
				<Input
					value={settings.announcementBar?.link ?? ""}
					onChange={(e) => {
						setSettings((s) => ({
							...s,
							announcementBar: {
								enabled: s.announcementBar?.enabled ?? true,
								text: s.announcementBar?.text ?? "",
								link: e.target.value || undefined,
							},
						}));
					}}
					placeholder="Link (opcjonalnie)"
					className="h-10"
				/>
			</fieldset>

			<fieldset className="flex flex-col gap-3 rounded-xl border border-border p-4">
				<legend className="px-1 text-sm font-medium">Stopka i social media</legend>
				<textarea
					value={settings.footerText ?? ""}
					onChange={(e) => {
						setSettings((s) => ({ ...s, footerText: e.target.value }));
					}}
					rows={2}
					className={inputClass}
					placeholder="Tekst copyright w stopce (opcjonalnie)"
				/>
				<Input
					value={settings.socialLinks?.instagram ?? ""}
					onChange={(e) => {
						setSettings((s) => ({
							...s,
							socialLinks: { ...s.socialLinks, instagram: e.target.value },
						}));
					}}
					placeholder="Instagram URL"
					className="h-10"
				/>
				<Input
					value={settings.socialLinks?.facebook ?? ""}
					onChange={(e) => {
						setSettings((s) => ({
							...s,
							socialLinks: { ...s.socialLinks, facebook: e.target.value },
						}));
					}}
					placeholder="Facebook URL"
					className="h-10"
				/>
				<Input
					value={settings.socialLinks?.whatsapp ?? ""}
					onChange={(e) => {
						setSettings((s) => ({
							...s,
							socialLinks: { ...s.socialLinks, whatsapp: e.target.value },
						}));
					}}
					placeholder="WhatsApp (numer lub link)"
					className="h-10"
				/>
			</fieldset>

			{error ? (
				<p role="alert" className="text-sm text-destructive">
					{error}
				</p>
			) : null}
			{successMessage ? (
				<p role="status" className="text-sm text-emerald-600">
					{successMessage}
				</p>
			) : null}
			<Button type="submit" disabled={pending} className="h-10 w-fit gap-1.5">
				{pending ? (
					<Loader2 className="size-4 animate-spin" aria-hidden />
				) : (
					<Save className="size-4" aria-hidden />
				)}
				Zapisz treści globalne
			</Button>
		</form>
	);
}
