"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { SidebarNav } from "./sidebar-nav";
import { SettingsSidebarNav } from "./settings-sidebar-nav";
import { SidebarFooter } from "@/components/panel/sidebar-footer";
import { isSettingsPath } from "./settings-nav-items";

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
