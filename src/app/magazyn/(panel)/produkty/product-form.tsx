"use client";

import { Plus, Trash2, Upload, X } from "lucide-react";
import Link from "next/link";
import { useId, useRef, useState, useTransition } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AdminProductDetail, DefectItem, ProductStatus } from "@/lib/admin/products";
import { slugify } from "@/lib/admin/slug";
import { cn } from "@/lib/utils";
import { type ProductPayload, saveProductAction, uploadImagesAction } from "./actions";
import { ProductImagePreview } from "./product-image-preview";

type CategoryOption = { id: string; name: string };
type EpochOption = { value: string; label: string };

type Props = {
	categories: CategoryOption[];
	epochs: EpochOption[];
	initial?: AdminProductDetail;
};

const inputClass =
	"w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

function Field({
	label,
	htmlFor,
	hint,
	children,
}: {
	label: string;
	htmlFor?: string;
	hint?: string;
	children: React.ReactNode;
}) {
	return (
		<div className="flex flex-col gap-1.5">
			<label htmlFor={htmlFor} className="text-sm font-medium text-foreground">
				{label}
			</label>
			{children}
			{hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
		</div>
	);
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
	return (
		<section className="rounded-xl border border-border bg-card p-5">
			<h2 className="mb-4 font-serif text-lg text-foreground">{title}</h2>
			{children}
		</section>
	);
}

function parseNumber(value: string): number | null {
	const normalized = value.replace(",", ".").trim();
	if (!normalized) return null;
	const num = Number(normalized);
	return Number.isFinite(num) && num >= 0 ? num : null;
}

export function ProductForm({ categories, epochs, initial }: Props) {
	const ids = {
		title: useId(),
		category: useId(),
		status: useId(),
		epoch: useId(),
		delivery: useId(),
		photos: useId(),
	};
	const fileInputRef = useRef<HTMLInputElement>(null);

	const [title, setTitle] = useState(initial?.title ?? "");
	const [status, setStatus] = useState<ProductStatus>(initial?.status ?? "draft");
	const [categoryId, setCategoryId] = useState(initial?.categoryId ?? "");
	const [pricePln, setPricePln] = useState(initial?.pricePln != null ? String(initial.pricePln) : "");
	const [description, setDescription] = useState(initial?.description ?? "");
	const [shortDescription, setShortDescription] = useState(initial?.shortDescription ?? "");
	const [story, setStory] = useState(initial?.story ?? "");
	const [manufacturer, setManufacturer] = useState(initial?.manufacturer ?? "");
	const [epoch, setEpoch] = useState(initial?.epoch ?? "");
	const [signature, setSignature] = useState(initial?.signature ?? "");
	const [dimensions, setDimensions] = useState(initial?.dimensions ?? "");
	const [condition, setCondition] = useState(initial?.condition ?? "");
	const [pickupOnly, setPickupOnly] = useState(initial?.pickupOnly ?? false);
	const [defects, setDefects] = useState<DefectItem[]>(initial?.defects ?? []);
	const [images, setImages] = useState<string[]>(initial?.images ?? []);
	const [badgesText, setBadgesText] = useState((initial?.badges ?? []).join(", "));
	const [popularity, setPopularity] = useState(String(initial?.popularity ?? 0));
	const [giftBestseller, setGiftBestseller] = useState(initial?.giftBestseller ?? false);

	const [uploading, setUploading] = useState(false);
	const [isDragging, setIsDragging] = useState(false);
	const dragDepthRef = useRef(0);
	const [error, setError] = useState<string | null>(null);
	const [pending, startTransition] = useTransition();

	function updateDefect(index: number, patch: Partial<DefectItem>) {
		setDefects((prev) => prev.map((d, i) => (i === index ? { ...d, ...patch } : d)));
	}

	async function uploadFiles(files: File[]) {
		const imageFiles = files.filter((file) => file.type.startsWith("image/"));
		if (imageFiles.length === 0) return;

		setUploading(true);
		setError(null);
		const formData = new FormData();
		for (const file of imageFiles) formData.append("files", file);
		const result = await uploadImagesAction(formData);
		setUploading(false);
		if (fileInputRef.current) fileInputRef.current.value = "";
		if (result.error) {
			setError(result.error);
			return;
		}
		setImages((prev) => [...prev, ...result.urls]);
	}

	async function onUpload(files: FileList | null) {
		if (!files || files.length === 0) return;
		await uploadFiles(Array.from(files));
	}

	function onDragEnter(event: React.DragEvent<HTMLElement>) {
		event.preventDefault();
		dragDepthRef.current += 1;
		setIsDragging(true);
	}

	function onDragLeave(event: React.DragEvent<HTMLElement>) {
		event.preventDefault();
		dragDepthRef.current -= 1;
		if (dragDepthRef.current <= 0) {
			dragDepthRef.current = 0;
			setIsDragging(false);
		}
	}

	function onDragOver(event: React.DragEvent<HTMLElement>) {
		event.preventDefault();
		event.dataTransfer.dropEffect = "copy";
	}

	function onDrop(event: React.DragEvent<HTMLElement>) {
		event.preventDefault();
		dragDepthRef.current = 0;
		setIsDragging(false);
		void uploadFiles(Array.from(event.dataTransfer.files));
	}

	function onSubmit(event: React.FormEvent) {
		event.preventDefault();
		setError(null);

		const payload: ProductPayload = {
			id: initial?.id,
			variantId: initial?.variantId ?? null,
			title: title.trim(),
			status,
			categoryId: categoryId || null,
			description,
			shortDescription,
			story,
			manufacturer,
			epoch,
			signature,
			dimensions,
			condition,
			defects: defects.filter((d) => d.label.trim().length > 0),
			pickupOnly,
			pricePln: parseNumber(pricePln),
			images,
			badges: badgesText
				.split(",")
				.map((b) => b.trim())
				.filter(Boolean),
			popularity: Math.max(0, Math.min(100, Number(popularity) || 0)),
			giftBestseller,
		};

		startTransition(async () => {
			const result = await saveProductAction(payload);
			if (result && !result.ok) setError(result.error);
		});
	}

	return (
		<form onSubmit={onSubmit} className="flex flex-col gap-5">
			<Section title="Podstawowe">
				<div className="grid gap-4 sm:grid-cols-2">
					<div className="sm:col-span-2">
						<Field label="Nazwa produktu" htmlFor={ids.title}>
							<Input
								id={ids.title}
								value={title}
								onChange={(e) => setTitle(e.target.value)}
								placeholder="np. Wazon secesyjny, szkło barwione"
								required
								className="h-10"
							/>
							{title.trim() ? (
								<p className="mt-1.5 text-xs text-muted-foreground">
									Adres: /sklep/{slugify(title)}
								</p>
							) : null}
						</Field>
					</div>

					<Field label="Kategoria" htmlFor={ids.category}>
						<select
							id={ids.category}
							value={categoryId}
							onChange={(e) => setCategoryId(e.target.value)}
							className={cn(inputClass, "h-10")}
						>
							<option value="">— bez kategorii —</option>
							{categories.map((category) => (
								<option key={category.id} value={category.id}>
									{category.name}
								</option>
							))}
						</select>
					</Field>

					<Field label="Status" htmlFor={ids.status}>
						<select
							id={ids.status}
							value={status}
							onChange={(e) => setStatus(e.target.value as ProductStatus)}
							className={cn(inputClass, "h-10")}
						>
							<option value="draft">Szkic (ukryty)</option>
							<option value="published">Opublikowany (widoczny w sklepie)</option>
						</select>
					</Field>

					<Field label="Epoka" htmlFor={ids.epoch}>
						<select
							id={ids.epoch}
							value={epoch}
							onChange={(e) => setEpoch(e.target.value)}
							className={cn(inputClass, "h-10")}
						>
							<option value="">— nieokreślona —</option>
							{epochs.map((option) => (
								<option key={option.value} value={option.value}>
									{option.label}
								</option>
							))}
						</select>
					</Field>

					<Field label="Cena (PLN)" hint="Cena w złotówkach — jedyna waluta w sklepie.">
						<div className="flex items-center gap-2">
							<Input
								value={pricePln}
								onChange={(e) => setPricePln(e.target.value)}
								inputMode="decimal"
								placeholder="0"
								required
								className="h-10"
							/>
							<span className="text-sm font-medium text-muted-foreground">zł</span>
						</div>
					</Field>
				</div>
			</Section>

			<Section title="Zdjęcia">
				<div className="flex flex-col gap-4">
					{initial && initial.staleImageCount > 0 ? (
						<p
							role="status"
							className="rounded-lg border border-terracotta/30 bg-terracotta/10 px-3 py-2.5 text-sm text-foreground/80"
						>
							<strong className="font-medium text-foreground">
								{initial.staleImageCount}{" "}
								{initial.staleImageCount === 1 ? "zdjęcie wygasło" : "zdjęć wygasło"}
							</strong>{" "}
							— pliki zniknęły z serwera (upload sprzed migracji). Dodaj zdjęcia ponownie i
							zapisz produkt.
						</p>
					) : null}
					{images.length > 0 ? (
						<div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
							{images.map((url, index) => (
								<div
									key={url}
									className="group relative aspect-[4/3] overflow-hidden rounded-lg border border-border bg-muted"
								>
									<ProductImagePreview url={url} isPrimary={index === 0} />
									<button
										type="button"
										onClick={() => setImages((prev) => prev.filter((_, i) => i !== index))}
										aria-label="Usuń zdjęcie"
										className="absolute right-1.5 top-1.5 inline-flex size-6 items-center justify-center rounded-full bg-background/90 text-foreground opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
									>
										<X className="size-3.5" aria-hidden />
									</button>
								</div>
							))}
						</div>
					) : null}

					<label
						htmlFor={ids.photos}
						onDragEnter={onDragEnter}
						onDragLeave={onDragLeave}
						onDragOver={onDragOver}
						onDrop={onDrop}
						className={cn(
							"flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 text-center transition-colors",
							isDragging
								? "border-primary bg-primary/5"
								: "border-border hover:bg-muted/40",
							uploading && "cursor-not-allowed opacity-60",
						)}
					>
						<input
							ref={fileInputRef}
							id={ids.photos}
							type="file"
							accept="image/*"
							multiple
							disabled={uploading}
							className="sr-only"
							onChange={(e) => void onUpload(e.target.files)}
						/>
						<Upload
							className={cn("size-8 text-muted-foreground", isDragging && "text-primary")}
							aria-hidden
						/>
						<span className="text-sm font-medium text-foreground">
							{uploading
								? "Wysyłanie…"
								: isDragging
									? "Upuść zdjęcia tutaj"
									: "Upuść zdjęcia lub kliknij, aby wybrać"}
						</span>
						<span className="text-xs text-muted-foreground">
							JPG, PNG, WebP · wiele plików naraz
						</span>
					</label>
				</div>
			</Section>

			<Section title="Dostawa">
				<Field
					label="Sposób dostawy"
					htmlFor={ids.delivery}
					hint="Tylko odbiór osobisty pokaże w sklepie wyraźny callout zamiast informacji o wysyłce."
				>
					<select
						id={ids.delivery}
						value={pickupOnly ? "pickup_only" : "shipping"}
						onChange={(e) => setPickupOnly(e.target.value === "pickup_only")}
						className={cn(inputClass, "h-10")}
					>
						<option value="shipping">Wysyłka + odbiór osobisty</option>
						<option value="pickup_only">Tylko odbiór osobisty (bez wysyłki)</option>
					</select>
				</Field>
			</Section>

			<Section title="Opis">
				<div className="flex flex-col gap-4">
					<Field label="Krótki opis" hint="Wyświetlany na karcie produktu (max ~160 znaków).">
						<textarea
							value={shortDescription}
							onChange={(e) => setShortDescription(e.target.value)}
							rows={2}
							className={inputClass}
						/>
					</Field>
					<Field label="Pełny opis">
						<textarea
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							rows={5}
							className={inputClass}
						/>
					</Field>
					<Field label="Historia przedmiotu" hint="Pochodzenie, ciekawostki — opcjonalne.">
						<textarea
							value={story}
							onChange={(e) => setStory(e.target.value)}
							rows={3}
							className={inputClass}
						/>
					</Field>
				</div>
			</Section>

			<Section title="Szczegóły">
				<div className="grid gap-4 sm:grid-cols-2">
					<Field label="Producent / manufaktura">
						<Input
							value={manufacturer}
							onChange={(e) => setManufacturer(e.target.value)}
							className="h-10"
						/>
					</Field>
					<Field label="Sygnatura / oznaczenia">
						<Input value={signature} onChange={(e) => setSignature(e.target.value)} className="h-10" />
					</Field>
					<Field label="Wymiary" hint="np. wys. 24 cm, śr. 12 cm">
						<Input value={dimensions} onChange={(e) => setDimensions(e.target.value)} className="h-10" />
					</Field>
					<Field label="Stan ogólny" hint="np. bardzo dobry, ślady używania">
						<Input value={condition} onChange={(e) => setCondition(e.target.value)} className="h-10" />
					</Field>
				</div>
			</Section>

			<Section title="Wady i ubytki">
				<div className="flex flex-col gap-3">
					<p className="text-xs text-muted-foreground">
						Każdą wadę dodaj osobno — to buduje zaufanie i chroni przed reklamacjami.
					</p>
					{defects.map((defect, index) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: rows have no stable id, order is stable
						<div key={index} className="flex flex-col gap-2 rounded-lg border border-border p-3 sm:flex-row">
							<Input
								value={defect.label}
								onChange={(e) => updateDefect(index, { label: e.target.value })}
								placeholder="Nazwa wady, np. Rysa na dnie"
								className="h-10 sm:flex-1"
							/>
							<Input
								value={defect.note}
								onChange={(e) => updateDefect(index, { note: e.target.value })}
								placeholder="Opis / lokalizacja (opcjonalnie)"
								className="h-10 sm:flex-1"
							/>
							<button
								type="button"
								onClick={() => setDefects((prev) => prev.filter((_, i) => i !== index))}
								aria-label="Usuń wadę"
								className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
							>
								<Trash2 className="size-4" aria-hidden />
							</button>
						</div>
					))}
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={() => setDefects((prev) => [...prev, { label: "", note: "" }])}
						className="gap-1.5 self-start"
					>
						<Plus className="size-4" aria-hidden />
						Dodaj wadę
					</Button>
				</div>
			</Section>

			<Section title="Dodatkowe">
				<div className="grid gap-4 sm:grid-cols-2">
					<Field label="Etykiety" hint="Oddziel przecinkami, np. Unikat, Vintage">
						<Input value={badgesText} onChange={(e) => setBadgesText(e.target.value)} className="h-10" />
					</Field>
					<Field label="Popularność (0–100)" hint="Wpływa na kolejność na liście.">
						<Input
							value={popularity}
							onChange={(e) => setPopularity(e.target.value)}
							inputMode="numeric"
							className="h-10"
						/>
					</Field>
					<label className="flex items-center gap-2.5 text-sm">
						<input
							type="checkbox"
							checked={giftBestseller}
							onChange={(e) => setGiftBestseller(e.target.checked)}
							className="size-4 rounded border-input accent-primary"
						/>
						Polecany na prezent
					</label>
				</div>
			</Section>

			{error ? (
				<p role="alert" aria-live="assertive" className="text-sm text-destructive">
					{error}
				</p>
			) : null}

			<div className="sticky bottom-0 flex items-center justify-end gap-3 border-t border-border bg-background/90 py-4 backdrop-blur">
				<Link
					href="/magazyn/produkty"
					className={cn(buttonVariants({ variant: "ghost", size: "lg" }), "h-10")}
				>
					Anuluj
				</Link>
				<Button type="submit" size="lg" disabled={pending || uploading} className="h-10">
					{pending ? "Zapisywanie…" : initial ? "Zapisz zmiany" : "Dodaj produkt"}
				</Button>
			</div>
		</form>
	);
}
