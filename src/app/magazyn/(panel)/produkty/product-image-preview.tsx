"use client";

import { ImageOff } from "lucide-react";
import { useState } from "react";

type Props = {
	url: string;
	isPrimary?: boolean;
};

/** Podgląd zdjęcia w panelu — zwykły <img>, bez next/image (prostsze dla URL-i Medusa). */
export function ProductImagePreview({ url, isPrimary }: Props) {
	const [failed, setFailed] = useState(false);

	if (failed) {
		return (
			<>
				<div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-muted p-2 text-center">
					<ImageOff className="size-5 text-muted-foreground" aria-hidden />
					<span className="text-[0.62rem] leading-snug text-muted-foreground">
						Plik niedostępny
						<br />
						<span className="text-[0.58rem]">usuń i dodaj ponownie</span>
					</span>
				</div>
				{isPrimary ? (
					<span className="absolute left-1.5 top-1.5 rounded bg-primary/90 px-1.5 py-0.5 text-[0.6rem] font-medium text-primary-foreground">
						Główne
					</span>
				) : null}
			</>
		);
	}

	return (
		<>
			{/* biome-ignore lint/performance/noImgElement: podgląd w panelu admina — URL-e Medusa spoza remotePatterns, z fallbackiem onError */}
			<img
				src={url}
				alt=""
				className="absolute inset-0 size-full object-cover"
				onError={() => setFailed(true)}
			/>
			{isPrimary ? (
				<span className="absolute left-1.5 top-1.5 rounded bg-primary/90 px-1.5 py-0.5 text-[0.6rem] font-medium text-primary-foreground">
					Główne
				</span>
			) : null}
		</>
	);
}
