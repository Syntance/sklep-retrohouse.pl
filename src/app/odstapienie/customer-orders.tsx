"use client";

import { useEffect, useState } from "react";
import { OrderLineItemPicker } from "@/components/customer/order-line-item-picker";
import {
	ClaimsStatusPanel,
	CrossRequestBlockNotice,
	OrderItemsWithCaseTags,
	WithdrawalsStatusPanel,
} from "@/components/customer/order-request-panels";
import type { CustomerOrder } from "@/lib/customer/orders";
import {
	getLineItemsBlockedByOtherCases,
	validateReturnLineItemSelection,
} from "@/lib/customer/return-line-items";
import {
	availableActionBadgeClass,
	getWithdrawalTabOrderBadge,
} from "@/lib/customer/return-request-visual";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { formatPrice } from "@/lib/format";

type Props = {
	token: string;
	onLogout: () => void;
	hideLogout?: boolean;
};

export function CustomerOrders({ token, onLogout, hideLogout = false }: Props) {
	const [orders, setOrders] = useState<CustomerOrder[]>([]);
	const [loading, setLoading] = useState(true);
	const [selectedOrder, setSelectedOrder] = useState<string | null>(null);

	useEffect(() => {
		void fetchOrders();
	}, []);

	async function fetchOrders() {
		try {
			const res = await fetch("/api/customer/orders", {
				headers: { Authorization: `Bearer ${token}` },
			});
			const json = await res.json();

			if (json.ok) {
				setOrders(json.orders);
			} else {
				toast.error("Nie udało się pobrać zamówień");
			}
		} catch {
			toast.error("Błąd połączenia");
		} finally {
			setLoading(false);
		}
	}

	if (loading) {
		return <div className="py-12 text-center text-foreground/70">Ładowanie zamówień…</div>;
	}

	if (orders.length === 0) {
		return (
			<div className="rounded-2xl border border-border bg-card p-6 text-center">
				<p className="text-muted-foreground">
					Nie znaleziono zamówień dla tego adresu e-mail.
				</p>
				<Button onClick={onLogout} variant="outline" className="mt-4">
					Wyloguj się
				</Button>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between gap-4">
				<h2 className="font-display text-2xl font-semibold">Twoje zamówienia</h2>
				{hideLogout ? null : (
					<Button onClick={onLogout} variant="outline" size="sm">
						Wyloguj się
					</Button>
				)}
			</div>

			<div className="space-y-4">
				{orders.map((order) => (
					<WithdrawalOrderCard
						key={order.id}
						order={order}
						token={token}
						isOpen={selectedOrder === order.id}
						onToggle={() =>
							setSelectedOrder(selectedOrder === order.id ? null : order.id)
						}
						onWithdrawalSubmitted={() => void fetchOrders()}
					/>
				))}
			</div>
		</div>
	);
}

function WithdrawalOrderCard({
	order,
	token,
	isOpen,
	onToggle,
	onWithdrawalSubmitted,
}: {
	order: CustomerOrder;
	token: string;
	isOpen: boolean;
	onToggle: () => void;
	onWithdrawalSubmitted: () => void;
}) {
	const [submitting, setSubmitting] = useState(false);
	const [formError, setFormError] = useState<string | null>(null);
	const [selectedItems, setSelectedItems] = useState<string[]>([]);
	const [reason, setReason] = useState("");

	const excludedLineItems = getLineItemsBlockedByOtherCases(order);
	const badge = getWithdrawalTabOrderBadge(order);
	const canSubmitNewWithdrawal =
		order.canReturn && !order.activeWithdrawal && !order.activeClaim;
	const blockedByClaim = Boolean(order.activeClaim);

	async function handleSubmitReturn(e: React.FormEvent) {
		e.preventDefault();
		setFormError(null);

		const itemError = validateReturnLineItemSelection(
			order.items,
			selectedItems,
			excludedLineItems,
		);
		if (itemError) {
			setFormError(itemError);
			toast.error(itemError);
			return;
		}
		if (reason.trim().length < 10) {
			const msg = "Podaj powód zwrotu (min. 10 znaków).";
			setFormError(msg);
			toast.error(msg);
			return;
		}

		setSubmitting(true);
		try {
			const res = await fetch("/api/returns/create", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					orderId: order.id,
					itemIds: selectedItems,
					reason: reason.trim(),
				}),
			});

			let json: { ok?: boolean; error?: string };
			try {
				json = (await res.json()) as typeof json;
			} catch {
				setFormError("Nie udało się odczytać odpowiedzi serwera.");
				toast.error("Błąd połączenia");
				return;
			}

			if (json.ok) {
				toast.success("Wniosek o odstąpienie został wysłany");
				setSelectedItems([]);
				setReason("");
				onWithdrawalSubmitted();
			} else {
				const msg = json.error ?? "Nie udało się wysłać wniosku";
				setFormError(msg);
				toast.error(msg);
			}
		} catch {
			const msg = "Błąd połączenia. Spróbuj ponownie.";
			setFormError(msg);
			toast.error(msg);
		} finally {
			setSubmitting(false);
		}
	}

	return (
		<div className="overflow-hidden rounded-xl border border-border bg-card">
			<button
				type="button"
				onClick={onToggle}
				className="w-full px-6 py-4 text-left transition-colors hover:bg-muted/50"
			>
				<div className="flex items-start justify-between gap-4">
					<div>
						<p className="font-semibold">Zamówienie #{order.displayId}</p>
						<p className="mt-0.5 text-sm text-muted-foreground">
							{new Date(order.createdAt).toLocaleDateString("pl-PL")} · {order.itemCount}{" "}
							{order.itemCount === 1 ? "produkt" : "produkty"} · {formatPrice(order.total)}
						</p>
					</div>
					{badge ? (
						<span className={badge.className}>{badge.label}</span>
					) : null}
				</div>
			</button>

			{isOpen ? (
				<div className="space-y-4 border-t border-border px-6 py-4">
					{order.claims.length > 0 ? <ClaimsStatusPanel claims={order.claims} /> : null}
					{blockedByClaim ? (
						<CrossRequestBlockNotice
							title="Reklamacja w toku"
							body={`${order.activeClaim?.statusLabel ?? "Zgłoszenie"} — na tym zamówieniu nie można równolegle złożyć odstąpienia od umowy (14 dni).`}
							linkHref="/reklamacje"
							linkLabel="Przejdź do reklamacji"
						/>
					) : null}
					{order.withdrawals.length > 0 ? (
						<WithdrawalsStatusPanel withdrawals={order.withdrawals} />
					) : null}

					{!canSubmitNewWithdrawal ? <OrderItemsWithCaseTags order={order} /> : null}

					{canSubmitNewWithdrawal ? (
						<form onSubmit={handleSubmitReturn} className="space-y-4" noValidate>
							<OrderLineItemPicker
								orderId={order.id}
								items={order.items}
								selectedIds={selectedItems}
								onChange={setSelectedItems}
								excludedIds={excludedLineItems}
								disabled={submitting}
								legend="Którego produktu dotyczy odstąpienie od umowy?"
								singleItemHint="Odstąpienie dotyczy produktu:"
							/>
							{formError ? (
								<div
									role="alert"
									className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
								>
									{formError}
								</div>
							) : null}
							<div>
								<label
									htmlFor={`reason-${order.id}`}
									className="mb-1.5 block text-sm font-medium"
								>
									Powód odstąpienia
								</label>
								<textarea
									id={`reason-${order.id}`}
									value={reason}
									onChange={(e) => setReason(e.target.value)}
									placeholder="Np. Produkt nie spełnił moich oczekiwań…"
									rows={3}
									className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
									disabled={submitting}
								/>
								<p className="mt-1 text-xs text-muted-foreground">Min. 10 znaków</p>
							</div>

							<Button type="submit" disabled={submitting} className="w-full">
								{submitting ? "Wysyłanie…" : "Złóż wniosek o odstąpienie"}
							</Button>
						</form>
					) : blockedByClaim ? (
						<p className="text-sm text-muted-foreground">
							Trwa reklamacja — odstąpienia od umowy na to samo zamówienie nie można złożyć
							równolegle.
						</p>
					) : order.activeWithdrawal ? (
						<p className="text-sm text-muted-foreground">
							Na tym zamówieniu trwa odstąpienie — status widzisz powyżej. O zmianach
							poinformujemy e-mailem.
						</p>
					) : (
						<p className="text-sm text-muted-foreground">
							Termin na odstąpienie od umowy (14 dni) upłynął dla tego zamówienia.
						</p>
					)}
				</div>
			) : null}
		</div>
	);
}
