"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/** Ukrywa elementy storefrontu (stopka, koszyk, cookies) w panelu magazynu. */
export function HideOnMagazyn({ children }: { children: ReactNode }) {
	const pathname = usePathname();
	if (pathname.startsWith("/magazyn")) return null;
	return children;
}
