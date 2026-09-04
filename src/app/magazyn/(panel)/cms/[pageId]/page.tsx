import { notFound } from "next/navigation";
import { PageHeader } from "@/components/panel/chrome";
import { readAdminCmsSnapshot } from "@/lib/admin/content-store";
import { DEFAULT_GLOBAL_CONTENT, DEFAULT_SITE_SETTINGS } from "@/lib/content/defaults";
import { CMS_PAGES } from "@/lib/content/metadata-keys";
import type { ContentPageId } from "@/lib/content/types";
import { CmsSettingsClient } from "../cms-settings-client";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ pageId: string }> };

export async function generateMetadata({ params }: Props) {
	const { pageId } = await params;
	const page = CMS_PAGES.find((p) => p.id === pageId);
	return { title: page ? `CMS — ${page.label}` : "CMS" };
}

export default async function CmsPageEditorPage({ params }: Props) {
	const { pageId } = await params;
	const page = CMS_PAGES.find((p) => p.id === pageId);
	if (!page) notFound();

	const snapshot = await readAdminCmsSnapshot();

	return (
		<div className="flex flex-col gap-6">
			<PageHeader className="mb-0" title={`CMS — ${page.label}`} description={page.path} />
			<CmsSettingsClient
				siteSettings={snapshot.siteSettings ?? DEFAULT_SITE_SETTINGS}
				pageContent={snapshot.pageContentMap}
				globalContent={snapshot.globalContent ?? DEFAULT_GLOBAL_CONTENT}
				pages={CMS_PAGES}
				activeTab={pageId as ContentPageId}
			/>
		</div>
	);
}
