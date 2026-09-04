"use client";

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
import { ACCOUNT_LINKS, accountIconButtonClass } from "./customer-menu-shared";

type Props = {
	className?: string;
	onNavigate?: () => void;
};

/**
 * Dropdown konta ZALOGOWANEGO użytkownika — wydzielony z customer-menu.tsx
 * i ładowany dynamicznie: @base-ui DropdownMenu nie wchodzi do initial JS
 * dla 99% odwiedzających (niezalogowani widzą zwykły Link).
 */
export default function CustomerMenuDropdown({ className, onNavigate }: Props) {
	const pathname = usePathname();
	const router = useRouter();
	const { email, logout } = useCustomerSession();

	const isAccountActive = pathname.startsWith("/konto");

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
