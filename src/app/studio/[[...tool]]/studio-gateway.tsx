"use client";

import dynamic from "next/dynamic";

const SanityStudioRoot = dynamic(
	() => import("@/components/sanity/studio").then((m) => m.SanityStudioRoot),
	{
		ssr: false,
		loading: () => (
			<div className="flex min-h-[50vh] items-center justify-center p-8 text-sm text-foreground/70">
				Ładowanie Sanity Studio…
			</div>
		),
	},
);

export function StudioClientGateway() {
	return <SanityStudioRoot />;
}
