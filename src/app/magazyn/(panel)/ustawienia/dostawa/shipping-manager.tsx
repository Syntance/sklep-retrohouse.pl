"use client";

import { Pencil, Truck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import type { AdminShippingOption } from "@/lib/admin/shipping-options";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import { toggleShippingOptionAction } from "./actions";
import { ShippingOptionForm } from "./shipping-option-form";

type Props = {
	options: AdminShippingOption[];
};

export function ShippingManager({ options }: Props) {
	const router = useRouter();
	const [error, setError] = useState<string | null>(null);
	const [pendingId, setPendingId] = useState<string | null>(null);
	const [editing, setEditing] = useState<AdminShippingOption | null>(null);
	const [isPending, startTransition] = useTransition();

	function handleToggle(option: AdminShippingOption, enabled: boolean) {
		setError(null);
		setPendingId(option.id);
		startTransition(async () => {
			const result = await toggleShippingOptionAction({
				optionId: option.id,
				enabled,
			});
			setPendingId(null);
			if (!result.ok) {
				setError(result.error);
				return;
			}
			router.refresh();
		});
	}

	function handleSaved() {
		setEditing(null);
		router.refresh();
	}

	return (
		<div className="flex flex-col gap-6">
			<div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
				<p>
					Metody są zsynchronizowane z Medusą. Edytuj nazwę, cenę i opis — zmiany trafiają od razu
					do checkoutu. Wyłączenie ukrywa metodę klientom w sklepie.
				</p>
			</div>

			{error ? (
				<p className="text-sm text-destructive" role="alert">
					{error}
				</p>
			) : null}

			{editing ? (
				<ShippingOptionForm
					option={editing}
					onCancel={() => setEditing(null)}
					onSaved={handleSaved}
				/>
			) : null}

			{options.length === 0 ? (
				<div className="rounded-xl border border-dashed border-border px-6 py-10 text-center">
					<p className="text-sm text-muted-foreground">
						Brak skonfigurowanych metod dostawy. Skonfiguruj fulfillment provider i shipping
						options w Medusie.
					</p>
				</div>
			) : (
				<ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
					{options.map((option) => {
						const rowPending = isPending && pendingId === option.id;
						const isEditingThis = editing?.id === option.id;
						if (isEditingThis) return null;

						return (
							<li
								key={option.id}
								className="flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
							>
								<div className="flex min-w-0 flex-1 items-start gap-3">
									<div
										className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground"
										aria-hidden
									>
										<Truck className="size-4" />
									</div>
									<div className="min-w-0">
										<div className="flex flex-wrap items-center gap-2">
											<span className="font-medium text-foreground">{option.name}</span>
											<span
												className={cn(
													"rounded-full px-2 py-0.5 text-[0.65rem] font-medium",
													option.checkoutEnabled
														? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
														: "bg-muted text-muted-foreground",
												)}
											>
												{option.checkoutEnabled ? "w sklepie" : "wyłączone"}
											</span>
										</div>
										<p className="mt-1 text-sm text-muted-foreground">
											{formatPrice(option.priceMajor)}
											{option.typeLabel ? ` · ${option.typeLabel}` : null}
											{option.typeCode ? ` (${option.typeCode})` : null}
										</p>
										{option.typeDescription ? (
											<p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
												{option.typeDescription}
											</p>
										) : null}
									</div>
								</div>

								<div className="flex flex-wrap items-center gap-3 sm:shrink-0">
									<Button
										type="button"
										variant="outline"
										size="sm"
										onClick={() => {
											setEditing(option);
											setError(null);
										}}
									>
										<Pencil className="size-4" aria-hidden />
										Edytuj
									</Button>

									<label htmlFor={`shipping-${option.id}`} className="text-sm text-muted-foreground">
										W checkoutcie
									</label>
									<Switch
										id={`shipping-${option.id}`}
										checked={option.checkoutEnabled}
										disabled={rowPending}
										onCheckedChange={(checked) => handleToggle(option, checked)}
										aria-label={`${option.checkoutEnabled ? "Wyłącz" : "Włącz"} ${option.name} w checkoutcie`}
									/>
								</div>
							</li>
						);
					})}
				</ul>
			)}
		</div>
	);
}
