import { PageHeader } from "@/components/panel/chrome";
import { readAdminCmsSnapshot } from "@/lib/admin/content-store";
import { DEFAULT_SITE_SETTINGS } from "@/lib/content/defaults";
import { CmsSubnav } from "../cms-subnav";
import { EMPTY_POPUP_BANNER, PopupBannerEditor } from "./popup-banner-editor";

export const dynamic = "force-dynamic";

export const metadata = { title: "CMS — Banery popup" };

export default async function PopupBannersPage() {
	const snapshot = await readAdminCmsSnapshot();
	const settings = snapshot.siteSettings ?? DEFAULT_SITE_SETTINGS;

	return (
		<div className="flex flex-col gap-6">
			<PageHeader
				className="mb-0"
				title="Banery popup"
				description="Jedno okno nad treścią sklepu — ogłoszenie, nowa dostawa, informacja o wysyłce."
			/>
			<CmsSubnav />
			<PopupBannerEditor
				initial={settings.popupBanner ?? EMPTY_POPUP_BANNER}
				rest={{
					announcementBar: settings.announcementBar,
					footerText: settings.footerText,
					socialLinks: settings.socialLinks,
				}}
			/>
		</div>
	);
}
