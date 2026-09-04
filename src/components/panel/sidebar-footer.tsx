import { ExternalLink, LogOut } from "lucide-react";
import Link from "next/link";
import { logoutAction } from "@/lib/admin/auth-actions";
import { cn } from "@/lib/utils";
import { MAGAZYN_BRANDING } from "./nav-config";

export function SidebarFooter({ className }: { className?: string }) {
	return (
		<div className={cn("flex flex-col gap-2 border-t border-border pt-4", className)}>
			<Link
				href={MAGAZYN_BRANDING.storefrontUrl}
				className="inline-flex h-8 w-full items-center justify-start gap-2 rounded-lg px-3 text-sm font-medium text-muted-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
			>
				<ExternalLink className="size-4" aria-hidden />
				Otwórz sklep
			</Link>
			<form action={logoutAction}>
				<button
					type="submit"
					className="inline-flex h-8 w-full items-center justify-start gap-2 rounded-lg px-3 text-sm font-medium text-muted-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
				>
					<LogOut className="size-4" aria-hidden />
					Wyloguj
				</button>
			</form>
		</div>
	);
}
