"use client";

import { Loader2, Plus, Save, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ContentBlockKey } from "@/lib/content/metadata-keys";
import type {
	ContentPageId,
	FaqItem,
	HeroContent,
	PageContent,
} from "@/lib/content/types";
import { DEFAULT_HOME_HERO } from "@/lib/content/defaults";
import { usePreventWindowFileDrop } from "@/lib/hooks/use-prevent-window-file-drop";
import { savePageContentAction, savePageHeroImageAction, savePageHeroBackgroundAction } from "./content-actions";
import { cmsSaveSuccessMessage } from "./cms-save-feedback";
import { HeroImageField } from "./hero-image-field";

const inputClass =
	"w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

type Props = {
	pageId: ContentPageId;
	path: string;
	blocks: ContentBlockKey[];
	initial: PageContent;
};

export function PageContentEditor({ pageId, path, blocks, initial }: Props) {
	const [content, setContent] = useState<PageContent>(initial);
	const [error, setError] = useState<string | null>(null);
	const [successMessage, setSuccessMessage] = useState<string | null>(null);
	const [heroSaving, setHeroSaving] = useState(false);
	const [pending, startTransition] = useTransition();
	usePreventWindowFileDrop();

	function onSubmit(e: React.FormEvent) {
		e.preventDefault();
		setError(null);
		setSuccessMessage(null);
		startTransition(async () => {
			const result = await savePageContentAction(pageId, path, content);
			if (!result.ok) {
				setError(result.error);
				return;
			}
			setSuccessMessage(cmsSaveSuccessMessage());
		});
	}

	async function saveHeroImage(url: string, alt?: string) {
		setError(null);
		setSuccessMessage(null);
		setHeroSaving(true);

		try {
			const result =
				pageId === "sklep"
					? await savePageHeroBackgroundAction(pageId, path, {
							backgroundImageUrl: url,
							...(alt !== undefined && alt !== "" ? { backgroundImageAlt: alt } : {}),
						})
					: await savePageHeroImageAction(pageId, path, {
							productImageUrl: url,
							...(alt !== undefined && alt !== "" ? { productImageAlt: alt } : {}),
						});
			if (!result.ok) {
				setError(result.error);
				return;
			}
			setSuccessMessage(
				pageId === "sklep"
					? "Tło zapisane — odśwież /sklep, żeby zobaczyć zmianę."
					: "Zdjęcie zapisane. Użyj Redeploy, żeby opublikować je na stronie.",
			);
		} finally {
			setHeroSaving(false);
		}
	}

	return (
		<form onSubmit={onSubmit} className="flex max-w-3xl flex-col gap-6">
			{blocks.includes("hero") ? (
				<HeroEditor
					value={content.hero}
					pageId={pageId}
					heroSaving={heroSaving}
					onChange={(hero) => {
						setContent((c) => ({ ...c, hero }));
					}}
					onSaveHeroImage={(url, alt) => saveHeroImage(url, alt)}
				/>
			) : null}
			{blocks.includes("faq") ? (
				<FaqEditor
					value={content.faq ?? []}
					onChange={(faq) => {
						setContent((c) => ({ ...c, faq }));
					}}
				/>
			) : null}
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
			<Button type="submit" disabled={pending || heroSaving || pageId === "sklep"} className="h-10 w-fit gap-1.5">
				{pending ? (
					<Loader2 className="size-4 animate-spin" aria-hidden />
				) : (
					<Save className="size-4" aria-hidden />
				)}
				Zapisz treści
			</Button>
		</form>
	);
}

