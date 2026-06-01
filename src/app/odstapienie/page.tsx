"use client";

import { useState } from "react";
import { Breadcrumbs, Container, Eyebrow, Section } from "@/components/primitives";
import { CustomerLogin } from "./customer-login";
import { CustomerOrders } from "./customer-orders";

export default function OdstapienePage() {
	const [token, setToken] = useState<string | null>(null);

	function handleLogout() {
		setToken(null);
	}

	return (
		<main id="main" className="flex flex-col">
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
						{!token ? (
							<>
								<CustomerLogin onSuccess={setToken} />

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
										Aby odstąpić od umowy — zaloguj się powyżej swoim emailem (tym, którym
										składałeś zamówienie). Wyślemy Ci kod na email, a następnie zobaczysz swoje
										zamówienia z możliwością złożenia wniosku o zwrot.
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
							<CustomerOrders token={token} onLogout={handleLogout} />
						)}
					</div>
				</Container>
			</Section>
		</main>
	);
}
