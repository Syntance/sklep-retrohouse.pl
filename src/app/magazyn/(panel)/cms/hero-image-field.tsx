"use client";

import { ImagePlus, Loader2, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useId, useState } from "react";
import { resolveMedusaMediaUrl } from "@/lib/medusa/media-url";
import { isImageFile, useFileDropZone } from "@/lib/hooks/use-file-drop-zone";
import { cn } from "@/lib/utils";
import { uploadCmsImagesAction } from "./content-actions";

type Props = {
	label: string;
	value: string;
	alt: string;
	onChangeUrl: (url: string) => void;
	onChangeAlt: (alt: string) => void;
};

function resolveAdminPreviewUrl(url: string): string {
	if (!url.trim()) return "";
	if (url.startsWith("/")) return url;
	return resolveMedusaMediaUrl(url) ?? url;
}

export function HeroImageField({ label, value, alt, onChangeUrl, onChangeAlt }: Props) {
	const fileId = useId();
	const [uploading, setUploading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const previewUrl = value ? resolveAdminPreviewUrl(value) : "";

	const uploadFiles = useCallback(
		async (files: File[]) => {
			const images = files.filter(isImageFile);
			if (images.length === 0) {
				setError("Nierozpoznany format pliku. Użyj JPG, PNG lub HEIC.");
				return;
			}

			setUploading(true);
			setError(null);
			try {
				const formData = new FormData();
				formData.append("files", images[0]);
				const result = await uploadCmsImagesAction(formData);
				if (result.error) {
					setError(result.error);
					return;
				}
				const url = result.urls[0];
				if (url) onChangeUrl(url);
			} catch (err) {
				const message = err instanceof Error ? err.message : null;
				setError(message?.trim() || "Upload nie powiódł się. Spróbuj ponownie.");
			} finally {
				setUploading(false);
			}
		},
		[onChangeUrl],
	);

	const { isDragging, dropZoneProps } = useFileDropZone({
		disabled: uploading,
		accept: isImageFile,
		onDropFiles: (files) => {
			void uploadFiles(files);
		},
	});

	return (
		<div className="flex flex-col gap-2">
			<span className="text-sm font-medium">{label}</span>
			<p className="text-xs text-muted-foreground">
				Akceptujemy zdjęcia z telefonu (JPG, HEIC, PNG) — konwertujemy do WebP przed wysłaniem. Po zapisie
				widać podgląd w panelu; na stronie
				pojawią się po <strong className="font-medium text-foreground">Redeploy</strong> (sync do{" "}
				<code className="text-[0.7rem]">/images/cms/</code>).
			</p>
			<div
				{...dropZoneProps}
				className={cn(
					"flex flex-wrap items-start gap-3 rounded-lg border border-dashed border-border p-3 transition-colors",
					isDragging && "border-primary bg-primary/5 ring-2 ring-primary ring-offset-2",
				)}
			>
				{previewUrl ? (
					<div className="relative h-32 w-48 overflow-hidden rounded-lg border border-border bg-muted">
						<Image
							src={previewUrl}
							alt=""
							fill
							sizes="192px"
							className="object-cover"
							unoptimized
						/>
						<button
							type="button"
							aria-label="Usuń obraz"
							onClick={() => {
								onChangeUrl("");
							}}
							className="absolute right-1 top-1 grid size-6 place-items-center rounded-md bg-background/80 text-muted-foreground hover:text-destructive"
						>
							<X className="size-3.5" aria-hidden />
						</button>
					</div>
				) : null}
				<label
					htmlFor={fileId}
					className={cn(
						"grid h-32 min-w-[10rem] flex-1 cursor-pointer place-items-center rounded-lg border border-dashed border-border px-4 text-sm text-muted-foreground transition-colors hover:bg-muted",
						isDragging && "border-primary bg-primary/5",
						uploading && "pointer-events-none opacity-60",
					)}
				>
					{uploading ? (
						<Loader2 className="size-5 animate-spin" aria-hidden />
					) : (
						<span className="flex flex-col items-center gap-1.5 text-center">
							<ImagePlus className="size-5" aria-hidden />
							Przeciągnij lub wybierz plik
						</span>
					)}
				</label>
				<input
					id={fileId}
					type="file"
					accept="image/*"
					className="sr-only"
					disabled={uploading}
					onChange={(e) => {
						const file = e.target.files?.[0];
						if (file) void uploadFiles([file]);
						e.target.value = "";
					}}
				/>
			</div>
			<label className="flex flex-col gap-1.5">
				<span className="text-xs font-medium text-muted-foreground">Tekst alternatywny (alt)</span>
				<input
					type="text"
					value={alt}
					onChange={(e) => {
						onChangeAlt(e.target.value);
					}}
					placeholder="Opis zdjęcia dla SEO i czytników ekranu"
					className="h-10 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
				/>
			</label>
			{error ? (
				<p role="alert" className="text-xs text-destructive">
					{error}
				</p>
			) : null}
		</div>
	);
}
