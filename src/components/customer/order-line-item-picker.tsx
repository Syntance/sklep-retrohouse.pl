"use client";

import { useEffect, useId } from "react";
import { MedusaOrderImage } from "@/components/customer/medusa-order-image";
import type { CustomerOrder } from "@/lib/customer/orders";
import { formatPrice } from "@/lib/format";

type OrderLine = CustomerOrder["items"][number];

type Props = {
	orderId: string;
	items: OrderLine[];
	selectedIds: string[];
	onChange: (ids: string[]) => void;
	excludedIds: Set<string>;
	disabled?: boolean;
	/** Nagłówek sekcji wyboru (np. reklamacja vs odstąpienie). */
	legend: string;
	/** Gdy jeden produkt do wyboru — krótszy opis. */
	singleItemHint?: string;
};

export function OrderLineItemPicker({
	orderId,
	items,
	selectedIds,
	onChange,
	excludedIds,
	disabled = false,
	legend,
	singleItemHint = "Ta sprawa dotyczy produktu:",
}: Props) {
	const groupName = useId();
	const eligible = items.filter((item) => !excludedIds.has(item.id));
	const requireExplicitPick = eligible.length > 1;

	useEffect(() => {
		if (disabled || eligible.length !== 1) return;
		if (selectedIds.length === 0) {
			onChange([eligible[0].id]);
		}
	}, [disabled, eligible, onChange, selectedIds.length]);

	if (eligible.length === 0) {
		return (
			<p className="text-sm text-muted-foreground">
				Wszystkie produkty z tego zamówienia są już objęte inną reklamacją lub odstąpieniem.
			</p>
		);
	}

	if (!requireExplicitPick && eligible.length === 1) {
		const item = eligible[0];
		return (
			<div>
				<p className="mb-2 text-sm font-medium text-foreground">{singleItemHint}</p>
				<OrderLineRow item={item} />
			</div>
		);
	}

	return (
		<fieldset disabled={disabled} className="space-y-2">
			<legend className="mb-2 text-sm font-medium text-foreground">{legend}</legend>
			<p className="mb-3 text-xs text-muted-foreground">
				Wybierz jeden produkt z zamówienia — wniosek dotyczy wyłącznie tej pozycji.
			</p>
			<div className="space-y-2">
				{eligible.map((item) => (
					<label
						key={item.id}
						className="flex cursor-pointer items-center gap-3 rounded-lg border border-input p-3 has-[:checked]:border-terracotta has-[:checked]:bg-terracotta/5 hover:bg-muted/30"
					>
						<input
							type="radio"
							name={`${groupName}-${orderId}`}
							className="size-4 shrink-0"
							checked={selectedIds[0] === item.id}
							onChange={() => onChange([item.id])}
						/>
						<OrderLineRow item={item} />
					</label>
				))}
			</div>
		</fieldset>
	);
}

function OrderLineRow({ item }: { item: OrderLine }) {
	return (
		<>
			{item.thumbnail ? (
				<MedusaOrderImage
					src={item.thumbnail}
					alt={item.title}
					width={48}
					height={48}
					className="size-12"
				/>
			) : (
				<div
					className="flex size-12 shrink-0 items-center justify-center rounded border border-border bg-muted text-xs text-muted-foreground"
					aria-hidden
				>
					—
				</div>
			)}
			<div className="min-w-0 flex-1">
				<p className="truncate text-sm font-medium">{item.title}</p>
				<p className="text-xs text-muted-foreground">
					{formatPrice(item.unitPrice)} × {item.quantity}
				</p>
			</div>
		</>
	);
}
