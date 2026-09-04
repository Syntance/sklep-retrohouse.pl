import {
	Bell,
	CreditCard,
	Key,
	type LucideIcon,
	Paintbrush,
	Search,
	Settings,
	Shield,
	Truck,
} from "lucide-react";
import { SETTINGS_BASE_PATH } from "@/lib/content/metadata-keys";

export type SettingsNavItem = {
	href: string;
	label: string;
	icon: LucideIcon;
};

export function buildSettingsNavItems(): SettingsNavItem[] {
	return [
		{ href: `${SETTINGS_BASE_PATH}/ogolne`, label: "Ogólne", icon: Settings },
		{ href: `${SETTINGS_BASE_PATH}/platnosci`, label: "Płatności", icon: CreditCard },
		{ href: `${SETTINGS_BASE_PATH}/dostawa`, label: "Dostawa", icon: Truck },
		{ href: `${SETTINGS_BASE_PATH}/powiadomienia`, label: "Powiadomienia", icon: Bell },
		{ href: `${SETTINGS_BASE_PATH}/bezpieczenstwo`, label: "Bezpieczeństwo", icon: Shield },
		{ href: `${SETTINGS_BASE_PATH}/api`, label: "API & Webhooks", icon: Key },
		{ href: `${SETTINGS_BASE_PATH}/motywy`, label: "Motywy magazynu", icon: Paintbrush },
		{ href: `${SETTINGS_BASE_PATH}/seo`, label: "SEO", icon: Search },
	];
}

export function isSettingsPath(pathname: string): boolean {
	return pathname.startsWith(SETTINGS_BASE_PATH);
}
