"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CartDrawer } from "@/components/cart-drawer";
import { ChevronDownIcon, CloseIcon, GiftIcon, MenuIcon, SearchIcon } from "@/components/icons";
import { cn } from "@/lib/utils";
import { CustomerMenu, CustomerMenuMobileLinks } from "./customer-menu";
import { PRIMARY_NAV, SHOP_MEGA_MENU } from "./nav-data";

export function SiteHeader() {
	const pathname = usePathname();
	const [scrolled, setScrolled] = useState(false);
	const [shopOpen, setShopOpen] = useState(false);
	const [mobileOpen, setMobileOpen] = useState(false);
	const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
	const megaId = useId();
	const [megaMounted, setMegaMounted] = useState(false);

	useEffect(() => {
		setMegaMounted(true);
	}, []);

	useEffect(() => {
		const onScroll = () => setScrolled(window.scrollY > 4);
		onScroll();
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => window.removeEventListener("scroll", onScroll);
	}, []);

	// biome-ignore lint/correctness/useExhaustiveDependencies: zamykamy menu wyłącznie po zmianie ścieżki, nie chcemy reagować na zmianę setterów.
	useEffect(() => {
		setMobileOpen(false);
		setShopOpen(false);
	}, [pathname]);

	useEffect(() => {
		if (!mobileOpen) return;
		const original = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		return () => {
			document.body.style.overflow = original;
		};
	}, [mobileOpen]);

	const onShopEnter = () => {
		if (closeTimer.current) clearTimeout(closeTimer.current);
		setShopOpen(true);
	};

	const onShopLeave = () => {
		closeTimer.current = setTimeout(() => setShopOpen(false), 120);
	};

	const handleBrandClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
		if (pathname !== "/") return;
		event.preventDefault();
		setMobileOpen(false);
		setShopOpen(false);
		const el = document.getElementById("hero");
		if (!el) return;
		const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		requestAnimationFrame(() => {
			el.scrollIntoView({
				behavior: prefersReduced ? "auto" : "smooth",
				block: "start",
			});
		});
	};

	const isCompact = scrolled || mobileOpen;

	if (pathname.startsWith("/magazyn")) return null;

	return (
		<header
			data-scrolled={isCompact ? "true" : "false"}
			className={cn(
				"sticky top-0 z-40 w-full transition-colors",
				"data-[scrolled=true]:bg-ink-foreground/90 data-[scrolled=true]:backdrop-blur-md data-[scrolled=true]:shadow-[0_1px_0_0_color-mix(in_oklch,var(--color-walnut)_25%,transparent)]",
			)}
		>
			<div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-5 sm:px-8 lg:px-12">
				<Link
					href="/"
					onClick={handleBrandClick}
					aria-label="RetroHouse — strona główna"
					className="group flex shrink-0 items-center"
				>
					<Image
						src="/brand/retrohouse-wordmark.webp"
						alt=""
						width={300}
						height={52}
						sizes="(max-width: 640px) 160px, 200px"
						priority
						className="h-9 w-auto object-contain sm:h-10"
					/>
				</Link>

				<nav aria-label="Menu główne" className="hidden items-center gap-1 lg:flex">
					{/* biome-ignore lint/a11y/noStaticElementInteractions: hover/focus na wrapperze to wyłącznie progressive enhancement; podstawowa nawigacja klawiaturą działa przez focus na wewnętrznym <Link>. */}
					<div
						onMouseEnter={onShopEnter}
						onMouseLeave={onShopLeave}
						onFocus={onShopEnter}
						onBlur={(event) => {
							if (event.relatedTarget && event.currentTarget.contains(event.relatedTarget as Node))
								return;
							onShopLeave();
						}}
						className="relative"
					>
						<Link
							href="/sklep"
							aria-haspopup="true"
							aria-expanded={shopOpen}
							aria-controls={megaId}
							className={cn(
								"inline-flex items-center gap-1 rounded-full px-3 py-2 text-sm font-medium text-foreground/75 transition-colors hover:text-terracotta focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring",
								pathname.startsWith("/sklep") && "text-terracotta",
							)}
						>
							Sklep
							<ChevronDownIcon
								className={cn("size-3.5 transition-transform", shopOpen && "rotate-180")}
							/>
						</Link>
					</div>

					<Link
						href="/prezent"
						className={cn(
							"inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-foreground/75 transition-colors hover:text-terracotta focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring",
							pathname.startsWith("/prezent") && "text-terracotta",
						)}
					>
						<GiftIcon className="size-4 text-terracotta" />
						Prezent z duszą
					</Link>

					{PRIMARY_NAV.filter((item) => !["/sklep", "/prezent"].includes(item.href)).map((item) => (
						<Link
							key={item.href}
							href={item.href}
							aria-current={pathname === item.href ? "page" : undefined}
							className={cn(
								"rounded-full px-3 py-2 text-sm font-medium text-foreground/75 transition-colors hover:text-terracotta focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring",
								pathname === item.href && "text-terracotta",
							)}
						>
							{item.label}
						</Link>
					))}
				</nav>

				<div className="flex items-center gap-1">
					<Link
						href="/sklep"
						aria-label="Szukaj"
						className="grid size-10 place-items-center rounded-full text-foreground/70 transition-colors hover:bg-cream hover:text-terracotta focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
					>
						<SearchIcon className="size-5" />
					</Link>
					<CartDrawer />
					<button
						type="button"
						aria-label={mobileOpen ? "Zamknij menu" : "Otwórz menu"}
						aria-expanded={mobileOpen}
						aria-controls="mobile-nav"
						onClick={() => setMobileOpen((value) => !value)}
						className="grid size-10 place-items-center rounded-full text-foreground/80 transition-colors hover:bg-cream hover:text-terracotta focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring lg:hidden"
					>
						{mobileOpen ? <CloseIcon className="size-5" /> : <MenuIcon className="size-5" />}
					</button>
					<CustomerMenu />
				</div>
			</div>

			<nav id="mobile-nav" hidden={!mobileOpen} className="lg:hidden" aria-label="Menu mobilne">
				<div className="border-t border-walnut/15 bg-ink-foreground/97 backdrop-blur-md">
					<div className="mx-auto max-w-7xl px-5 py-6 sm:px-8">
						<ul className="grid gap-1">
							<li>
								<Link
									href="/sklep"
									className="block rounded-lg px-3 py-3 font-display text-2xl font-semibold text-foreground hover:bg-cream hover:text-terracotta"
								>
									Sklep
								</Link>
								<ul className="mt-1 grid gap-0.5 pl-3">
									{SHOP_MEGA_MENU[0]?.items.map((cat) => (
										<li key={cat.href}>
											<Link
												href={cat.href}
												className="block rounded-md px-3 py-2 text-sm text-foreground/70 hover:bg-cream hover:text-terracotta"
											>
												{cat.label}
											</Link>
										</li>
									))}
								</ul>
							</li>
							{PRIMARY_NAV.filter((item) => item.href !== "/sklep").map((item) => (
								<li key={item.href}>
									<Link
										href={item.href}
										className="block rounded-lg px-3 py-3 font-display text-2xl font-semibold text-foreground hover:bg-cream hover:text-terracotta"
									>
										{item.label}
									</Link>
								</li>
							))}
							<CustomerMenuMobileLinks onNavigate={() => setMobileOpen(false)} />
							<li className="mt-4 border-t border-walnut/15 pt-4">
								<Link
									href="/dla-projektantow"
									className="block rounded-lg px-3 py-2 text-sm font-medium text-foreground/80 hover:bg-cream hover:text-terracotta"
								>
									Dla projektantów →
								</Link>
								<Link
									href="/kontakt"
									className="block rounded-lg px-3 py-2 text-sm font-medium text-foreground/80 hover:bg-cream hover:text-terracotta"
								>
									Odwiedź sklep w Nowym Targu →
								</Link>
							</li>
						</ul>
					</div>
				</div>
			</nav>

			{megaMounted && shopOpen
				? createPortal(
						<section
							id={megaId}
							aria-label="Podmenu sklepu"
							onMouseEnter={onShopEnter}
							onMouseLeave={onShopLeave}
							className="fixed top-16 left-1/2 z-[60] mt-2 max-h-[min(32rem,calc(100dvh-5rem))] w-[min(64rem,calc(100vw-2rem))] -translate-x-1/2 overflow-y-auto overscroll-contain rounded-2xl border border-walnut/15 bg-background p-6 shadow-xl"
						>
							<div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
								{SHOP_MEGA_MENU.map((group) => (
									<div key={group.heading}>
										<p className="mb-3 font-sans text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-terracotta">
											{group.heading}
										</p>
										<ul className="space-y-1">
											{group.items.map((item) => (
												<li key={item.href}>
													<Link
														href={item.href}
														className="group/menu block rounded-md px-2 py-2 transition-colors hover:bg-cream focus-visible:bg-cream focus-visible:outline-none"
													>
														<span className="block font-sans text-sm font-semibold text-foreground group-hover/menu:text-terracotta">
															{item.label}
														</span>
														{item.description ? (
															<span className="mt-0.5 block text-xs text-foreground/60">
																{item.description}
															</span>
														) : null}
													</Link>
												</li>
											))}
										</ul>
									</div>
								))}
							</div>
						</section>,
						document.body,
					)
				: null}
		</header>
	);
}
