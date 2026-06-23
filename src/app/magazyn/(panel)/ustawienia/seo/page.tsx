import { getSeoSettingsBundle } from "@/lib/admin/seo-store";
import { loadAdmin } from "@/lib/admin/load";
import { CMS_PAGES } from "@/lib/content/metadata-keys";
import { PageHeader } from "@/components/panel/chrome";
import { SeoSettingsClient } from "./seo-settings-client";

export const dynamic = "force-dynamic";

export const metadata = { title: "Ustawienia sklepu — SEO" };

export default async function SeoSettingsPage() {
	const bundle = await loadAdmin(getSeoSettingsBundle);

	return (
		<div className="flex flex-col gap-6">
			<PageHeader
				className="mb-0"
				title="SEO"
				description="Meta tagi globalne i dla poszczególnych podstron sklepu."
			/>

			<SeoSettingsClient
				siteSettings={bundle.siteSettings}
				pageSeo={bundle.pageSeo}
				pages={CMS_PAGES}
				activeTab="global"
			/>
		</div>
	);
}
