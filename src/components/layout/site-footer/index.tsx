import Link from "next/link";
import {
	FacebookIcon,
	InstagramIcon,
	MailIcon,
	PhoneIcon,
	PinIcon,
	WhatsAppIcon,
} from "@/components/icons";
import { FOOTER_COLUMNS, STORE_INFO } from "@/components/layout/site-header/nav-data";
import { Container } from "@/components/primitives";
import { CookieSettingsButton } from "./cookie-settings-button";

/**
 * Footer w wersji „retro-przytulnej" (2026-05-03 redesign):
 *  - 3 kolumny treści + kolumna brand/kontakt = 4 kolumny zamiast 5
 *  - bez dużego newsletter callout (jest na homepage), tylko link „zapisz się"
 *  - mniejszy padding (py-12 / 16 zamiast 16 / 20)
 *  - vintage divider zamiast brass-rule + ramki
 */
export function SiteFooter() {
	return (
		<footer className="mt-auto bg-ink text-ink-foreground">
			<Container size="lg" className="py-12 md:py-16">
				<div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.1fr_repeat(3,0.9fr)]">
					<div>
						<Link
							href="/"
							className="inline-flex items-baseline gap-2 font-display text-2xl font-medium tracking-tight text-ink-foreground"
						>
							RetroHouse
							<span className="font-sans text-xs uppercase tracking-[0.2em] text-brass">
								est. 2026
							</span>
						</Link>
						<p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-foreground/70">
							Skarby z wiedeńskich kamienic, które dostają drugie życie w polskich domach.
						</p>
						<div className="mt-6 flex items-center gap-2">
							<Link
								aria-label="Instagram @retrohouse"
								href={STORE_INFO.instagramHref}
								target="_blank"
								rel="me noreferrer"
								className="grid size-9 place-items-center rounded-full border border-ink-foreground/20 text-ink-foreground/80 transition-colors hover:border-terracotta hover:text-terracotta"
							>
								<InstagramIcon className="size-4" />
							</Link>
							<Link
								aria-label="Facebook RetroHouse"
								href={STORE_INFO.facebookHref}
								target="_blank"
								rel="me noreferrer"
								className="grid size-9 place-items-center rounded-full border border-ink-foreground/20 text-ink-foreground/80 transition-colors hover:border-terracotta hover:text-terracotta"
							>
								<FacebookIcon className="size-4" />
							</Link>
							<Link
								aria-label="WhatsApp"
								href={`https://wa.me/${STORE_INFO.whatsapp.replace(/\s|\+/g, "")}`}
								target="_blank"
								rel="noreferrer"
								className="grid size-9 place-items-center rounded-full border border-ink-foreground/20 text-ink-foreground/80 transition-colors hover:border-terracotta hover:text-terracotta"
							>
								<WhatsAppIcon className="size-4" />
							</Link>
						</div>
					</div>

				{FOOTER_COLUMNS.map((column) => (
					<nav key={column.heading} aria-label={column.heading}>
						<p className="font-sans text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-brass">
							{column.heading}
						</p>
						<ul className="mt-4 space-y-2.5">
							{column.items.map((item) => (
								<li key={item.href}>
									<Link
										href={item.href}
										className="text-sm text-ink-foreground/80 transition-colors hover:text-terracotta focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
									>
										{item.label}
									</Link>
								</li>
							))}
							{column.heading === "Formalności" ? (
								<li>
									<CookieSettingsButton />
								</li>
							) : null}
						</ul>
					</nav>
				))}
				</div>

				<div className="mt-12 grid gap-6 border-t border-ink-foreground/10 pt-8 text-sm text-ink-foreground/75 md:grid-cols-3">
					<p className="flex items-start gap-2">
						<PinIcon className="mt-0.5 size-4 shrink-0 text-brass" />
						<span>
							{STORE_INFO.address}
							<span className="block text-xs text-ink-foreground/55">{STORE_INFO.hours}</span>
						</span>
					</p>
					<p className="flex items-start gap-2">
						<MailIcon className="mt-0.5 size-4 shrink-0 text-brass" />
						<Link href={`mailto:${STORE_INFO.email}`} className="hover:text-terracotta">
							{STORE_INFO.email}
						</Link>
					</p>
					<p className="flex items-start gap-2">
						<PhoneIcon className="mt-0.5 size-4 shrink-0 text-brass" />
						<Link
							href={`tel:${STORE_INFO.phone.replace(/\s/g, "")}`}
							className="hover:text-terracotta"
						>
							{STORE_INFO.phone}
						</Link>
					</p>
				</div>

				<div className="mt-10 flex flex-col gap-3 text-xs text-ink-foreground/55 md:flex-row md:items-center md:justify-between">
					<p>
						© {new Date().getFullYear()} {STORE_INFO.name}.
					</p>
					<p>
						Projekt strony i wdrożenie:{" "}
						<Link
							href={STORE_INFO.madeByHref}
							target="_blank"
							rel="noreferrer"
							className="text-brass hover:text-terracotta"
						>
							{STORE_INFO.madeBy}
						</Link>
					</p>
				</div>
			</Container>
		</footer>
	);
}
