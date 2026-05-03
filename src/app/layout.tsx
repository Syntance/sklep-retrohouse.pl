import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import "./globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://sklep-retrohouse.pl";

const inter = Inter({
	variable: "--font-inter",
	subsets: ["latin", "latin-ext"],
	display: "swap",
	axes: ["opsz"],
});

const playfair = Playfair_Display({
	variable: "--font-playfair",
	subsets: ["latin", "latin-ext"],
	display: "swap",
	weight: ["400", "500", "600", "700", "800"],
	style: ["normal", "italic"],
});

export const metadata: Metadata = {
	metadataBase: new URL(SITE_URL),
	title: {
		default: "RetroHouse — antyki i vintage z Wiednia · Sklep w Nowym Targu",
		template: "%s · RetroHouse",
	},
	description:
		"Antyki i vintage prosto z wiedeńskich kamienic. Bez pośredników, z gwarancją pochodzenia. Sklep w Nowym Targu + wysyłka w Polsce.",
	applicationName: "RetroHouse",
	authors: [{ name: "RetroHouse" }],
	creator: "RetroHouse",
	publisher: "RetroHouse",
	keywords: [
		"antyki wiedeńskie",
		"vintage Nowy Targ",
		"porcelana vintage",
		"szkło art deco",
		"meble vintage",
		"antyki online Polska",
		"Augarten",
		"Rosenthal",
	],
	robots: {
		index: false,
		follow: false,
	},
	alternates: {
		canonical: "/",
	},
	formatDetection: {
		email: false,
		address: false,
		telephone: false,
	},
	openGraph: {
		type: "website",
		locale: "pl_PL",
		siteName: "RetroHouse",
		title: "RetroHouse — antyki i vintage z Wiednia",
		description: "Ratujemy skarby z wiedeńskich mieszkań. Każdy przedmiot z prawdziwą historią.",
		url: "/",
	},
	twitter: {
		card: "summary_large_image",
		title: "RetroHouse — antyki i vintage z Wiednia",
		description: "Ratujemy skarby z wiedeńskich mieszkań. Każdy przedmiot z prawdziwą historią.",
	},
};

export const viewport: Viewport = {
	width: "device-width",
	initialScale: 1,
	colorScheme: "light dark",
	themeColor: [
		{ media: "(prefers-color-scheme: light)", color: "oklch(0.97 0.012 80)" },
		{ media: "(prefers-color-scheme: dark)", color: "oklch(0.18 0.01 280)" },
	],
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="pl" className={`${inter.variable} ${playfair.variable} h-full antialiased`}>
			<body className="min-h-full flex flex-col bg-background text-foreground">
				<a
					href="#main"
					className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-foreground focus:px-4 focus:py-2 focus:text-background focus:shadow-lg"
				>
					Przejdź do treści
				</a>
				<SiteHeader />
				{children}
				<SiteFooter />
				<SpeedInsights />
				<Analytics />
			</body>
		</html>
	);
}
