"use client";

import { useState } from "react";

type Props = {
	url: string;
};

/** Miniatura w tabeli — zwykły <img>, bez next/image (URL-e Medusa). */
export function ProductListThumbnail({ url }: Props) {
	const [failed, setFailed] = useState(false);

	if (failed) return null;

	return (
		// biome-ignore lint/performance/noImgElement: miniatura w tabeli panelu admina — URL-e Medusa spoza remotePatterns, z fallbackiem onError
		<img
			src={url}
			alt=""
			className="absolute inset-0 size-full object-cover"
			onError={() => setFailed(true)}
		/>
	);
}
