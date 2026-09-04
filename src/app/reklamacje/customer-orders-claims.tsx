"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { OrderLineItemPicker } from "@/components/customer/order-line-item-picker";
import {
	ClaimsStatusPanel,
	CrossRequestBlockNotice,
	OrderItemsWithCaseTags,
	WithdrawalsStatusPanel,
} from "@/components/customer/order-request-panels";
import { Button } from "@/components/ui/button";
import type { CustomerOrder } from "@/lib/customer/orders";
import {
	getLineItemsBlockedByOtherCases,
	validateReturnLineItemSelection,
} from "@/lib/customer/return-line-items";
import { getClaimTabOrderBadge } from "@/lib/customer/return-request-visual";
import { formatPrice } from "@/lib/format";
import type { CLAIM_REMEDIES } from "@/lib/validation/claim";

const REMEDY_OPTIONS: Array<{ value: (typeof CLAIM_REMEDIES)[number]; label: string }> = [
	{ value: "repair", label: "Naprawa" },
	{ value: "price_reduction", label: "Obniżenie ceny" },
	{ value: "withdrawal", label: "Odstąpienie od umowy" },
];

type Props = {
	token: string;
	onLogout: () => void;
	/** Ukryj przycisk wyloguj (np. w /konto z globalnym wylogowaniem). */
	hideLogout?: boolean;
};

