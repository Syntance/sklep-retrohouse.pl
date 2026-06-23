import {
	BarChart3,
	Clock,
	FileText,
	LayoutGrid,
	Mail,
	MessageSquare,
	Package,
	RotateCcw,
	Settings,
	ShoppingBag,
	Tags,
	type LucideIcon,
} from "lucide-react";

export type MagazynNavItem = {
	href: string;
	label: string;
	icon: LucideIcon;
	exact?: boolean;
	/** Moduł specyficzny dla RetroHouse (poza baseline Moduly). */
	retrohouse?: boolean;
};

/** Kolejność i etykiety jak w Moduly panel-demo + Epoki (RetroHouse). */
export const MAGAZYN_NAV_ITEMS: MagazynNavItem[] = [
	{ href: "/magazyn", label: "Przegląd", icon: LayoutGrid, exact: true },
	{ href: "/magazyn/statystyki", label: "Statystyki", icon: BarChart3 },
	{ href: "/magazyn/zamowienia", label: "Zamówienia", icon: ShoppingBag },
	{ href: "/magazyn/zwroty", label: "Zwroty i reklamacje", icon: RotateCcw },
	{ href: "/magazyn/produkty", label: "Produkty", icon: Package },
	{ href: "/magazyn/kategorie", label: "Kategorie", icon: Tags },
	{ href: "/magazyn/epoki", label: "Epoki", icon: Clock, retrohouse: true },
	{ href: "/magazyn/cms", label: "CMS", icon: FileText },
	{ href: "/magazyn/maile", label: "E-maile", icon: Mail },
	{ href: "/magazyn/formularze", label: "Formularze", icon: MessageSquare },
	{ href: "/magazyn/ustawienia", label: "Ustawienia sklepu", icon: Settings },
];

export const MAGAZYN_BRANDING = {
	name: "RetroHouse",
	panelTitle: "Magazyn",
	storefrontUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "https://sklep-retrohouse.pl",
} as const;
