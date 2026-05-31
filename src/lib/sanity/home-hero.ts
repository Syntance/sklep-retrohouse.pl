import "server-only";

import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url";
import { env } from "@/env";

import { getSanityReadClient } from "./client";

export type HeroProductImage = {
	src: string;
	alt: string;
	width: number;
	height: number;
};

/** Domyślne hero — gdy Sanity nie ma obrazu lub CMS nie jest podpięty. */
export const DEFAULT_HERO_PRODUCT: HeroProductImage = {
	src: "/images/hero-gallery.jpg",
	alt: "Wnętrze sklepu RetroHouse — galeria antyków, grafiki i dekoracje na ścianie",
	width: 1024,
	height: 768,
};

/**
 * Dokument typu `homePage` w Sanity — pierwszy / najświeższy po `_updatedAt`.
 * Pole obrazu musi zostać referencją (bez „rozwiązywania” assetu w GROQ), żeby działał `@sanity/image-url`.
 */
const HOME_PAGE_HERO_QUERY = `
  *[_type == "homePage"] | order(_updatedAt desc)[0]{
    heroProductImageAlt,
    heroProductImage,
    "dims": heroProductImage.asset->metadata.dimensions
  }
`;

type HomePageHeroDoc = {
	heroProductImageAlt?: string | null;
	heroProductImage?: SanityImageSource | null;
	dims?: { width?: number | null; height?: number | null } | null;
} | null;

export async function getHomeHeroProduct(): Promise<HeroProductImage | null> {
	const client = getSanityReadClient();
	if (!client) return null;

	try {
		const doc = await client.fetch<HomePageHeroDoc>(
			HOME_PAGE_HERO_QUERY,
			{},
			{
				next: { revalidate: 120, tags: ["sanity:homePage"] },
			},
		);

		if (!doc?.heroProductImage || !doc.heroProductImageAlt?.trim()) {
			return null;
		}

		const alt = doc.heroProductImageAlt.trim();
		const intrinsicW = doc.dims?.width ?? 1200;
		const intrinsicH = doc.dims?.height ?? 1500;

		const builder = imageUrlBuilder({
			projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "",
			dataset: env.NEXT_PUBLIC_SANITY_DATASET,
		});

		const maxDisplayWidth = 1600;
		const targetW = Math.min(maxDisplayWidth, Math.max(640, intrinsicW));

		const src = builder
			.image(doc.heroProductImage)
			.width(Math.round(targetW))
			.quality(88)
			// biome-ignore lint/suspicious/noFocusedTests: metoda `.fit()` pakietu @sanity/image-url (nie Vitest).
			.fit("max")
			.auto("format")
			.url();

		const ratio = intrinsicW > 0 ? intrinsicH / intrinsicW : 1.25;
		const height = Math.max(1, Math.round(targetW * ratio));

		return {
			src,
			alt,
			width: Math.round(targetW),
			height,
		};
	} catch {
		return null;
	}
}
