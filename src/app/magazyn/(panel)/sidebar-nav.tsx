"use client";

import { Clock, FileText, LayoutGrid, Mail, Package, PackageX, ShoppingBag, Tags } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const LINKS = [
	{ href: "/magazyn", label: "Przegląd", icon: LayoutGrid, exact: true },
	{ href: "/magazyn/zamowienia", label: "Zamówienia", icon: ShoppingBag, exact: false },
	{ href: "/magazyn/produkty", label: "Produkty", icon: Package, exact: false },
	{ href: "/magazyn/kategorie", label: "Kategorie", icon: Tags, exact: false },
	{ href: "/magazyn/epoki", label: "Epoki", icon: Clock, exact: false },
	{ href: "/magazyn/zwroty", label: "Zwroty / reklam.", icon: PackageX, exact: false },
	{ href: "/magazyn/formularze", label: "Formularze", icon: FileText, exact: false },
	{ href: "/magazyn/maile", label: "E-maile", icon: Mail, exact: false },
];

export function SidebarNav() {
	const pathname = usePathname();

	return (
		<nav aria-label="Nawigacja magazynu" className="flex flex-col gap-1">
			{LINKS.map(({ href, label, icon: Icon, exact }) => {
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
						<Icon className="size-4" aria-hidden />
						{label}
					</Link>
				);
			})}
		</nav>
	);
}
