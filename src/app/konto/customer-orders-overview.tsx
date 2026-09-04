"use client";

import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { toast } from "sonner";
import { OrderCustomerDetailsSection } from "@/components/customer/order-customer-details";
import { OrderCaseDetailsSection } from "@/components/customer/order-request-panels";
import { Button } from "@/components/ui/button";
import type { CustomerOrder } from "@/lib/customer/orders";
import { getActiveCaseOrderBadge } from "@/lib/customer/return-request-visual";
import { formatPrice } from "@/lib/format";

type Props = {
	token: string;
	onOpenTab: (tab: "reklamacje" | "zwroty") => void;
};

export function CustomerOrdersOverview({ token, onOpenTab }: Props) {
	const [orders, setOrders] = useState<CustomerOrder[]>([]);
	const [loading, setLoading] = useState(true);
	const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

	useEffect(() => {
		let cancelled = false;
		async function fetchOrders() {
			try {
				const res = await fetch("/api/customer/orders", {
					headers: { Authorization: `Bearer ${token}` },
				});
				const json = await res.json();
				if (cancelled) return;
				if (json.ok) {
					setOrders(json.orders);
				} else {
					toast.error("Nie udało się pobrać zamówień");
				}
			} catch {
				if (!cancelled) toast.error("Błąd połączenia");
			} finally {
				if (!cancelled) setLoading(false);
			}
		}
		void fetchOrders();
		return () => {
			cancelled = true;
		};
	}, [token]);

	if (loading) {
		return <div className="py-12 text-center text-foreground/70">Ładowanie zamówień…</div>;
	}

	if (orders.length === 0) {
		return (
			<p className="rounded-xl border border-border bg-card p-6 text-center text-muted-foreground">
				Nie znaleziono zamówień dla tego adresu e-mail.
			</p>
		);
	}

	return (
		<div className="space-y-4">
			<p className="text-sm text-foreground/70">
				Podsumowanie zamówień. Reklamację lub odstąpienie złożysz w odpowiedniej zakładce.
			</p>
			{orders.map((order) => (
				<OrderOverviewCard
					key={order.id}
					order={order}
					isOrderOpen={expandedOrderId === order.id}
					onToggleOrder={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
					onOpenTab={onOpenTab}
				/>
			))}
		</div>
	);
}

type CasePanel = "claim" | "withdrawal" | null;

function OrderOverviewCard({
	order,
	isOrderOpen,
	onToggleOrder,
	onOpenTab,
}: {
	order: CustomerOrder;
	isOrderOpen: boolean;
	onToggleOrder: () => void;
	onOpenTab: (tab: "reklamacje" | "zwroty") => void;
}) {
	const [casePanel, setCasePanel] = useState<CasePanel>(null);
	const orderDetailsPanelId = useId();
	const claimPanelId = useId();
	const withdrawalPanelId = useId();
	const badge = getActiveCaseOrderBadge(order);
	const hasClaims = order.claims.length > 0;
	const hasWithdrawals = order.withdrawals.length > 0;
	/** Nową reklamację / odstąpienie tylko gdy na zamówieniu nie ma jeszcze żadnej sprawy. */
	const canStartNewCase = !hasClaims && !hasWithdrawals;

	const headerContent = (
		<div className="flex flex-wrap items-start justify-between gap-3">
			<div className="min-w-0 flex-1">
				<p className="font-semibold">Zamówienie #{order.displayId}</p>
				<p className="mt-0.5 text-sm text-muted-foreground">
					{new Date(order.createdAt).toLocaleDateString("pl-PL")} · {order.itemCount}{" "}
					{order.itemCount === 1 ? "produkt" : "produkty"} · {formatPrice(order.total)}
				</p>
				<p className="mt-1 text-xs text-muted-foreground">
					{isOrderOpen ? "Zwiń szczegóły zamówienia" : "Kliknij, aby zobaczyć szczegóły zamówienia"}
				</p>
			</div>
			<div className="flex shrink-0 items-center gap-2">
				{badge ? <span className={badge.className}>{badge.label}</span> : null}
				<span
					className="inline-flex size-8 items-center justify-center rounded-full text-muted-foreground"
					aria-hidden
				>
					<svg
						width="16"
						height="16"
						viewBox="0 0 16 16"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
						aria-hidden="true"
						className={isOrderOpen ? "transition-transform rotate-180" : "transition-transform"}
					>
						<path
							d="M4 6L8 10L12 6"
							stroke="currentColor"
							strokeWidth="1.5"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
					</svg>
				</span>
			</div>
		</div>
	);

	return (
		<div className="overflow-hidden rounded-xl border border-border bg-card">
			<button
				type="button"
				onClick={onToggleOrder}
				aria-expanded={isOrderOpen}
				aria-controls={orderDetailsPanelId}
				className="w-full px-5 py-4 text-left transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
			>
				{headerContent}
			</button>

			{isOrderOpen ? (
				<div id={orderDetailsPanelId} className="border-t border-border px-5 py-4">
					<OrderCustomerDetailsSection order={order} />
				</div>
			) : null}

			<div className="border-t border-border px-5 py-4">
				<div className="flex flex-wrap gap-2">
					{hasClaims ? (
						<Button
							type="button"
							variant={casePanel === "claim" ? "secondary" : "outline"}
							size="sm"
							aria-expanded={casePanel === "claim"}
							aria-controls={claimPanelId}
							onClick={() => setCasePanel((current) => (current === "claim" ? null : "claim"))}
						>
							{casePanel === "claim" ? "Ukryj szczegóły reklamacji" : "Szczegóły reklamacji"}
						</Button>
					) : null}
					{hasWithdrawals ? (
						<Button
							type="button"
							variant={casePanel === "withdrawal" ? "secondary" : "outline"}
							size="sm"
							aria-expanded={casePanel === "withdrawal"}
							aria-controls={withdrawalPanelId}
							onClick={() =>
								setCasePanel((current) => (current === "withdrawal" ? null : "withdrawal"))
							}
						>
							{casePanel === "withdrawal" ? "Ukryj szczegóły odstąpienia" : "Szczegóły odstąpienia"}
						</Button>
					) : null}
					{canStartNewCase ? (
						<>
							<Button
								type="button"
								variant="outline"
								size="sm"
								disabled={!order.canClaim}
								onClick={() => onOpenTab("reklamacje")}
							>
								Reklamacja
							</Button>
							<Button
								type="button"
								variant="outline"
								size="sm"
								disabled={!order.canReturn}
								onClick={() => onOpenTab("zwroty")}
							>
								Odstąpienie (14 dni)
							</Button>
						</>
					) : null}
				</div>

				{casePanel === "claim" ? (
					<div id={claimPanelId} className="mt-4 border-t border-border pt-4">
						<OrderCaseDetailsSection order={order} variant="claim" />
					</div>
				) : null}
				{casePanel === "withdrawal" ? (
					<div id={withdrawalPanelId} className="mt-4 border-t border-border pt-4">
						<OrderCaseDetailsSection order={order} variant="withdrawal" />
					</div>
				) : null}

				<p className="mt-3 text-xs text-muted-foreground">
					<Link href="/reklamacje" className="text-terracotta hover:underline">
						Informacje o reklamacjach
					</Link>
					{" · "}
					<Link href="/odstapienie" className="text-terracotta hover:underline">
						Prawo odstąpienia
					</Link>
				</p>
			</div>
		</div>
	);
}
