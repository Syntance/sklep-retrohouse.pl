import { notFound } from "next/navigation";
import { getSeoSettingsBundle } from "@/lib/admin/seo-store";
import { loadAdmin } from "@/lib/admin/load";
import { CMS_PAGES } from "@/lib/content/metadata-keys";
import type { ContentPageId } from "@/lib/content/types";
import { PageHeader } from "@/components/panel/chrome";
import { SeoSettingsClient } from "../seo-settings-client";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ pageId: string }> };

export async function generateMetadata({ params }: Props) {
	const { pageId } = await params;
	const page = CMS_PAGES.find((p) => p.id === pageId);
	return { title: page ? `SEO — ${page.label}` : "SEO" };
}

export default async function SeoPageSettingsPage({ params }: Props) {
	const { pageId } = await params;
	const page = CMS_PAGES.find((p) => p.id === pageId);
	if (!page) notFound();

	const bundle = await loadAdmin(getSeoSettingsBundle);

	return (
		<div className="flex flex-col gap-6">
			<PageHeader className="mb-0" title={`SEO — ${page.label}`} description={page.path} />

			<SeoSettingsClient
				siteSettings={bundle.siteSettings}
				pageSeo={bundle.pageSeo}
				pages={CMS_PAGES}
				activeTab={pageId as ContentPageId}
			/>
		</div>
	);
}
