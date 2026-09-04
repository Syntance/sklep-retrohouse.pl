import { Plus } from "lucide-react";
import Link from "next/link";
import { ModuleTile, Section, StatTile } from "@/components/panel/chrome";
import { DashboardCharts } from "@/components/panel/dashboard-charts";
import { buildOverviewModuleBadges, moduleBadgeFromHref } from "@/components/panel/demo-data";
import { MAGAZYN_NAV_ITEMS } from "@/components/panel/nav-config";
import { RecentOrdersSection } from "@/components/panel/recent-orders-section";
import { buildSalesStatistics, isPaidPaymentStatus } from "@/lib/admin/analytics/sales-stats";
import { listCategories } from "@/lib/admin/categories";
import { loadAdmin } from "@/lib/admin/load";
import { listAdminOrdersForStatistics } from "@/lib/admin/orders";
import { listAdminProducts } from "@/lib/admin/products";
import { formatPrice } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function OverviewPage() {
	const [products, categories, statsResult] = await loadAdmin(() =>
		Promise.all([listAdminProducts(), listCategories(), listAdminOrdersForStatistics()]),
	);

	const orders = statsResult.orders;

	const published = products.filter((p) => p.status === "published").length;
	const drafts = products.length - published;

	const openOrders = orders.filter(
		(o) => !["completed", "canceled", "archived"].includes(o.status),
	).length;
	const toShip = orders.filter((o) =>
		["not_fulfilled", "partially_fulfilled"].includes(o.fulfillmentStatus),
	).length;
	const revenue = orders
		.filter((o) => isPaidPaymentStatus(o.paymentStatus))
		.reduce((sum, o) => sum + o.total, 0);
	const currency = orders[0]?.currencyCode ?? "PLN";

	const moduleTiles = MAGAZYN_NAV_ITEMS.filter((item) => !item.exact);
	const moduleBadges = buildOverviewModuleBadges({ openOrders });
	const salesStats = buildSalesStatistics(orders, { truncated: statsResult.truncated });

	return (
		<div className="flex flex-col gap-8">
			<header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
				<div>
					<h1 className="font-serif text-2xl text-foreground">Przegląd</h1>
					<p className="mt-1 text-sm text-muted-foreground">
						Wybierz moduł, którym chcesz zarządzać asortymentem antyków RetroHouse.
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

			<Section title="Podsumowanie">
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
					<StatTile
						label="Zamówienia"
						value={orders.length}
						sub={`${openOrders} otwartych · ${toShip} do wysyłki`}
					/>
					<StatTile
						label="Produkty"
						value={products.length}
						sub={`${published} opubl. · ${drafts} szkic`}
					/>
					<StatTile label="Kategorie" value={categories.length} sub="aktywne klasyfikacje" />
					<StatTile
						label="Przychód (opłacone)"
						value={formatPrice(revenue, currency)}
						sub="suma zaksięgowanych płatności"
					/>
				</div>
			</Section>

			<Section title="Moduły panelu">
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{moduleTiles.map(({ href, label, icon: Icon }) => (
						<ModuleTile
							key={href}
							href={href}
							label={label}
							icon={<Icon className="size-5" aria-hidden />}
							badge={moduleBadgeFromHref(href, moduleBadges)}
						/>
					))}
				</div>
			</Section>

			<DashboardCharts stats={salesStats} />

			<RecentOrdersSection orders={orders} />
		</div>
	);
}
