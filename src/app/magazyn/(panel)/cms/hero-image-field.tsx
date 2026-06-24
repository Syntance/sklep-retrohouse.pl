"use client";

import { ImagePlus, Loader2, X } from "lucide-react";
import { useCallback, useId, useState } from "react";
import { resolveCmsAdminPreviewUrl } from "@/lib/content/asset-url";
import { isImageFile, useFileDropZone } from "@/lib/hooks/use-file-drop-zone";
import {
	formatCmsBrowserUploadError,
	prepareCmsImageForUpload,
	uploadCmsImageFromBrowser,
	validateCmsBrowserUploadFile,
} from "@/lib/product-upload/cms-image-upload.client";
import { cn } from "@/lib/utils";

type Props = {
	label: string;
	value: string;
	alt: string;
	onChangeUrl: (url: string) => void;
	onChangeAlt: (alt: string) => void;
	onUploadComplete?: (url: string) => void;
};

export function HeroImageField({
	label,
	value,
	alt,
	onChangeUrl,
	onChangeAlt,
	onUploadComplete,
}: Props) {
	const fileId = useId();
	const [uploading, setUploading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const previewUrl = value ? (resolveCmsAdminPreviewUrl(value) ?? value) : "";

	const uploadFiles = useCallback(
		async (files: File[]) => {
			const images = files.filter(isImageFile);
			if (images.length === 0) {
				setError("Nierozpoznany format pliku. Użyj JPG, PNG lub HEIC.");
				return;
			}

			const file = images[0];
			const validationError = validateCmsBrowserUploadFile(file);
			if (validationError) {
				setError(validationError);
				return;
			}

			setUploading(true);
			setError(null);
			try {
				const prepared = await prepareCmsImageForUpload(file);
				const url = await uploadCmsImageFromBrowser(prepared);
				onChangeUrl(url);
				onUploadComplete?.(url);
			} catch (err) {
				setError(formatCmsBrowserUploadError(err));
			} finally {
				setUploading(false);
			}
		},
		[onChangeUrl, onUploadComplete],
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
				JPG, HEIC, PNG — konwertujemy do WebP. Po wrzuceniu zapisujemy automatycznie; na stronie
				pojawi się po <strong className="font-medium text-foreground">Redeploy</strong>.
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
						{/* eslint-disable-next-line @next/next/no-img-element -- podgląd admina, dowolny CDN R2 */}
						<img src={previewUrl} alt="" className="size-full object-cover" />
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
