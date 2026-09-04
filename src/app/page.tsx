import { Container, Section } from "@/components/primitives";
import { BestsellersSection } from "@/components/sections/bestsellers";
import { CategoriesSection } from "@/components/sections/categories";
import { HeroSection } from "@/components/sections/hero";
import { LiveBanner } from "@/components/sections/live-banner";
import { SocialProofSection } from "@/components/sections/social-proof";
import { env } from "@/env";
import { getPageContent } from "@/lib/content";
import { resolveHomeHeroProductImage } from "@/lib/content/resolve-hero-image";
import { listProducts } from "@/lib/products/queries";
import { getHomeHeroProduct } from "@/lib/sanity/home-hero";

/**
 * Homepage:
 *  1. Hero        — teksty z CMS (live), zdjęcie: static CMS po redeploy > Sanity > domyślne
 *  2. Categories  — 6 kafli, drugi entry point
 *  3. Bestsellers — 4 karty (BOFU)
 *  4. Live banner — warunkowy (LIVE_SCHEDULED=true)
 *  5. SocialProof — formularz kontaktowy (pre-launch) / opinie (po zebraniu)
 */
export default async function HomePage() {
	const products = await listProducts();
	const bestsellers = [...products].sort((a, b) => b.popularity - a.popularity).slice(0, 4);

	const content = await getPageContent("home");
	const hero = content.hero;

	const heroProduct = resolveHomeHeroProductImage(hero, await getHomeHeroProduct());

	const liveScheduled =
		env.NEXT_PUBLIC_LIVE_SCHEDULED &&
		Boolean(env.NEXT_PUBLIC_LIVE_DATE) &&
		Boolean(env.NEXT_PUBLIC_LIVE_DROP_TITLE);

	const liveBadge = liveScheduled
		? {
				dateLabel: formatLiveDateLabel(env.NEXT_PUBLIC_LIVE_DATE ?? ""),
				dropTitle: env.NEXT_PUBLIC_LIVE_DROP_TITLE ?? "Nowa dostawa z Wiednia",
			}
		: null;

	return (
		<main id="main" className="flex flex-col">
			<HeroSection liveBadge={liveBadge} heroProduct={heroProduct} cmsHero={hero} />
			<CategoriesSection />
			<BestsellersSection products={bestsellers} />
			{liveScheduled && env.NEXT_PUBLIC_LIVE_DATE ? (
				<Section spacing="md" tone="paper">
					<Container size="lg">
						<LiveBanner
							dateIso={env.NEXT_PUBLIC_LIVE_DATE}
							dropTitle={env.NEXT_PUBLIC_LIVE_DROP_TITLE ?? "Nowa dostawa z Wiednia"}
							dropCount={env.NEXT_PUBLIC_LIVE_DROP_COUNT ?? 30}
						/>
					</Container>
				</Section>
			) : null}
			<SocialProofSection />
		</main>
	);
}

function formatLiveDateLabel(iso: string): string {
	if (!iso) return "wkrótce";
	const date = new Date(iso);
	if (Number.isNaN(date.getTime())) return "wkrótce";
	return new Intl.DateTimeFormat("pl-PL", {
		weekday: "short",
		day: "numeric",
		month: "short",
		hour: "2-digit",
		minute: "2-digit",
		timeZone: "Europe/Warsaw",
	}).format(date);
}
