import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
	title: "Magazyn — RetroHouse",
	robots: { index: false, follow: false },
};

export default function MagazynLayout({ children }: { children: ReactNode }) {
	return <div className="min-h-screen bg-background text-foreground antialiased">{children}</div>;
}
