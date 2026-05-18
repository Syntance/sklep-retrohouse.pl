import { BestsellersSection } from "@/components/sections/bestsellers";
import { CategoriesSection } from "@/components/sections/categories";
import { HeroSection } from "@/components/sections/hero";
import { LiveBanner } from "@/components/sections/live-banner";
import { SocialProofSection } from "@/components/sections/social-proof";
import { StorySection } from "@/components/sections/story";
import { Container, Section } from "@/components/primitives";
import { env } from "@/env";
import { getHomeHeroProduct } from "@/lib/sanity/home-hero";
import { PRODUCTS } from "@/lib/mock/products";

/**
 * Homepage — 7 sekcji wg strategii Notion (RetroHouse 2026):
 *  1. Hero        — headline + obraz produktu z Sanity (`homePage`) lub panel pochodzenia
 *  2. Categories  — 6 kafli, drugi entry point
 *  3. Bestsellers — 4 karty (BOFU)
 *  4. Live banner — warunkowy (LIVE_SCHEDULED=true)
 *  5. Story       — pochodzenie (typografia + oś procesu), scroll_depth → story_section_scrolled
 *  6. SocialProof — 3 opinie
 *  7. SocialProof — formularz kontaktowy (pre-launch) / opinie (po zebraniu)
 */
export default async function HomePage() {
	const bestsellers = [...PRODUCTS].sort((a, b) => b.popularity - a.popularity).slice(0, 4);

	const heroProduct = await getHomeHeroProduct();

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
			<HeroSection liveBadge={liveBadge} heroProduct={heroProduct} />
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
			<StorySection />
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
