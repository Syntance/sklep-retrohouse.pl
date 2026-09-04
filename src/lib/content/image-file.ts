const IMAGE_EXT = /\.(jpe?g|png|webp|gif|heic|heif|avif|tiff?)$/i;

/** Rozpoznaje zdjęcia po MIME (Safari/iPhone) lub rozszerzeniu (HEIC bez type). */
export function isImageFile(file: File): boolean {
	return file.type.startsWith("image/") || IMAGE_EXT.test(file.name);
}

function isSvgFile(file: File): boolean {
	return file.type === "image/svg+xml" || file.name.toLowerCase().endsWith(".svg");
}

export function isCmsUploadImage(file: File): boolean {
	return isImageFile(file) && !isSvgFile(file);
}
