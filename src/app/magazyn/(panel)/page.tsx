import { Package, Plus, ShoppingBag, Tags } from "lucide-react";
import Link from "next/link";
import { listCategories } from "@/lib/admin/categories";
import { loadAdmin } from "@/lib/admin/load";
import { listAdminOrders } from "@/lib/admin/orders";
import { listAdminProducts } from "@/lib/admin/products";
import { formatPrice } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function OverviewPage() {
	const [products, categories, orders] = await loadAdmin(() =>
		Promise.all([listAdminProducts(), listCategories(), listAdminOrders()]),
	);

	const published = products.filter((p) => p.status === "published").length;
	const drafts = products.length - published;

	const openOrders = orders.filter(
		(o) => !["completed", "canceled", "archived"].includes(o.status),
	).length;
	const toShip = orders.filter((o) =>
		["not_fulfilled", "partially_fulfilled"].includes(o.fulfillmentStatus),
	).length;
	const revenue = orders
		.filter((o) => o.paymentStatus === "captured")
		.reduce((sum, o) => sum + o.total, 0);
	const currency = orders[0]?.currencyCode ?? "PLN";

	const stats = [
		{
			label: "Zamówienia",
			value: orders.length,
			hint: `${openOrders} otwartych · ${toShip} do wysyłki`,
		},
		{ label: "Produkty", value: products.length, hint: `${published} opubl. · ${drafts} szkic` },
		{ label: "Kategorie", value: categories.length, hint: "aktywne klasyfikacje" },
		{
			label: "Przychód (opłacone)",
			value: formatPrice(revenue, currency),
			hint: "suma zaksięgowanych płatności",
		},
	];

	return (
		<div className="flex flex-col gap-8">
			<header className="flex flex-wrap items-end justify-between gap-4">
				<div>
					<h1 className="font-serif text-2xl text-foreground">Przegląd</h1>
					<p className="mt-1 text-sm text-muted-foreground">
						Zarządzaj asortymentem antyków RetroHouse.
					</p>
				</div>
				<Link
					href="/magazyn/produkty/nowy"
					className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
				>
					<Plus className="size-4" aria-hidden />
					Dodaj produkt
				</Link>
			</header>

			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				{stats.map((stat) => (
					<div key={stat.label} className="rounded-xl border border-border bg-card p-5">
						<p className="text-sm text-muted-foreground">{stat.label}</p>
						<p className="mt-1 font-serif text-3xl text-foreground">{stat.value}</p>
						<p className="mt-1 text-xs text-muted-foreground">{stat.hint}</p>
					</div>
				))}
			</div>

			<div className="grid gap-3 sm:grid-cols-3">
				<Link
					href="/magazyn/zamowienia"
					className="group flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40"
				>
					<span className="flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
						<ShoppingBag className="size-5" aria-hidden />
					</span>
					<span>
						<span className="block text-sm font-medium text-foreground">Zamówienia</span>
						<span className="block text-xs text-muted-foreground">Statusy, płatności, wysyłki</span>
					</span>
				</Link>
				<Link
					href="/magazyn/produkty"
					className="group flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40"
				>
					<span className="flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
						<Package className="size-5" aria-hidden />
					</span>
					<span>
						<span className="block text-sm font-medium text-foreground">Lista produktów</span>
						<span className="block text-xs text-muted-foreground">Edytuj ceny, zdjęcia, wady</span>
					</span>
				</Link>
				<Link
					href="/magazyn/kategorie"
					className="group flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40"
				>
					<span className="flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
						<Tags className="size-5" aria-hidden />
					</span>
					<span>
						<span className="block text-sm font-medium text-foreground">Kategorie</span>
						<span className="block text-xs text-muted-foreground">Dodawaj i porządkuj działy</span>
					</span>
				</Link>
			</div>
		</div>
	);
}
