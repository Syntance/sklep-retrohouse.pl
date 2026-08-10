/**
 * Wspólne stałe menu konta — używane przez customer-menu.tsx (eager)
 * i customer-menu-dropdown.tsx (lazy chunk). Bez importów bibliotek.
 */

export const ACCOUNT_LINKS = [
	{ label: "Zamówienia", href: "/konto?tab=zamowienia" },
	{ label: "Reklamacje", href: "/konto?tab=reklamacje" },
	{ label: "Zwroty i odstąpienie", href: "/konto?tab=zwroty" },
] as const;

/** Ten sam rozmiar co Szukaj / Koszyk w headerze. */
export const accountIconButtonClass =
	"relative grid size-10 place-items-center rounded-full text-foreground/70 transition-colors hover:bg-cream hover:text-terracotta focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring data-popup-open:bg-cream data-popup-open:text-terracotta";
