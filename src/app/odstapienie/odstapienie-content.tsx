"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Breadcrumbs, Container, Eyebrow, Section } from "@/components/primitives";
import { useCustomerSession } from "@/components/customer/customer-session-provider";
import { Button } from "@/components/ui/button";
import { CustomerLogin } from "./customer-login";
import { CustomerOrders } from "./customer-orders";

export function OdstapienieContent() {
	const router = useRouter();
	const { ready, token, isLoggedIn, login, logout } = useCustomerSession();

	return (
		<>
			<Section spacing="sm">
				<Container size="md">
					<Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Odstąpienie od umowy" }]} />
				</Container>
			</Section>

			<Section spacing="md">
				<Container size="md">
					<Eyebrow>Twoje prawa · art. 27 UPK</Eyebrow>
					<h1 className="mt-3 font-display text-[clamp(2.4rem,5vw,4rem)] font-semibold leading-[1.05]">
						Odstąpienie od umowy
					</h1>
					<p className="mt-4 max-w-2xl text-foreground/70">
						Prawo do zwrotu bez podania przyczyny — 14 dni od dnia dostawy.
					</p>

					<div className="mt-8 space-y-8">
						{!ready ? (
							<div className="py-8 text-center text-foreground/70">Ładowanie…</div>
						) : !isLoggedIn || !token ? (
							<>
								<CustomerLogin onSuccess={login} />
								<p className="text-center text-sm">
									<Button
										type="button"
										variant="outline"
										size="sm"
										onClick={() => router.push("/konto?tab=zwroty")}
									>
										Otwórz panel konta
									</Button>
								</p>

								<div className="space-y-6 text-foreground/80 leading-relaxed">
									<h2 className="font-display text-2xl font-semibold text-foreground">
										Jak to działa?
									</h2>
									<p>
										Masz <strong className="font-semibold text-foreground">14 dni</strong> na
										odstąpienie od umowy zawartej na odległość, licząc od dnia otrzymania
										przesyłki — bez podania przyczyny (art. 27 ustawy o prawach konsumenta z
										30.05.2014).
									</p>
									<p>
										Zaloguj się w{" "}
										<Link href="/konto" className="font-medium text-terracotta hover:underline">
											Moim koncie
										</Link>{" "}
										e-mailem z zamówienia — w zakładce Zwroty złożysz wniosek o odstąpienie.
									</p>
									<p>
										Antyki to rzeczy używane. Zapoznajesz się z opisem stanu przedmiotu przed
										zakupem i akceptujesz go w koszyku — opisane ślady użytkowania nie są
										podstawą reklamacji.
									</p>
									<p>
										Odpowiadasz finansowo za zmniejszenie wartości przedmiotu wynikłe z
										korzystania ponad to, co konieczne do sprawdzenia jego charakteru (art. 34
										ust. 4 UPK).
									</p>
								</div>
							</>
						) : (
							<>
								<div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm">
									<p className="text-foreground/80">
										Zwroty i odstąpienia zarządzasz w{" "}
										<strong className="text-foreground">Moim koncie</strong>.
									</p>
									<Button
										type="button"
										size="sm"
										onClick={() => router.push("/konto?tab=zwroty")}
									>
										Panel konta
									</Button>
								</div>
								<CustomerOrders token={token} onLogout={logout} />
							</>
						)}
					</div>
				</Container>
			</Section>
		</>
	);
}
