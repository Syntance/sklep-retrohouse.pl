import { ExternalLink, LogOut } from "lucide-react";
import Link from "next/link";
import { logoutAction } from "@/lib/admin/auth-actions";

const utilityClass =
	"flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50";

export function SidebarUtilityLinks() {
	return (
		<div className="mt-5 flex flex-col gap-1 border-t border-border pt-5">
			<Link href="/" className={utilityClass}>
				<ExternalLink className="size-4 shrink-0" aria-hidden />
				Otwórz sklep
			</Link>
			<form action={logoutAction}>
				<button type="submit" className={utilityClass}>
					<LogOut className="size-4 shrink-0" aria-hidden />
					Wyloguj
				</button>
			</form>
		</div>
	);
}
