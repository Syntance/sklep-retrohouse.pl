"use client";

import { useRouter } from "next/navigation";
import { CustomerLogin } from "@/app/odstapienie/customer-login";
import { useCustomerSession } from "@/components/customer/customer-session-provider";
import { Button } from "@/components/ui/button";
import { CustomerOrdersClaims } from "./customer-orders-claims";

export function ReklamacjePortal() {
	const router = useRouter();
	const { ready, token, isLoggedIn, login, logout } = useCustomerSession();

	if (!ready) {
		return <div className="py-8 text-center text-foreground/70">Ładowanie…</div>;
	}

	if (!isLoggedIn || !token) {
		return (
			<div className="space-y-6">
				<CustomerLogin onSuccess={login} />
				<p className="text-center text-sm text-foreground/70">
					Zaloguj się tym samym e-mailem, którego użyłeś/-aś przy zamówieniu. Reklamację możesz
					złożyć w ciągu 2 lat od wydania towaru.
				</p>
				<p className="text-center text-sm">
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={() => router.push("/konto?tab=reklamacje")}
					>
						Otwórz panel konta
					</Button>
				</p>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm">
				<p className="text-foreground/80">
					Zarządzaj zamówieniami i reklamacjami w{" "}
					<strong className="text-foreground">Moim koncie</strong>.
				</p>
				<Button
					type="button"
					size="sm"
					onClick={() => router.push("/konto?tab=reklamacje")}
				>
					Panel konta
				</Button>
			</div>
			<CustomerOrdersClaims token={token} onLogout={logout} />
		</div>
	);
}
