"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MAGAZYN_NAV_ITEMS } from "@/components/panel/nav-config";
import { cn } from "@/lib/utils";

export function SidebarNav() {
	const pathname = usePathname();

	return (
		<nav aria-label="Nawigacja magazynu" className="flex flex-col gap-1">
			{MAGAZYN_NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
				const active = exact ? pathname === href : pathname.startsWith(href);
				return (
					<Link
						key={href}
						href={href}
						aria-current={active ? "page" : undefined}
						className={cn(
							"flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
							active
								? "bg-primary text-primary-foreground"
								: "text-muted-foreground hover:bg-muted hover:text-foreground",
						)}
					>
						<Icon className="size-4 shrink-0" aria-hidden />
						{label}
					</Link>
				);
			})}
		</nav>
	);
}
