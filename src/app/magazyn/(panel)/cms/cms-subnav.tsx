"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
	{ href: "/magazyn/cms", label: "Treści" },
	{ href: "/magazyn/cms/banery-popup", label: "Banery popup" },
] as const;

export function CmsSubnav() {
	const pathname = usePathname();

	return (
		<nav className="flex max-w-md gap-1 border-b border-border" aria-label="Sekcje CMS">
			{TABS.map((tab) => {
				const active =
					tab.href === "/magazyn/cms" ? pathname === "/magazyn/cms" : pathname.startsWith(tab.href);
				return (
					<Link
						key={tab.href}
						href={tab.href}
						aria-current={active ? "page" : undefined}
						className={cn(
							"border-b-2 px-3 py-2 text-sm font-medium transition-colors",
							active
								? "border-primary text-foreground"
								: "border-transparent text-muted-foreground hover:text-foreground",
						)}
					>
						{tab.label}
					</Link>
				);
			})}
		</nav>
	);
}
