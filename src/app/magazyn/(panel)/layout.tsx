import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { MAGAZYN_BRANDING } from "@/components/panel/nav-config";
import { requireAdminSession } from "@/lib/admin/require-session";
import { getSessionToken } from "@/lib/admin/session";
import { PanelSidebarNav } from "./panel-sidebar-nav";

export default async function PanelLayout({ children }: { children: ReactNode }) {
	const token = await getSessionToken();
	if (!token) redirect("/magazyn/login");

	// Samo istnienie cookie NIC nie dowodzi: jego wartością jest surowy JWT
	// Medusy, a `/auth/user/emailpass` w backendzie jest publiczny — każdy, kto
	// ma konto admina w Medusie, może wystawić sobie token i wkleić go jako
	// cookie, omijając allowlistę sprawdzaną tylko przy logowaniu. Dlatego przy
	// każdym wejściu weryfikujemy tożsamość i allowlistę po stronie serwera.
	try {
		await requireAdminSession();
	} catch {
		redirect("/magazyn/auth/logout");
	}

	return (
		<div
			data-magazyn-panel
			className="fixed inset-0 w-full overflow-y-auto bg-background text-foreground"
		>
			<div className="mx-auto flex min-h-full w-full max-w-7xl flex-col lg:flex-row">
				<aside className="flex shrink-0 flex-col gap-6 border-b border-border p-5 lg:sticky lg:top-0 lg:h-screen lg:min-h-0 lg:w-60 lg:border-r lg:border-b-0">
					<Link href="/magazyn" className="block shrink-0">
						<p className="text-[0.65rem] font-medium tracking-[0.25em] text-muted-foreground uppercase">
							{MAGAZYN_BRANDING.name}
						</p>
						<p className="font-serif text-lg text-foreground">{MAGAZYN_BRANDING.panelTitle}</p>
					</Link>

					<PanelSidebarNav className="min-h-0 flex-1" />
				</aside>

				<main className="min-w-0 flex-1 p-5 lg:p-8">{children}</main>
			</div>
		</div>
	);
}
