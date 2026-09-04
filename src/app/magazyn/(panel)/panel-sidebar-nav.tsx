"use client";

import { usePathname } from "next/navigation";
import { SidebarFooter } from "@/components/panel/sidebar-footer";
import { cn } from "@/lib/utils";
import { isSettingsPath } from "./settings-nav-items";
import { SettingsSidebarNav } from "./settings-sidebar-nav";
import { SidebarNav } from "./sidebar-nav";

export function PanelSidebarNav({ className }: { className?: string }) {
	const pathname = usePathname();

	return (
		<div className={cn("flex min-h-0 flex-1 flex-col", className)}>
			<div className="min-h-0 flex-1">
				{isSettingsPath(pathname) ? <SettingsSidebarNav /> : <SidebarNav />}
			</div>
			<SidebarFooter className="mt-auto shrink-0" />
		</div>
	);
}