function HeroEditor({
	value,
	pageId,
	heroSaving,
	onChange,
	onSaveHeroImage,
}: {
	value?: Partial<HeroContent>;
	pageId: ContentPageId;
	heroSaving: boolean;
	onChange: (v: Partial<HeroContent>) => void;
	onSaveHeroImage: (url: string, alt?: string) => Promise<void>;
}) {
	const hero =
		value ??
		(pageId === "home"
			? DEFAULT_HOME_HERO
			: {
					headline: "",
					description: "",
					ctaLabel: "",
					ctaHref: "",
				});

	const showHeroImage =
		pageId === "home" || pageId === "prezent" || pageId === "o-nas" || pageId === "sklep";
	const isShopBackground = pageId === "sklep";

	return (
		<fieldset className="flex flex-col gap-3 rounded-xl border border-border p-4">
			<legend className="px-1 text-sm font-medium">
				{isShopBackground ? "Tło hero sklepu" : "Hero"}
			</legend>
			{pageId === "home" ? (
				<>
					<Input
						value={hero.headline}
						onChange={(e) => {
							onChange({ ...hero, headline: e.target.value });
						}}
						placeholder="Nagłówek (H1)"
						className="h-10"
					/>
					<Input
						value={hero.subLead ?? ""}
						onChange={(e) => {
							onChange({ ...hero, subLead: e.target.value });
						}}
						placeholder="Sub-lead (opcjonalnie)"
						className="h-10"
					/>
					<textarea
						value={hero.description}
						onChange={(e) => {
							onChange({ ...hero, description: e.target.value });
						}}
						rows={3}
						className={inputClass}
						placeholder="Opis (lead)"
					/>
					<div className="grid gap-3 sm:grid-cols-2">
						<Input
							value={hero.ctaLabel}
							onChange={(e) => {
								onChange({ ...hero, ctaLabel: e.target.value });
							}}
							placeholder="CTA — etykieta"
							className="h-10"
						/>
						<Input
							value={hero.ctaHref}
							onChange={(e) => {
								onChange({ ...hero, ctaHref: e.target.value });
							}}
							placeholder="CTA — link (#home-kategorie lub /sklep)"
							className="h-10"
						/>
					</div>
					<div className="grid gap-3 sm:grid-cols-2">
						<Input
							value={hero.ctaSecondaryLabel ?? ""}
							onChange={(e) => {
								onChange({ ...hero, ctaSecondaryLabel: e.target.value });
							}}
							placeholder="Drugie CTA — etykieta"
							className="h-10"
						/>
						<Input
							value={hero.ctaSecondaryHref ?? ""}
							onChange={(e) => {
								onChange({ ...hero, ctaSecondaryHref: e.target.value });
							}}
							placeholder="Drugie CTA — link"
							className="h-10"
						/>
					</div>
				</>
			) : null}
			{showHeroImage ? (
				<HeroImageField
					label={isShopBackground ? "Zdjęcie panoramiczne (tło)" : "Zdjęcie hero"}
					value={
						isShopBackground
							? (hero.backgroundImageUrl ?? "")
							: (hero.productImageUrl ?? "")
					}
					alt={
						isShopBackground
							? (hero.backgroundImageAlt ?? "")
							: (hero.productImageAlt ?? "")
					}
					saving={heroSaving}
					requiresRedeploy={!isShopBackground}
					onChangeUrl={(url) => {
						if (isShopBackground) {
							onChange({ ...hero, backgroundImageUrl: url || undefined });
							return;
						}
						onChange({ ...hero, productImageUrl: url || undefined });
					}}
					onUploadComplete={async (url) => {
						await onSaveHeroImage(
							url,
							isShopBackground ? hero.backgroundImageAlt : hero.productImageAlt,
						);
					}}
					onChangeAlt={(alt) => {
						if (isShopBackground) {
							onChange({ ...hero, backgroundImageAlt: alt });
							return;
						}
						onChange({ ...hero, productImageAlt: alt });
					}}
				/>
			) : (
				<>
					<Input
						value={hero.productImageUrl ?? ""}
						onChange={(e) => {
							onChange({ ...hero, productImageUrl: e.target.value });
						}}
						placeholder="URL zdjęcia (hero)"
						className="h-10"
					/>
					<Input
						value={hero.productImageAlt ?? ""}
						onChange={(e) => {
							onChange({ ...hero, productImageAlt: e.target.value });
						}}
						placeholder="Alt zdjęcia (SEO + a11y)"
						className="h-10"
					/>
				</>
			)}
		</fieldset>
	);
}

function FaqEditor({ value, onChange }: { value: FaqItem[]; onChange: (v: FaqItem[]) => void }) {
	function add() {
		onChange([
			...value,
			{
				id: `faq-${Date.now()}`,
				question: "",
				answer: "",
				order: value.length,
			},
		]);
	}

	function update(index: number, patch: Partial<FaqItem>) {
		onChange(value.map((item, i) => (i === index ? { ...item, ...patch } : item)));
	}

	function remove(index: number) {
		onChange(value.filter((_, i) => i !== index));
	}

	return (
		<fieldset className="flex flex-col gap-3 rounded-xl border border-border p-4">
			<legend className="px-1 text-sm font-medium">FAQ</legend>
			{value.map((item, index) => (
				<div key={item.id} className="flex flex-col gap-2 rounded-lg border border-border p-3">
					<Input
						value={item.question}
						onChange={(e) => {
							update(index, { question: e.target.value });
						}}
						placeholder="Pytanie"
						className="h-9"
					/>
					<textarea
						value={item.answer}
						onChange={(e) => {
							update(index, { answer: e.target.value });
						}}
						rows={3}
						className={inputClass}
						placeholder="Odpowiedź"
					/>
					<Button
						type="button"
						variant="ghost"
						size="sm"
						onClick={() => {
							remove(index);
						}}
						className="w-fit gap-1 text-destructive"
					>
						<Trash2 className="size-4" />
						Usuń
					</Button>
				</div>
			))}
			<Button type="button" variant="outline" size="sm" onClick={add} className="w-fit gap-1">
				<Plus className="size-4" />
				Dodaj FAQ
			</Button>
		</fieldset>
	);
}
