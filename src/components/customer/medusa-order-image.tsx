"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

type Props = {
	src: string;
	alt: string;
	width: number;
	height: number;
	className?: string;
};

/** Obrazy Medusa/CDN — zwykły img (jak w panelu magazynu), bez next/image. */
export function MedusaOrderImage({ src, alt, width, height, className }: Props) {
	const [failed, setFailed] = useState(false);

	if (failed) {
		return (
			<div
				className={cn(
					"flex shrink-0 items-center justify-center rounded-lg border border-border bg-muted text-xs text-muted-foreground",
					className,
				)}
				style={{ width, height }}
				aria-hidden
			>
				—
			</div>
		);
	}

	return (
		<img
			src={src}
			alt={alt}
			width={width}
			height={height}
			className={cn("shrink-0 rounded-lg object-cover", className)}
			loading="lazy"
			decoding="async"
			onError={() => setFailed(true)}
		/>
	);
}
