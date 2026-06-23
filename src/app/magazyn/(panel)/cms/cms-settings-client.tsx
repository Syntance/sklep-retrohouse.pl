"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { CMS_BASE_PATH } from "@/lib/content/metadata-keys";
import type { CmsPageConfig } from "@/lib/content/metadata-keys";
import type { GlobalContent, PageContentMap, SiteSettings } from "@/lib/content/types";
import { GlobalContentEditor } from "./global-content-editor";
import { PageContentEditor } from "./page-content-editor";
import { CmsRedeployButton } from "./cms-redeploy-button";

type Props = {
	siteSettings: SiteSettings;
	pageContent: PageContentMap;
	globalContent: GlobalContent;
	pages: CmsPageConfig[];
	activeTab: "global" | string;
};

export function CmsSettingsClient({
	siteSettings,
	pageContent,
	globalContent: _globalContent,
	pages,
	activeTab,
}: Props) {
	const pathname = usePathname();
	const activePage = pages.find((p) => p.id === activeTab);

	return (
		<div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
			<nav
				aria-label="Zakładki CMS"
				className="flex shrink-0 flex-row flex-wrap gap-1 lg:w-52 lg:flex-col"
			>
				<CmsTab href={CMS_BASE_PATH} label="Globalne" active={pathname === CMS_BASE_PATH} />
				{pages.map((page) => (
					<CmsTab
						key={page.id}
						href={`${CMS_BASE_PATH}/${page.id}`}
						label={page.label}
						active={pathname === `${CMS_BASE_PATH}/${page.id}`}
					/>
				))}
			</nav>
			<div className="flex min-w-0 flex-1 flex-col gap-4">
				<CmsRedeployButton />
				{activeTab === "global" ? (
					<GlobalContentEditor siteSettings={siteSettings} />
				) : activePage ? (
					<PageContentEditor
						pageId={activePage.id}
						path={activePage.path}
						blocks={activePage.blocks}
						initial={pageContent[activePage.id] ?? {}}
					/>
				) : null}
			</div>
		</div>
	);
}

function CmsTab({ href, label, active }: { href: string; label: string; active: boolean }) {
	return (
		<Link
			href={href}
			aria-current={active ? "page" : undefined}
			className={cn(
				"rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
				active
					? "bg-primary text-primary-foreground"
					: "text-muted-foreground hover:bg-muted hover:text-foreground",
			)}
		>
			{label}
		</Link>
	);
}
