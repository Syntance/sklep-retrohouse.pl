"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import {
	CreateReturnSchema,
	type CreateReturnInput,
} from "@/lib/validation/returns";
import type { CustomerOrder } from "@/lib/customer/orders";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/format";

type Props = {
	token: string;
	onLogout: () => void;
};

export function CustomerOrders({ token, onLogout }: Props) {
	const [orders, setOrders] = useState<CustomerOrder[]>([]);
	const [loading, setLoading] = useState(true);
	const [selectedOrder, setSelectedOrder] = useState<string | null>(null);

	useEffect(() => {
		fetchOrders();
	}, []);

	async function fetchOrders() {
		console.log("[fetchOrders] Fetching with token:", token.slice(0, 20) + "...");
		try {
			const res = await fetch("/api/customer/orders", {
				headers: { Authorization: `Bearer ${token}` },
			});
			const json = await res.json();
			console.log("[fetchOrders] Response:", json);

			if (json.ok) {
				setOrders(json.orders);
				console.log("[fetchOrders] Loaded orders:", json.orders.length);
			} else {
				toast.error("Nie udało się pobrać zamówień");
			}
		} catch (error) {
			console.error("[fetchOrders] Error:", error);
			toast.error("Błąd połączenia");
		} finally {
			setLoading(false);
		}
	}

	if (loading) {
		return <div className="text-center py-12">Ładowanie zamówień...</div>;
	}

	if (orders.length === 0) {
		return (
			<div className="rounded-2xl border border-border bg-card p-6 text-center">
				<p className="text-muted-foreground">Nie znaleziono zamówień dla tego adresu email.</p>
				<Button onClick={onLogout} variant="outline" className="mt-4">
					Wyloguj się
				</Button>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h2 className="font-display text-2xl font-semibold">Twoje zamówienia</h2>
				<Button onClick={onLogout} variant="outline" size="sm">
					Wyloguj się
				</Button>
			</div>

			<div className="space-y-4">
				{orders.map((order) => (
					<OrderCard
						key={order.id}
						order={order}
						token={token}
						isOpen={selectedOrder === order.id}
						onToggle={() => setSelectedOrder(selectedOrder === order.id ? null : order.id)}
					/>
				))}
			</div>
		</div>
	);
}

function OrderCard({
	order,
	token,
	isOpen,
	onToggle,
}: {
	order: CustomerOrder;
	token: string;
	isOpen: boolean;
	onToggle: () => void;
}) {
	const [submitting, setSubmitting] = useState(false);
	const [selectedItems, setSelectedItems] = useState<string[]>([]);
	const [reason, setReason] = useState("");

	const canReturn = order.canReturn;
	const daysLeft = order.daysLeftToReturn;

	async function handleSubmitReturn() {
		if (selectedItems.length === 0) {
			toast.error("Wybierz przynajmniej jeden produkt");
			return;
		}
		if (reason.trim().length < 10) {
			toast.error("Podaj powód zwrotu (min. 10 znaków)");
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
					reason,
				}),
			});

			const json = await res.json();

			if (json.ok) {
				toast.success("Wniosek o zwrot został wysłany");
				setSelectedItems([]);
				setReason("");
				onToggle();
			} else {
				toast.error(json.error ?? "Nie udało się wysłać wniosku");
			}
		} catch {
			toast.error("Błąd połączenia");
		} finally {
			setSubmitting(false);
		}
	}

	return (
		<div className="rounded-xl border border-border bg-card overflow-hidden">
			<button
				type="button"
				onClick={onToggle}
				className="w-full px-6 py-4 text-left hover:bg-muted/50 transition-colors"
			>
				<div className="flex items-start justify-between gap-4">
					<div>
						<p className="font-semibold">Zamówienie #{order.displayId}</p>
						<p className="text-sm text-muted-foreground mt-0.5">
							{new Date(order.createdAt).toLocaleDateString("pl-PL")} · {order.itemCount}{" "}
							{order.itemCount === 1 ? "produkt" : "produkty"} · {formatCurrency(order.total)}
						</p>
					</div>

					<div className="text-right">
						{canReturn ? (
							<span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-0.5 text-xs font-medium text-success">
								Możesz zwrócić ({daysLeft} {daysLeft === 1 ? "dzień" : "dni"})
							</span>
						) : (
							<span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
								Upłynął termin
							</span>
						)}
					</div>
				</div>
			</button>

			{isOpen && (
				<div className="border-t border-border px-6 py-4 space-y-4">
					<div>
						<p className="text-sm font-medium mb-3">Produkty w zamówieniu:</p>
						<div className="space-y-2">
							{order.items.map((item) => (
								<label
									key={item.id}
									className="flex items-center gap-3 p-3 rounded-lg border border-input hover:bg-muted/30 cursor-pointer"
								>
									<input
										type="checkbox"
										checked={selectedItems.includes(item.id)}
										onChange={(e) => {
											if (e.target.checked) {
												setSelectedItems([...selectedItems, item.id]);
											} else {
												setSelectedItems(selectedItems.filter((id) => id !== item.id));
											}
										}}
										disabled={!canReturn || submitting}
										className="size-4"
									/>

									{item.thumbnail && (
										<Image
											src={item.thumbnail}
											alt={item.title}
											width={48}
											height={48}
											className="rounded object-cover"
										/>
									)}

									<div className="flex-1 min-w-0">
										<p className="text-sm font-medium truncate">{item.title}</p>
										<p className="text-xs text-muted-foreground">
											{formatCurrency(item.unitPrice)} × {item.quantity}
										</p>
									</div>
								</label>
							))}
						</div>
					</div>

					{canReturn && (
						<>
							<div>
								<label htmlFor={`reason-${order.id}`} className="block text-sm font-medium mb-1.5">
									Powód zwrotu
								</label>
								<textarea
									id={`reason-${order.id}`}
									value={reason}
									onChange={(e) => setReason(e.target.value)}
									placeholder="Np. Produkt nie spełnił moich oczekiwań..."
									rows={3}
									className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
									disabled={submitting}
								/>
								<p className="mt-1 text-xs text-muted-foreground">Min. 10 znaków</p>
							</div>

							<Button
								onClick={handleSubmitReturn}
								disabled={submitting || selectedItems.length === 0}
								className="w-full"
							>
								{submitting ? "Wysyłanie..." : "Złóż wniosek o zwrot"}
							</Button>
						</>
					)}

					{!canReturn && (
						<p className="text-sm text-muted-foreground">
							Termin na odstąpienie od umowy (14 dni) upłynął dla tego zamówienia.
						</p>
					)}
				</div>
			)}
		</div>
	);
}
