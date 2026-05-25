"use client";

import type { ReactNode } from "react";
import { ctaSecondaryButtonClassName } from "@/components/primitives/cta-link";
import { cn } from "@/lib/utils";

type SmoothScrollAnchorProps = {
	href: string;
	children: ReactNode;
	className?: string;
};

export function SmoothScrollAnchor({ href, children, className }: SmoothScrollAnchorProps) {
	const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
		if (!href.startsWith("#")) return;

		const targetId = href.slice(1);
		const target = document.getElementById(targetId);
		if (!target) return;

		event.preventDefault();

		const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

		requestAnimationFrame(() => {
			target.scrollIntoView({
				behavior: prefersReduced ? "auto" : "smooth",
				block: "start",
			});
		});

		window.history.pushState(null, "", href);
	};

	return (
		<a href={href} onClick={handleClick} className={cn(ctaSecondaryButtonClassName, className)}>
			<span className="flex items-center gap-2">{children}</span>
		</a>
	);
}
