import { readAdminCmsSnapshot } from "@/lib/admin/content-store";
import { CMS_PAGES } from "@/lib/content/metadata-keys";
import { DEFAULT_GLOBAL_CONTENT, DEFAULT_SITE_SETTINGS } from "@/lib/content/defaults";
import { PageHeader } from "@/components/panel/chrome";
import { CmsSettingsClient } from "./cms-settings-client";

export const dynamic = "force-dynamic";

export const metadata = {
	title: "CMS",
};

export default async function CmsPage() {
	const snapshot = await readAdminCmsSnapshot();

	return (
		<div className="flex flex-col gap-6">
			<PageHeader
				className="mb-0"
				title="CMS"
				description="Treści i zdjęcia sekcji witryny — per podstrona i globalnie."
			/>
			<CmsSettingsClient
				siteSettings={snapshot.siteSettings ?? DEFAULT_SITE_SETTINGS}
				pageContent={snapshot.pageContentMap}
				globalContent={snapshot.globalContent ?? DEFAULT_GLOBAL_CONTENT}
				pages={CMS_PAGES}
				activeTab="global"
			/>
		</div>
	);
}
