import Link from "next/link";
import {
	ArrowRightIcon,
	FacebookIcon,
	InstagramIcon,
	MailIcon,
	PhoneIcon,
	PinIcon,
	WhatsAppIcon,
} from "@/components/icons";
import { FOOTER_COLUMNS, STORE_INFO } from "@/components/layout/site-header/nav-data";
import { Container } from "@/components/primitives";

export function SiteFooter() {
	return (
		<footer className="mt-auto border-t border-border bg-foreground text-background">
			<Container size="xl" className="py-16 md:py-20">
				<div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
					<div className="lg:col-span-1">
						<Link
							href="/"
							className="inline-flex items-center gap-2 font-display text-2xl font-semibold tracking-tight text-background"
						>
							<span
								aria-hidden="true"
								className="grid size-9 place-items-center rounded-full border border-background/30 text-brass"
							>
								<svg
									viewBox="0 0 24 24"
									className="size-5"
									role="presentation"
									focusable="false"
									fill="none"
									stroke="currentColor"
									strokeWidth={1.5}
									strokeLinecap="round"
									strokeLinejoin="round"
								>
									<title>Logo RetroHouse</title>
									<path d="M4 11 12 4l8 7" />
									<path d="M6 10v9h12v-9" />
									<path d="M10 19v-5h4v5" />
								</svg>
							</span>
							RetroHouse
						</Link>
						<p className="mt-4 max-w-xs text-sm leading-relaxed text-background/70">
							Ratujemy skarby z wiedeńskich kamienic i dajemy im drugie życie w polskich domach.
						</p>
						<div className="mt-6 flex items-center gap-2">
							<Link
								aria-label="Instagram @retrohouse"
								href={STORE_INFO.instagramHref}
								target="_blank"
								rel="me noreferrer"
								className="grid size-10 place-items-center rounded-full border border-background/20 text-background/80 transition-colors hover:border-brass hover:text-brass"
							>
								<InstagramIcon className="size-5" />
							</Link>
							<Link
								aria-label="Facebook RetroHouse"
								href={STORE_INFO.facebookHref}
								target="_blank"
								rel="me noreferrer"
								className="grid size-10 place-items-center rounded-full border border-background/20 text-background/80 transition-colors hover:border-brass hover:text-brass"
							>
								<FacebookIcon className="size-5" />
							</Link>
							<Link
								aria-label="WhatsApp"
								href={`https://wa.me/${STORE_INFO.whatsapp.replace(/\s|\+/g, "")}`}
								target="_blank"
								rel="noreferrer"
								className="grid size-10 place-items-center rounded-full border border-background/20 text-background/80 transition-colors hover:border-brass hover:text-brass"
							>
								<WhatsAppIcon className="size-5" />
							</Link>
						</div>
					</div>

					{FOOTER_COLUMNS.map((column) => (
						<nav key={column.heading} aria-label={column.heading} className="lg:col-span-1">
							<p className="font-sans text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-brass">
								{column.heading}
							</p>
							<ul className="mt-4 space-y-2.5">
								{column.items.map((item) => (
									<li key={item.href}>
										<Link
											href={item.href}
											className="text-sm text-background/80 transition-colors hover:text-brass focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
										>
											{item.label}
										</Link>
									</li>
								))}
							</ul>
						</nav>
					))}

					<div className="lg:col-span-1">
						<p className="font-sans text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-brass">
							Kontakt
						</p>
						<ul className="mt-4 space-y-3 text-sm text-background/80">
							<li className="flex items-start gap-2.5">
								<PinIcon className="mt-0.5 size-4 text-brass" />
								<span>
									{STORE_INFO.address}
									<br />
									<Link
										href={STORE_INFO.mapsHref}
										target="_blank"
										rel="noreferrer"
										className="mt-1 inline-flex items-center gap-1 text-xs text-background/60 hover:text-brass"
									>
										Pokaż na mapie
										<ArrowRightIcon className="size-3" />
									</Link>
								</span>
							</li>
							<li className="flex items-start gap-2.5">
								<MailIcon className="mt-0.5 size-4 text-brass" />
								<Link href={`mailto:${STORE_INFO.email}`} className="hover:text-brass">
									{STORE_INFO.email}
								</Link>
							</li>
							<li className="flex items-start gap-2.5">
								<PhoneIcon className="mt-0.5 size-4 text-brass" />
								<Link
									href={`tel:${STORE_INFO.phone.replace(/\s/g, "")}`}
									className="hover:text-brass"
								>
									{STORE_INFO.phone}
								</Link>
							</li>
							<li className="text-xs text-background/60">{STORE_INFO.hours}</li>
						</ul>
					</div>
				</div>

				<div className="mt-12 rounded-2xl border border-background/10 bg-background/5 p-6 md:p-8">
					<div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
						<div>
							<p className="font-display text-2xl font-semibold text-background">
								Dołącz do społeczności RetroHouse
							</p>
							<p className="mt-1 text-sm text-background/70">
								Nowe dostawy z Wiednia w Twojej skrzynce. Bez spamu, raz na 2 tygodnie.
							</p>
						</div>
						<form
							className="flex w-full max-w-md flex-col gap-2 sm:flex-row"
							action="/api/newsletter"
							method="post"
							noValidate
						>
							<label htmlFor="newsletter-email" className="sr-only">
								Twój e-mail
							</label>
							<input
								id="newsletter-email"
								name="email"
								type="email"
								required
								autoComplete="email"
								placeholder="twój e-mail"
								className="h-12 w-full rounded-full border border-background/20 bg-background/10 px-5 text-sm text-background placeholder:text-background/50 focus-visible:border-brass focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass"
							/>
							<button
								type="submit"
								className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-brass px-6 text-sm font-semibold uppercase tracking-[0.16em] text-foreground transition-transform hover:translate-y-[-1px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass"
							>
								Zapisz się
								<ArrowRightIcon className="size-4" />
							</button>
						</form>
					</div>
				</div>

				<div className="mt-10 flex flex-col gap-3 border-t border-background/10 pt-6 text-xs text-background/60 md:flex-row md:items-center md:justify-between">
					<p>
						© {new Date().getFullYear()} {STORE_INFO.name}. Wszystkie prawa zastrzeżone.
					</p>
					<div className="flex items-center gap-3">
						<Link href="/regulamin" className="hover:text-background">
							Regulamin
						</Link>
						<Link href="/polityka-prywatnosci" className="hover:text-background">
							Polityka prywatności
						</Link>
						<Link href="/deklaracja-dostepnosci" className="hover:text-background">
							Dostępność
						</Link>
					</div>
					<p>
						Wykonanie:{" "}
						<Link
							href={STORE_INFO.madeByHref}
							target="_blank"
							rel="noreferrer"
							className="text-brass hover:text-background"
						>
							{STORE_INFO.madeBy}
						</Link>
					</p>
				</div>
			</Container>
		</footer>
	);
}
