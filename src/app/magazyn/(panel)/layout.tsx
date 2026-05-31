import { LogOut } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/lib/admin/auth-actions";
import { getSessionToken } from "@/lib/admin/session";
import { SidebarNav } from "./sidebar-nav";

export default async function PanelLayout({ children }: { children: ReactNode }) {
	const token = await getSessionToken();
	if (!token) redirect("/magazyn/login");

	return (
		<div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col lg:flex-row">
			<aside className="flex shrink-0 flex-col gap-6 border-b border-border p-5 lg:w-60 lg:border-r lg:border-b-0">
				<div className="flex items-center justify-between lg:block">
					<Link href="/magazyn" className="block">
						<p className="text-[0.65rem] font-medium tracking-[0.25em] text-muted-foreground uppercase">
							RetroHouse
						</p>
						<p className="font-serif text-lg text-foreground">Magazyn</p>
					</Link>
				</div>

				<SidebarNav />

				<div className="mt-auto flex flex-col gap-2 border-t border-border pt-4">
					<Link
						href="/"
						className="px-3 text-xs text-muted-foreground transition-colors hover:text-foreground"
					>
						↗ Otwórz sklep
					</Link>
					<form action={logoutAction}>
						<Button type="submit" variant="ghost" size="sm" className="w-full justify-start gap-2">
							<LogOut className="size-4" aria-hidden />
							Wyloguj
						</Button>
					</form>
				</div>
			</aside>

			<main className="min-w-0 flex-1 p-5 lg:p-8">{children}</main>
		</div>
	);
}
