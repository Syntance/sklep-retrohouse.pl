"use client";

import Link from "next/link";
import { GiftIcon, HeartIcon, PackageIcon, ScrollIcon } from "@/components/icons";
import { track } from "@/lib/analytics/posthog";

const THEMES: Array<{ id: string; label: string; description: string; icon: React.ReactNode; href: string }> = [
	{
		id: "rocznica",
		label: "Rocznica",
		description: "Coś, co przetrwa kolejne lata — i będzie miało historię.",
		icon: <HeartIcon className="size-5" />,
		href: "/sklep?kategoria=porcelana",
	},
	{
		id: "parapetowka",
		label: "Parapetówka",
		description: "Lampka, lustro lub ramka — wnosisz duszę, nie kolejny gadżet.",
		icon: <ScrollIcon className="size-5" />,
		href: "/sklep?kategoria=dekoracje",
	},
	{
		id: "pasja",
		label: "Pasja / kolekcjoner",
		description: "Sygnowane przedmioty z udokumentowaną historią.",
		icon: <PackageIcon className="size-5" />,
		href: "/sklep?kategoria=obrazy",
	},
	{
		id: "drobiazg",
		label: "Drobiazg z duszą",
		description: "Do 200 zł — kameralny prezent z bibułką i kartą historii.",
		icon: <GiftIcon className="size-5" />,
		href: "/sklep?cena=do-100",
	},
];

/**
 * Cztery tematy prezentowe — każde kliknięcie loguje gift_theme_selected.
 * Sekcja zaplanowana na rozszerzenie po danych: gdy będzie filtr po
 * okazji, podmienimy linki.
 */
export function GiftThemes() {
	return (
		<ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
			{THEMES.map((theme) => (
				<li key={theme.id}>
					<Link
						href={theme.href}
						onClick={() =>
							track({
								name: "gift_theme_selected",
								properties: { theme: theme.id },
							})
						}
						className="group/theme flex h-full flex-col gap-3 rounded-2xl border border-walnut/15 bg-card p-6 transition-all hover:-translate-y-1 hover:border-walnut/30 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-terracotta"
					>
						<span className="grid size-10 place-items-center rounded-full bg-terracotta/15 text-terracotta">
							{theme.icon}
						</span>
						<p className="font-display text-xl font-medium leading-snug">{theme.label}</p>
						<p className="text-sm text-foreground/65">{theme.description}</p>
					</Link>
				</li>
			))}
		</ul>
	);
}
