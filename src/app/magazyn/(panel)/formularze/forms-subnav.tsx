"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function FormsSubnav() {
	const pathname = usePathname();
	const onSent = pathname.includes("/formularze/wyslane");

	return (
		<nav
			className="flex max-w-md gap-1 border-b border-border"
			aria-label="Sekcje formularzy"
		>
			<Link
				href="/magazyn/formularze"
				className={cn(
					"border-b-2 px-3 py-2 text-sm font-medium transition-colors",
					!onSent
						? "border-primary text-foreground"
						: "border-transparent text-muted-foreground hover:text-foreground",
				)}
			>
				Konfiguracja
			</Link>
			<Link
				href="/magazyn/formularze/wyslane"
				className={cn(
					"border-b-2 px-3 py-2 text-sm font-medium transition-colors",
					onSent
						? "border-primary text-foreground"
						: "border-transparent text-muted-foreground hover:text-foreground",
				)}
			>
				Wysłane
			</Link>
		</nav>
	);
}
