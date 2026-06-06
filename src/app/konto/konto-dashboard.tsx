"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CustomerLogin } from "@/app/odstapienie/customer-login";
import { CustomerOrdersClaims } from "@/app/reklamacje/customer-orders-claims";
import { CustomerOrders } from "@/app/odstapienie/customer-orders";
import { useCustomerSession } from "@/components/customer/customer-session-provider";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CustomerContactSubmissions } from "@/components/customer/customer-contact-submissions";
import { CustomerOrdersOverview } from "./customer-orders-overview";

const TABS = ["zamowienia", "reklamacje", "zwroty", "formularze"] as const;
type KontoTab = (typeof TABS)[number];

function parseTab(value: string | null): KontoTab {
	if (
		value === "reklamacje" ||
		value === "zwroty" ||
		value === "zamowienia" ||
		value === "formularze"
	) {
		return value;
	}
	return "zamowienia";
}

export function KontoDashboard() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const { ready, token, email, isLoggedIn, login, logout } = useCustomerSession();
	const activeTab = parseTab(searchParams.get("tab"));

	function setTab(tab: KontoTab) {
		router.replace(`/konto?tab=${tab}`, { scroll: false });
	}

	if (!ready) {
		return <div className="py-16 text-center text-foreground/70">Ładowanie…</div>;
	}

	if (!isLoggedIn || !token) {
		return (
			<div className="space-y-6">
				<h1 className="font-display text-[clamp(1.75rem,3.5vw,2.5rem)] font-semibold leading-tight">
					Zaloguj się, aby zarządzać swoimi zamówieniami
				</h1>
				<CustomerLogin onSuccess={login} />
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex flex-wrap items-center justify-between gap-4">
				<div>
					<p className="text-sm text-muted-foreground">Zalogowano jako</p>
					<p className="font-medium text-foreground">{email}</p>
				</div>
				<Button type="button" variant="outline" size="sm" onClick={logout}>
					Wyloguj się
				</Button>
			</div>

			<Tabs
				value={activeTab}
				onValueChange={(value) => setTab(parseTab(value))}
				className="gap-6"
			>
				<TabsList className="w-full max-w-xl">
					<TabsTrigger value="zamowienia" className="flex-1">
						Zamówienia
					</TabsTrigger>
					<TabsTrigger value="reklamacje" className="flex-1">
						Reklamacje
					</TabsTrigger>
					<TabsTrigger value="zwroty" className="flex-1">
						Zwroty
					</TabsTrigger>
					<TabsTrigger value="formularze" className="flex-1">
						Wysłane formularze
					</TabsTrigger>
				</TabsList>

				<TabsContent value="zamowienia">
					<CustomerOrdersOverview
						token={token}
						onOpenTab={(tab) => setTab(tab)}
					/>
				</TabsContent>

				<TabsContent value="reklamacje">
					<CustomerOrdersClaims
						token={token}
						onLogout={logout}
						hideLogout
					/>
				</TabsContent>

				<TabsContent value="zwroty">
					<CustomerOrders token={token} onLogout={logout} hideLogout />
				</TabsContent>

				<TabsContent value="formularze">
					<CustomerContactSubmissions token={token} />
				</TabsContent>
			</Tabs>

			<p className="text-xs text-muted-foreground">
				<Link href="/reklamacje" className="text-terracotta hover:underline">
					Procedura reklamacji
				</Link>
				{" · "}
				<Link href="/odstapienie" className="text-terracotta hover:underline">
					Odstąpienie od umowy — informacje prawne
				</Link>
			</p>
		</div>
	);
}
