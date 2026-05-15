"use client";

import Link from "next/link";
import { ArrowRightIcon, InstagramIcon } from "@/components/icons";
import { Container, Eyebrow, Section } from "@/components/primitives";
import { track } from "@/lib/analytics/posthog";
import { useState } from "react";

/**
 * FooterCtaSection — newsletter + pasek B2B.
 *
 * Newsletter: form action="/api/newsletter" (etap 2: Resend), na sukces
 * emit `newsletter_signup` (source: 'homepage').
 * Pasek B2B: jednoklikowy link do /dla-projektantow + emit `b2b_strip_clicked`.
 */
export function FooterCtaSection() {
	const [email, setEmail] = useState("");
	const [status, setStatus] = useState<"idle" | "ok">("idle");

	const handleNewsletter = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!email) return;
		track({ name: "newsletter_signup", properties: { source: "homepage" } });
		setStatus("ok");
		setEmail("");
	};

	return (
		<Section spacing="md" tone="ink">
			<Container size="md">
				<div className="grid gap-8 md:grid-cols-[1.2fr_0.8fr] md:items-end">
					<div>
						<Eyebrow variant="script" className="!text-brass">
							list co dwa tygodnie
						</Eyebrow>
						<h2 className="mt-3 font-display text-3xl font-medium leading-tight text-ink-foreground md:text-4xl">
							Zostań w&nbsp;kręgu RetroHouse.
						</h2>
						<p className="mt-4 max-w-md text-base leading-relaxed text-ink-foreground/75">
							Świeża dostawa z&nbsp;Wiednia w&nbsp;Twojej skrzynce. Bez spamu, z&nbsp;linkiem
							do&nbsp;priorytetowej rezerwacji.
						</p>
						<div className="mt-5 flex flex-wrap items-center gap-2">
							<Link
								href="https://instagram.com/retrohouse"
								target="_blank"
								rel="noreferrer"
								className="cta-text inline-flex items-center gap-2 text-xs text-ink-foreground/65 hover:text-terracotta"
							>
								<InstagramIcon className="size-4" />
								@retrohouse
							</Link>
						</div>
					</div>

					<form onSubmit={handleNewsletter} className="flex flex-col gap-3">
						<label htmlFor="hero-newsletter-email" className="sr-only">
							E-mail
						</label>
						<input
							id="hero-newsletter-email"
							name="email"
							type="email"
							required
							autoComplete="email"
							placeholder="twój e-mail"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							className="h-12 w-full rounded-full border border-ink-foreground/25 bg-ink-foreground/5 px-5 text-sm text-ink-foreground placeholder:text-ink-foreground/55 focus-visible:border-terracotta focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta"
						/>
						<button
							type="submit"
							className="cta-text inline-flex h-12 items-center justify-center gap-2 rounded-full bg-terracotta px-6 text-sm text-terracotta-foreground transition-all hover:-translate-y-0.5 hover:shadow-lg"
						>
							{status === "ok" ? "Dziękujemy" : "Zapisz się"}
							<ArrowRightIcon className="size-4" />
						</button>
						<p className="text-xs text-ink-foreground/55">
							Klikając „Zapisz się" akceptujesz{" "}
							<Link
								href="/polityka-prywatnosci"
								className="underline underline-offset-4 hover:text-terracotta"
							>
								politykę prywatności
							</Link>
							.
						</p>
					</form>
				</div>
			</Container>

			<div className="mt-12 border-t border-ink-foreground/10">
				<Container size="md" className="flex flex-col items-center gap-3 py-6 text-center md:flex-row md:justify-between md:text-left">
					<p className="cta-text text-xs text-ink-foreground/65">
						Architekt? Stylista? Studio wnętrzarskie?
					</p>
					<Link
						href="/dla-projektantow"
						onClick={() => track({ name: "b2b_strip_clicked", properties: {} })}
						className="cta-text inline-flex items-center gap-2 text-xs text-brass transition-colors hover:text-terracotta"
					>
						Sprawdź ofertę B2B
						<ArrowRightIcon className="size-3.5" />
					</Link>
				</Container>
			</div>
		</Section>
	);
}
