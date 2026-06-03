"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { UserIcon } from "@/components/icons";
import { useCustomerSession } from "@/components/customer/customer-session-provider";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const ACCOUNT_LINKS = [
	{ label: "Zamówienia", href: "/konto?tab=zamowienia" },
	{ label: "Reklamacje", href: "/konto?tab=reklamacje" },
	{ label: "Zwroty i odstąpienie", href: "/konto?tab=zwroty" },
] as const;

/** Ten sam rozmiar co Szukaj / Koszyk w headerze. */
const accountIconButtonClass =
	"relative grid size-10 place-items-center rounded-full text-foreground/70 transition-colors hover:bg-cream hover:text-terracotta focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring data-popup-open:bg-cream data-popup-open:text-terracotta";

type Props = {
	className?: string;
	onNavigate?: () => void;
};

export function CustomerMenu({ className, onNavigate }: Props) {
	const pathname = usePathname();
	const router = useRouter();
	const { ready, isLoggedIn, email, logout } = useCustomerSession();

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

	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				className={cn(
					accountIconButtonClass,
					isAccountActive && "text-terracotta",
					className,
				)}
				aria-label={
					email ? `Menu konta — ${email}` : "Menu konta klienta"
				}
			>
				<UserIcon className="size-5" />
				<span
					className="absolute top-1.5 right-1.5 size-2 rounded-full bg-success ring-2 ring-background"
					aria-hidden="true"
				/>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" sideOffset={8} className="min-w-52">
				<DropdownMenuGroup>
					<DropdownMenuLabel className="truncate font-normal text-foreground">
						{email}
					</DropdownMenuLabel>
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				<DropdownMenuGroup>
					{ACCOUNT_LINKS.map((item) => (
						<DropdownMenuItem
							key={item.href}
							onClick={() => {
								onNavigate?.();
								router.push(item.href);
							}}
						>
							{item.label}
						</DropdownMenuItem>
					))}
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				<DropdownMenuGroup>
					<DropdownMenuItem
						onClick={() => {
							logout();
							onNavigate?.();
							if (pathname.startsWith("/konto")) {
								router.push("/konto");
							}
						}}
						variant="destructive"
					>
						Wyloguj się
					</DropdownMenuItem>
				</DropdownMenuGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
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
