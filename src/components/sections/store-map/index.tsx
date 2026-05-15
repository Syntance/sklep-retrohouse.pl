"use client";

import Link from "next/link";
import { ArrowRightIcon } from "@/components/icons";
import { CtaLink } from "@/components/primitives";
import { track } from "@/lib/analytics/posthog";

type StoreMapProps = {
	mapsHref: string;
	googleMapsEmbedSrc: string;
	streetAddress: string;
	postalCode: string;
	city: string;
};

/**
 * Lazy iframe Google Maps + 2 CTA z instrumentacją:
 *  - "Odwiedź nas" → visit_store_cta_clicked (source: '/o-nas')
 *  - "Pokaż dojazd" → map_directions_clicked
 *
 * iframe ma loading="lazy" + referrerPolicy="no-referrer-when-downgrade"
 * (ADR-0009). Brak Mapboxa ⇒ zero deps i tokenów.
 */
export function StoreMap({
	mapsHref,
	googleMapsEmbedSrc,
	streetAddress,
	postalCode,
	city,
}: StoreMapProps) {
	return (
		<div className="grid gap-6 lg:grid-cols-[1.05fr_1fr] lg:items-stretch">
			<div className="flex flex-col gap-5 self-center">
				<p className="text-foreground/80 md:text-lg">
					Stoły, regały, witryny i karty historii w wersji papierowej. W&nbsp;Nowym Targu możesz
					dotknąć każdego przedmiotu — i&nbsp;posłuchać, jak trafił do nas z&nbsp;Wiednia.
				</p>
				<address className="not-italic text-sm leading-relaxed text-foreground/75">
					<p className="font-display text-lg text-foreground">RetroHouse</p>
					<p>{streetAddress}</p>
					<p>
						{postalCode} {city}
					</p>
				</address>

				<div className="flex flex-wrap items-center gap-3">
					<CtaLink
						href="/kontakt"
						variant="primary"
						onClick={() =>
							track({
								name: "visit_store_cta_clicked",
								properties: { source: "/o-nas" },
							})
						}
					>
						Odwiedź nas
					</CtaLink>
					<Link
						href={mapsHref}
						target="_blank"
						rel="noreferrer"
						onClick={() => track({ name: "map_directions_clicked", properties: {} })}
						className="inline-flex items-center gap-1.5 cta-text text-xs text-foreground/70 hover:text-terracotta"
					>
						Pokaż dojazd
						<ArrowRightIcon className="size-4" />
					</Link>
				</div>
			</div>

			<div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-walnut/15 bg-card shadow-card">
				<iframe
					src={googleMapsEmbedSrc}
					title={`Mapa lokalizacji sklepu RetroHouse, ${streetAddress}, ${city}`}
					loading="lazy"
					referrerPolicy="no-referrer-when-downgrade"
					className="absolute inset-0 size-full"
				/>
			</div>
		</div>
	);
}