export function CustomerOrdersClaims({ token, onLogout, hideLogout = false }: Props) {
	const [orders, setOrders] = useState<CustomerOrder[]>([]);
	const [loading, setLoading] = useState(true);
	const [selectedOrder, setSelectedOrder] = useState<string | null>(null);

	const fetchOrders = useCallback(async () => {
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
	}, [token]);

	useEffect(() => {
		void fetchOrders();
	}, [fetchOrders]);

	if (loading) {
		return <div className="py-12 text-center text-foreground/70">Ładowanie zamówień…</div>;
	}

	if (orders.length === 0) {
		return (
			<div className="rounded-2xl border border-border bg-card p-6 text-center">
				<p className="text-muted-foreground">Nie znaleziono zamówień dla tego adresu e-mail.</p>
				<Button onClick={onLogout} variant="outline" size="sm" className="mt-4">
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
			<p className="text-sm text-foreground/70">
				Reklamację możesz złożyć w ciągu <strong className="text-foreground">2 lat</strong> od
				wydania towaru. Odpowiemy na zgłoszenie w terminie 14 dni.
			</p>

			<div className="space-y-4">
				{orders.map((order) => (
					<ClaimOrderCard
						key={order.id}
						order={order}
						token={token}
						isOpen={selectedOrder === order.id}
						onToggle={() => setSelectedOrder(selectedOrder === order.id ? null : order.id)}
						onClaimSubmitted={() => void fetchOrders()}
					/>
				))}
			</div>
		</div>
	);
}

function ClaimOrderCard({
	order,
	token,
	isOpen,
	onToggle,
	onClaimSubmitted,
}: {
	order: CustomerOrder;
	token: string;
	isOpen: boolean;
	onToggle: () => void;
	onClaimSubmitted: () => void;
}) {
	const [submitting, setSubmitting] = useState(false);
	const [formError, setFormError] = useState<string | null>(null);
	const [successRef, setSuccessRef] = useState<string | null>(null);
	const [selectedItems, setSelectedItems] = useState<string[]>([]);
	const [description, setDescription] = useState("");
	const [remedy, setRemedy] = useState<(typeof CLAIM_REMEDIES)[number] | "">("");
	const [bankAccount, setBankAccount] = useState("");

	const needsBank = remedy === "price_reduction" || remedy === "withdrawal";
	const excludedLineItems = getLineItemsBlockedByOtherCases(order);
	const badge = getClaimTabOrderBadge(order);
	const canSubmitNewClaim = order.canClaim && !order.activeClaim && !order.activeWithdrawal;
	const blockedByWithdrawal = Boolean(order.activeWithdrawal);

	function validateClaim(): string | null {
		const itemError = validateReturnLineItemSelection(
			order.items,
			selectedItems,
			excludedLineItems,
		);
		if (itemError) {
			return itemError;
		}
		if (description.trim().length < 20) {
			return "Opis niezgodności — minimum 20 znaków.";
		}
		if (!remedy) {
			return "Wybierz żądanie (naprawa, obniżenie ceny lub odstąpienie).";
		}
		if (needsBank && bankAccount.trim().length < 4) {
			return "Podaj numer rachunku (IBAN).";
		}
		return null;
	}

	async function handleSubmitClaim(e: React.FormEvent) {
		e.preventDefault();
		setFormError(null);
		setSuccessRef(null);

		const validationError = validateClaim();
		if (validationError) {
			setFormError(validationError);
			toast.error(validationError);
			return;
		}

		if (!remedy) {
			return;
		}

		setSubmitting(true);
		try {
			const res = await fetch("/api/claims/create", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					orderId: order.id,
					itemIds: selectedItems,
					description: description.trim(),
					remedy,
					bankAccount: needsBank ? bankAccount : undefined,
				}),
			});

			let json: { ok?: boolean; error?: string; referenceId?: string };
			try {
				json = (await res.json()) as typeof json;
			} catch {
				setFormError("Nie udało się odczytać odpowiedzi serwera. Spróbuj ponownie.");
				toast.error("Błąd połączenia");
				return;
			}

			if (json.ok) {
				const ref = json.referenceId ?? "";
				setSuccessRef(ref);
				toast.success(ref ? `Reklamacja wysłana — numer ${ref}` : "Reklamacja wysłana");
				setSelectedItems([]);
				setDescription("");
				setRemedy("");
				setBankAccount("");
				onClaimSubmitted();
			} else {
				const msg = json.error ?? "Nie udało się wysłać reklamacji";
				setFormError(msg);
				toast.error(msg);
			}
		} catch {
			const msg = "Błąd połączenia. Sprawdź internet i spróbuj ponownie.";
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
					{badge ? <span className={badge.className}>{badge.label}</span> : null}
				</div>
			</button>

			{isOpen ? (
				<div className="space-y-4 border-t border-border px-6 py-4">
					{order.withdrawals.length > 0 ? (
						<WithdrawalsStatusPanel withdrawals={order.withdrawals} />
					) : null}
					{blockedByWithdrawal ? (
						<CrossRequestBlockNotice
							title="Odstąpienie od umowy w toku"
							body={`${order.activeWithdrawal?.statusLabel ?? "Wniosek"} — na tym zamówieniu nie można równolegle złożyć reklamacji.`}
							linkHref="/odstapienie"
							linkLabel="Przejdź do odstąpienia od umowy"
						/>
					) : null}
					{order.claims.length > 0 ? <ClaimsStatusPanel claims={order.claims} /> : null}

					{!canSubmitNewClaim ? <OrderItemsWithCaseTags order={order} /> : null}

					{canSubmitNewClaim ? (
						<form onSubmit={handleSubmitClaim} className="space-y-4" noValidate>
							<OrderLineItemPicker
								orderId={order.id}
								items={order.items}
								selectedIds={selectedItems}
								onChange={setSelectedItems}
								excludedIds={excludedLineItems}
								disabled={submitting}
								legend="Którego produktu dotyczy reklamacja?"
								singleItemHint="Reklamacja dotyczy produktu:"
							/>
							{successRef ? (
								<div
									role="status"
									className="rounded-lg border border-terracotta/30 bg-terracotta/10 px-4 py-3 text-sm text-foreground"
								>
									<p className="font-medium">Reklamacja przyjęta</p>
									<p className="mt-1 text-foreground/80">
										Numer zgłoszenia: <strong>{successRef}</strong>. Potwierdzenie wyślemy na e-mail
										— odpowiemy w ciągu 14 dni.
									</p>
								</div>
							) : null}

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
									htmlFor={`claim-desc-${order.id}`}
									className="mb-1.5 block text-sm font-medium"
								>
									Opis niezgodności
								</label>
								<textarea
									id={`claim-desc-${order.id}`}
									value={description}
									onChange={(e) => setDescription(e.target.value)}
									placeholder="Co jest nie tak, kiedy to stwierdziłeś/-aś? Jeśli masz — opisz uszkodzenie w transporcie."
									rows={4}
									className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
									disabled={submitting}
								/>
								<p className="mt-1 text-xs text-muted-foreground">Min. 20 znaków</p>
							</div>

							<div>
								<label
									htmlFor={`claim-remedy-${order.id}`}
									className="mb-1.5 block text-sm font-medium"
								>
									Żądanie
								</label>
								<select
									id={`claim-remedy-${order.id}`}
									value={remedy}
									onChange={(e) => {
										const v = e.target.value;
										if (v === "repair" || v === "price_reduction" || v === "withdrawal") {
											setRemedy(v);
										}
									}}
									className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm"
									disabled={submitting}
								>
									<option value="" disabled>
										Wybierz…
									</option>
									{REMEDY_OPTIONS.map((opt) => (
										<option key={opt.value} value={opt.value}>
											{opt.label}
										</option>
									))}
								</select>
							</div>

							{needsBank ? (
								<div>
									<label
										htmlFor={`claim-iban-${order.id}`}
										className="mb-1.5 block text-sm font-medium"
									>
										Numer rachunku (IBAN)
									</label>
									<input
										id={`claim-iban-${order.id}`}
										type="text"
										value={bankAccount}
										onChange={(e) => setBankAccount(e.target.value)}
										placeholder="PL00 0000 0000 0000 0000 0000 0000"
										className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm"
										disabled={submitting}
									/>
								</div>
							) : null}

							<Button type="submit" disabled={submitting} className="w-full">
								{submitting ? "Wysyłamy reklamację…" : "Złóż reklamację"}
							</Button>
						</form>
					) : blockedByWithdrawal ? (
						<p className="text-sm text-muted-foreground">
							Trwa odstąpienie od umowy — reklamacji na to samo zamówienie nie można złożyć
							równolegle.
						</p>
					) : order.activeClaim ? (
						<p className="text-sm text-muted-foreground">
							Na tym zamówieniu trwa reklamacja — status widzisz powyżej. O zmianach poinformujemy
							też e-mailem.
						</p>
					) : (
						<p className="text-sm text-muted-foreground">
							Upłynęły 2 lata od wydania towaru — zgodnie z ustawą reklamacji w tym okresie nie
							można już złożyć.
						</p>
					)}
				</div>
			) : null}
		</div>
	);
}
