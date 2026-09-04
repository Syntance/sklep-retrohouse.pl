"use client";

import { useRouter } from "next/navigation";
import type { KeyboardEvent, ReactNode } from "react";

type Props = {
	orderId: string;
	label: string;
	children: ReactNode;
};

export function OrderTableRow({ orderId, label, children }: Props) {
	const router = useRouter();
	const href = `/magazyn/zamowienia/${orderId}`;

	function navigate() {
		router.push(href);
	}

	function onKeyDown(event: KeyboardEvent<HTMLTableRowElement>) {
		if (event.key === "Enter" || event.key === " ") {
			event.preventDefault();
			navigate();
		}
	}

	return (
		// biome-ignore lint/a11y/useSemanticElements: <a> nie może opakować <tr>; klikalny wiersz ma pełną obsługę klawiatury (tabIndex + Enter/Spacja)
		<tr
			role="link"
			tabIndex={0}
			aria-label={label}
			onClick={navigate}
			onKeyDown={onKeyDown}
			className="cursor-pointer bg-card transition-colors hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
		>
			{children}
		</tr>
	);
}
