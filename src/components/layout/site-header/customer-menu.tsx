"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserIcon } from "@/components/icons";
import { useCustomerSession } from "@/components/customer/customer-session-provider";
import { cn } from "@/lib/utils";
import { ACCOUNT_LINKS, accountIconButtonClass } from "./customer-menu-shared";

/**
 * Dropdown (@base-ui) tylko dla zalogowanych — ładowany dynamicznie.
 * Placeholder w trakcie ładowania = identyczna ikona (stan nieotwarty),
 * więc wizualnie nie ma różnicy; chunk dociąga się w ~1 RTT po hydratacji.
 */
const CustomerMenuDropdown = dynamic(() => import("./customer-menu-dropdown"), {
	ssr: false,
	loading: () => (
		<span className={accountIconButtonClass} aria-hidden="true">
			<UserIcon className="size-5" />
			<span
				className="absolute top-1.5 right-1.5 size-2 rounded-full bg-success ring-2 ring-background"
				aria-hidden="true"
			/>
		</span>
	),
});

type Props = {
	className?: string;
	onNavigate?: () => void;
};

export function CustomerMenu({ className, onNavigate }: Props) {
	const pathname = usePathname();
	const { ready, isLoggedIn } = useCustomerSession();

	const isAccountActive = pathname.startsWith("/konto");

	if (!ready) {
		return (
			<span
				className={cn(accountIconButtonClass, "text-foreground/40", className)}
				aria-hidden="true"
			/>
		);
	}

	if (!isLoggedIn) {
		return (
			<Link
				href="/konto"
				onClick={onNavigate}
				aria-label="Konto klienta — zaloguj się"
				aria-current={isAccountActive ? "page" : undefined}
				className={cn(
					accountIconButtonClass,
					isAccountActive && "text-terracotta",
					className,
				)}
			>
				<UserIcon className="size-5" />
			</Link>
		);
	}

	return <CustomerMenuDropdown className={className} onNavigate={onNavigate} />;
}

export function CustomerMenuMobileLinks({ onNavigate }: { onNavigate?: () => void }) {
	const { isLoggedIn, email, logout } = useCustomerSession();

	return (
		<li className="mt-4 border-t border-walnut/15 pt-4">
			<p className="px-3 pb-2 font-sans text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-terracotta">
				Konto klienta
			</p>
			{isLoggedIn && email ? (
				<p className="px-3 pb-2 text-xs text-foreground/60 truncate">{email}</p>
			) : null}
			<ul className="grid gap-0.5">
				{ACCOUNT_LINKS.map((item) => (
					<li key={item.href}>
						<Link
							href={item.href}
							onClick={onNavigate}
							className="block rounded-md px-3 py-2 text-sm font-medium text-foreground/80 hover:bg-cream hover:text-terracotta"
						>
							{item.label}
						</Link>
					</li>
				))}
				<li>
					{isLoggedIn ? (
						<button
							type="button"
							onClick={() => {
								logout();
								onNavigate?.();
							}}
							className="block w-full rounded-md px-3 py-2 text-left text-sm font-medium text-destructive hover:bg-destructive/10"
						>
							Wyloguj się
						</button>
					) : (
						<Link
							href="/konto"
							onClick={onNavigate}
							className="block rounded-md px-3 py-2 text-sm font-medium text-foreground/80 hover:bg-cream hover:text-terracotta"
						>
							Zaloguj się
						</Link>
					)}
				</li>
			</ul>
		</li>
	);
}
