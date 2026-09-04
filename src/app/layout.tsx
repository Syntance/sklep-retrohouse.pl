import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata, Viewport } from "next";
import { AppToaster } from "@/components/app-toaster";
import { CartAddedCallout } from "@/components/cart-added-callout";
import { CookieConsentBanner } from "@/components/cookie-consent";
import { CustomerSessionProvider } from "@/components/customer/customer-session-provider";
import { HideOnMagazyn } from "@/components/layout/hide-on-magazyn";
import { RawHitsBeacon } from "@/components/analytics/raw-hits-beacon";
import { PopupBannerSlot } from "@/components/layout/popup-banner-slot";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { AnalyticsProvider } from "@/lib/analytics/provider";
import "./globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://sklep-retrohouse.pl";

const allowSearchIndexing = process.env.VERCEL_ENV !== "preview";

export const metadata: Metadata = {
	metadataBase: new URL(SITE_URL),
	title: {
		default: "RetroHouse — antyki i vintage z Wiednia · Sklep w Nowym Targu",
		template: "%s · RetroHouse",
	},
	description:
		"Antyki z prawdziwą historią. Prosto z Wiednia. Bez pośredników, z gwarancją pochodzenia. Sklep w Nowym Targu + wysyłka w Polsce.",
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
	robots: allowSearchIndexing
		? { index: true, follow: true, googleBot: { index: true, follow: true } }
		: { index: false, follow: false, googleBot: { index: false, follow: false } },
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
		description: "Antyki z prawdziwą historią. Prosto z Wiednia.",
		url: "/",
	},
	twitter: {
		card: "summary_large_image",
		title: "RetroHouse — antyki i vintage z Wiednia",
		description: "Antyki z prawdziwą historią. Prosto z Wiednia.",
	},
};

export const viewport: Viewport = {
	width: "device-width",
	initialScale: 1,
	colorScheme: "light dark",
	themeColor: [
		// Brandbook 2026-05-03: white UI dla light, czerń złamana brązem #2D1810 dla dark
		{ media: "(prefers-color-scheme: light)", color: "#FFFFFF" },
		{ media: "(prefers-color-scheme: dark)", color: "#2D1810" },
	],
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="pl" className="h-full antialiased">
			{/* Preload LCP: robi to next/image `priority` na hero danej podstrony — ręczny preload
			    w layoucie ładowałby surowy plik na każdej trasie i dublował zoptymalizowany URL. */}
			<body className="min-h-full flex flex-col bg-background text-foreground">
				<HideOnMagazyn>
					<a
						href="#main"
						className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-terracotta focus:px-4 focus:py-2 focus:text-terracotta-foreground focus:shadow-lg"
					>
						Przejdź do treści
					</a>
				</HideOnMagazyn>
				<AnalyticsProvider>
					<CustomerSessionProvider>
						<SiteHeader />
						{children}
						<HideOnMagazyn>
							<SiteFooter />
						</HideOnMagazyn>
					</CustomerSessionProvider>
				</AnalyticsProvider>
				<AppToaster />
				<HideOnMagazyn>
					<CookieConsentBanner />
				</HideOnMagazyn>
				<HideOnMagazyn>
					<CartAddedCallout />
				</HideOnMagazyn>
				<HideOnMagazyn>
					<PopupBannerSlot />
				</HideOnMagazyn>
				<HideOnMagazyn>
					<RawHitsBeacon />
				</HideOnMagazyn>
				<SpeedInsights />
				<Analytics />
			</body>
		</html>
	);
}
