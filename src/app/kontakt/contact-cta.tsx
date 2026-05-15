"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { track } from "@/lib/analytics/posthog";

/**
 * Linki kontaktowe z trackingiem (whatsapp_clicked / phone_clicked).
 * Używane w bocznym panelu na /kontakt — przekazujemy `source: "/kontakt"`.
 */
export function PhoneLink({
	href,
	children,
	className,
}: {
	href: string;
	children: ReactNode;
	className?: string;
}) {
	return (
		<Link
			href={href}
			onClick={() => track({ name: "phone_clicked", properties: { source: "/kontakt" } })}
			className={className}
		>
			{children}
		</Link>
	);
}

export function WhatsAppLink({
	href,
	children,
	className,
}: {
	href: string;
	children: ReactNode;
	className?: string;
}) {
	return (
		<Link
			href={href}
			target="_blank"
			rel="noreferrer"
			onClick={() => track({ name: "whatsapp_clicked", properties: { source: "/kontakt" } })}
			className={className}
		>
			{children}
		</Link>
	);
}

export function MapDirectionsLink({
	href,
	children,
	className,
}: {
	href: string;
	children: ReactNode;
	className?: string;
}) {
	return (
		<Link
			href={href}
			target="_blank"
			rel="noreferrer"
			onClick={() => track({ name: "map_directions_clicked", properties: {} })}
			className={className}
		>
			{children}
		</Link>
	);
}
