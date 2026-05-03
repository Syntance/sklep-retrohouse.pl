import Link from "next/link";
import { Fragment } from "react";
import { cn } from "@/lib/utils";

export type Crumb = {
	label: string;
	href?: string;
};

export function Breadcrumbs({ items, className }: { items: Crumb[]; className?: string }) {
	return (
		<nav
			aria-label="Ścieżka okruszków"
			className={cn("flex items-center gap-1.5 text-xs text-foreground/60", className)}
		>
			<ol className="flex flex-wrap items-center gap-1.5">
				{items.map((item, index) => {
					const isLast = index === items.length - 1;
					return (
						<Fragment key={`${item.label}-${item.href ?? "current"}`}>
							<li className="flex items-center gap-1.5">
								{item.href && !isLast ? (
									<Link
										href={item.href}
										className="rounded-sm transition-colors hover:text-terracotta focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
									>
										{item.label}
									</Link>
								) : (
									<span
										aria-current={isLast ? "page" : undefined}
										className={cn("font-medium", isLast ? "text-foreground" : "text-foreground/60")}
									>
										{item.label}
									</span>
								)}
							</li>
							{!isLast ? (
								<span aria-hidden className="text-foreground/30">
									/
								</span>
							) : null}
						</Fragment>
					);
				})}
			</ol>
		</nav>
	);
}
