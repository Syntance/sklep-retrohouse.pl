import Link from "next/link";
import { InstagramIcon } from "@/components/icons";
import { getSiteSettings } from "@/lib/content";

/**
 * Placeholder grid 6 IG postów. Etap 2: podmiana na komponent
 * client-side `<InstagramFeed>` z fetchem przez Vercel ISR (cache 6h)
 * — wymaga IG Basic Display API + token w env.
 */
const IG_TILES: Array<{ id: string; hue: string; alt: string }> = [
	{ id: "ig-1", hue: "oklch(0.74 0.10 80)", alt: "Filiżanka Augarten na wiedeńskim oknie" },
	{ id: "ig-2", hue: "oklch(0.55 0.08 50)", alt: "Karafka rzeźbiona w warsztacie" },
	{ id: "ig-3", hue: "oklch(0.78 0.06 60)", alt: "Lampka mosiężna w salonie klientki" },
	{ id: "ig-4", hue: "oklch(0.91 0.014 70)", alt: "Serwis kawowy Augarten" },
	{ id: "ig-5", hue: "oklch(0.52 0.15 38)", alt: "Krzesło Thonet w kawiarni" },
	{ id: "ig-6", hue: "oklch(0.84 0.04 90)", alt: "Wazon Rosenthal w pełnym świetle" },
];

export async function InstagramGrid() {
	const { socialLinks } = await getSiteSettings();
	const instagramHref = socialLinks?.instagram;

	if (!instagramHref) return null;

	return (
		<div>
			<div className="flex items-center justify-between gap-3">
				<p className="font-display text-lg">Instagram</p>
				<Link
					href={instagramHref}
					target="_blank"
					rel="noreferrer"
					className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-foreground/70 hover:text-terracotta"
				>
					<InstagramIcon className="size-3.5" />
					{instagramHref}
				</Link>
			</div>
			<ul className="mt-3 grid grid-cols-3 gap-1.5">
				{IG_TILES.map((tile) => (
					<li key={tile.id}>
						<Link
							href={instagramHref}
							target="_blank"
							rel="noreferrer"
							aria-label={tile.alt}
							className="block aspect-square overflow-hidden rounded-md border border-border transition-transform hover:-translate-y-0.5"
						>
							<div
								aria-hidden
								className="size-full"
								style={{
									backgroundImage: `radial-gradient(60% 60% at 30% 20%, ${tile.hue}, transparent 60%), linear-gradient(160deg, oklch(0.55 0.08 60), oklch(0.27 0.005 280))`,
								}}
							/>
						</Link>
					</li>
				))}
			</ul>
		</div>
	);
}
