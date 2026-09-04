"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentProps } from "react";

const PRIVACY_PATH = "/polityka-prywatnosci";

type PrivacyPolicyLinkProps = Omit<ComponentProps<typeof Link>, "href"> & {
	href?: string;
};

/** Na /polityka-prywatnosci — przewija do góry zamiast bezruchowej nawigacji na ten sam URL. */
export function PrivacyPolicyLink({
	href = PRIVACY_PATH,
	onClick,
	children = "politykę prywatności",
	...props
}: PrivacyPolicyLinkProps) {
	const pathname = usePathname();
	const onPrivacyPage = pathname === PRIVACY_PATH || pathname.startsWith(`${PRIVACY_PATH}/`);

	return (
		<Link
			href={href}
			onClick={(event) => {
				onClick?.(event);
				if (event.defaultPrevented || !onPrivacyPage) return;
				event.preventDefault();
				const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches
					? "instant"
					: "smooth";
				window.scrollTo({ top: 0, behavior });
			}}
			{...props}
		>
			{children}
		</Link>
	);
}
