"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { CheckIcon, ShieldIcon } from "@/components/icons";
import { CheckboxInput } from "@/components/ui/checkbox-input";
import { RadioInput } from "@/components/ui/radio-input";
import type { CheckoutStep, PaymentMethod, ShippingMethod } from "@/lib/analytics/events";
import { track } from "@/lib/analytics/posthog";
import { useCartStore } from "@/lib/cart/store";
import type { CheckoutShippingOption } from "@/lib/checkout/shipping-options";
import { formatPrice } from "@/lib/format";
import type { OrderAcceptance } from "@/lib/order-acceptance";
import type { Product } from "@/lib/products/types";
import { AcceptanceStep } from "./acceptance-step";
import { CheckoutSectionFieldset } from "./checkout-section-fieldset";

type CheckoutFormProps = {
	items: Product[];
	subtotal: number;
	/** Metody wysyłki z Medusy — nazwa, opis i cena ustawiane w /magazyn. */
	shippingOptions: CheckoutShippingOption[];
};

const PICKUP_NAME_RE = /odbiór|odbior|pickup/i;

/** Rodzaj metody na potrzeby analityki — sama wysyłka jedzie po `id`. */
function shippingKind(option: CheckoutShippingOption): ShippingMethod {
	return PICKUP_NAME_RE.test(option.name) ? "pickup_nt" : "inpost";
}

/**
 * Ceny dostawy bywają groszowe (np. 16,99). Globalne `formatPrice` zaokrągla
 * PLN do pełnych złotych, co pokazywałoby inną kwotę, niż realnie obciąży
 * klienta — tu pokazujemy grosze, gdy występują.
 */
function formatShipping(amount: number): string {
	return Number.isInteger(amount)
		? formatPrice(amount)
		: new Intl.NumberFormat("pl-PL", {
				style: "currency",
				currency: "PLN",
				minimumFractionDigits: 2,
			}).format(amount);
}

const PAYMENT_OPTIONS: Array<{
	value: PaymentMethod;
	title: string;
	description: string;
	price: string;
	defaultChecked?: boolean;
}> = [
	{
		value: "blik",
		title: "BLIK",
		description: "6-cyfrowy kod, błyskawiczna płatność",
		price: "bez prowizji",
		defaultChecked: true,
	},
	{
		value: "card",
		title: "Karta — Visa / Mastercard",
		description: "3-D Secure (SCA) · zapis karty opcjonalny",
		price: "bez prowizji",
	},
	{
		value: "transfer",
		title: "Szybki przelew (Przelewy24)",
		description: "Wszystkie banki w Polsce",
		price: "bez prowizji",
	},
];

export function CheckoutForm({ items, subtotal, shippingOptions }: CheckoutFormProps) {
	const formId = useId();
	const router = useRouter();
	const clearCart = useCartStore((state) => state.clear);
	const [shippingOptionId, setShippingOptionId] = useState<string>(
		shippingOptions[0]?.id ?? "",
	);
	const [payment, setPayment] = useState<PaymentMethod>("blik");
	const [invoice, setInvoice] = useState(false);
	const [nipFilled, setNipFilled] = useState(false);
	const [acceptance, setAcceptance] = useState<OrderAcceptance | null>(null);
	const [submitting, setSubmitting] = useState(false);
	const [submitError, setSubmitError] = useState<string | null>(null);
	const completedRef = useRef<Record<CheckoutStep, boolean>>({
		data: false,
		shipping: false,
		payment: false,
		acceptance: false,
	});

	const handleStepCompleted = (step: CheckoutStep) => {
		if (completedRef.current[step]) return;
		completedRef.current[step] = true;
		track({ name: "checkout_step_completed", properties: { step } });
	};

	const selectedShipping =
		shippingOptions.find((option) => option.id === shippingOptionId) ?? shippingOptions[0];
	// `null` = cennik nieznany (tryb awaryjny). Nie doliczamy zera do sumy —
	// zamiast tego mówimy wprost, że koszt policzy się przy finalizacji.
	const shippingCost = selectedShipping?.pricePln ?? null;
	const total = subtotal + (shippingCost ?? 0);

	const handleShippingChange = (option: CheckoutShippingOption) => {
		setShippingOptionId(option.id);
		track({ name: "shipping_selected", properties: { method: shippingKind(option) } });
		handleStepCompleted("shipping");
	};

	const handlePaymentChange = (method: PaymentMethod) => {
		setPayment(method);
		track({ name: "payment_selected", properties: { method } });
		handleStepCompleted("payment");
	};

	const handleInvoiceToggle = (checked: boolean) => {
		setInvoice(checked);
		if (checked) {
			track({ name: "invoice_requested", properties: { has_nip: nipFilled } });
		}
	};

	const defaultShipping = shippingOptions[0];
	const mountTrackedRef = useRef(false);

	useEffect(() => {
		// Pierwszy event po mount: domyślna metoda + `blik`. Bez tego
		// PostHog nie widzi wyboru, gdy user nic nie zmienia. Ref pilnuje,
		// żeby zmiana propsów nie wystrzeliła eventu drugi raz.
		if (mountTrackedRef.current) return;
		mountTrackedRef.current = true;

		if (defaultShipping) {
			track({ name: "shipping_selected", properties: { method: shippingKind(defaultShipping) } });
		}
		track({ name: "payment_selected", properties: { method: "blik" } });
	}, [defaultShipping]);

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!acceptance || submitting) return;

		const formData = new FormData(event.currentTarget);
		const value = (name: string) => String(formData.get(name) ?? "").trim();

		const payload = {
			items: items.map((item) => item.slug),
			firstName: value("firstName"),
			lastName: value("lastName"),
			email: value("email"),
			phone: value("phone"),
			address: value("address"),
			postal: value("postal"),
			city: value("city"),
			shipping: selectedShipping ? shippingKind(selectedShipping) : "inpost",
			shippingOptionId,
			payment,
			invoice,
			nip: value("nip"),
			companyName: value("companyName"),
			promoCode: value("promoCode") || undefined,
		};

		setSubmitting(true);
		setSubmitError(null);

		try {
			const response = await fetch("/api/checkout", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});
			const data = (await response.json()) as {
				ok: boolean;
				error?: string;
				displayId?: number;
			};

			if (!response.ok || !data.ok) {
				setSubmitError(data.error ?? "Nie udało się złożyć zamówienia. Spróbuj ponownie.");
				setSubmitting(false);
				return;
			}

			clearCart();
			router.push(data.displayId ? `/dziekujemy?order=${data.displayId}` : "/dziekujemy");
		} catch {
			setSubmitError("Błąd połączenia. Sprawdź internet i spróbuj ponownie.");
			setSubmitting(false);
		}
	};

	return (
		<form
			id={formId}
			onSubmit={handleSubmit}
			className="mt-10 grid gap-10 lg:grid-cols-[1.4fr_1fr]"
			onBlur={(event) => {
				// Po opuszczeniu sekcji "dane" — emit `checkout_step_completed`.
				const target = event.relatedTarget;
				const dataFieldset = event.currentTarget.querySelector<HTMLFieldSetElement>(
					"fieldset[data-step='data']",
				);
				if (!dataFieldset || !target) return;
				if (!dataFieldset.contains(target as Node)) {
					handleStepCompleted("data");
				}
			}}
		>
			<div className="space-y-10">
				<CheckoutSectionFieldset step={1} title="Dane dostawy" eyebrow="Wysyłka" dataStep="data">
					<div className="grid gap-4 sm:grid-cols-2">
						<TextField label="Imię" name="firstName" required />
						<TextField label="Nazwisko" name="lastName" required />
						<TextField label="E-mail" name="email" type="email" required />
						<TextField label="Telefon" name="phone" type="tel" required />
						<TextField label="Ulica i numer" name="address" required className="sm:col-span-2" />
						<TextField label="Kod pocztowy" name="postal" required />
						<TextField label="Miasto" name="city" required />
					</div>
					<label className="mt-4 flex items-center gap-2 text-sm">
						<CheckboxInput
							name="invoice"
							checked={invoice}
							onChange={(event) => handleInvoiceToggle(event.target.checked)}
						/>
						<span>Chcę fakturę VAT (B2B)</span>
					</label>
					{invoice ? (
						<div className="mt-3 rounded-xl border border-border bg-card p-4 text-sm">
							<p className="font-semibold">Dane do faktury</p>
							<div className="mt-3 grid gap-4 sm:grid-cols-2">
								<TextField
									label="NIP"
									name="nip"
									onChange={(value) => setNipFilled(value.trim().length === 10)}
								/>
								<TextField label="Nazwa firmy" name="companyName" className="sm:col-span-2" />
							</div>
						</div>
					) : null}
				</CheckoutSectionFieldset>

				<CheckoutSectionFieldset step={2} title="Wybór dostawy" eyebrow="Logistyka">
					{shippingOptions.length === 0 ? (
						<p
							role="alert"
							className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"
						>
							Chwilowo nie możemy pobrać metod dostawy. Odśwież stronę lub napisz do nas — nie
							chcemy, żebyś zapłacił za złą opcję.
						</p>
					) : (
						shippingOptions.map((option) => (
							<RadioCard
								key={option.id}
								name="shippingOption"
								value={option.id}
								title={option.name}
								description={option.description ?? ""}
								price={option.pricePln === null ? "wg cennika" : formatShipping(option.pricePln)}
								checked={shippingOptionId === option.id}
								onSelect={() => handleShippingChange(option)}
							/>
						))
					)}
				</CheckoutSectionFieldset>

				<CheckoutSectionFieldset step={3} title="Płatność" eyebrow="Bezpieczne 256-bit">
					{PAYMENT_OPTIONS.map((option) => (
						<RadioCard
							key={option.value}
							name="payment"
							value={option.value}
							title={option.title}
							description={option.description}
							price={option.price}
							checked={payment === option.value}
							onSelect={() => handlePaymentChange(option.value)}
						/>
					))}
				</CheckoutSectionFieldset>

				<AcceptanceStep
					items={items}
					onComplete={(a) => setAcceptance(a)}
					onIncomplete={() => setAcceptance(null)}
				/>
			</div>

			<aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
				<div className="rounded-2xl border border-border bg-card p-6">
					<p className="font-sans text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-brass">
						Podsumowanie
					</p>
					<ul className="mt-4 space-y-3 text-sm">
						{items.map((item) => (
							<li key={item.slug} className="flex items-baseline justify-between gap-3">
								<span className="line-clamp-1 font-medium">{item.name}</span>
								<span className="tabular text-foreground/80">{formatPrice(item.price)}</span>
							</li>
						))}
					</ul>
					<dl className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
						<div className="flex items-center justify-between">
							<dt>Suma cząstkowa</dt>
							<dd className="tabular">{formatPrice(subtotal)}</dd>
						</div>
						<div className="flex items-center justify-between">
							<dt>Wysyłka</dt>
							<dd className="tabular">
								{!selectedShipping
									? "wybierz metodę"
									: shippingCost === null
										? "wg cennika"
										: formatShipping(shippingCost)}
							</dd>
						</div>
					</dl>
					{shippingCost === null && selectedShipping ? (
						<p className="mt-2 text-xs text-foreground/60">
							Koszt wysyłki doliczymy przy finalizacji — potwierdzimy go przed pobraniem
							płatności.
						</p>
					) : null}
					<div className="mt-4 border-t border-border pt-4">
						<TextField label="Kod promocyjny" name="promoCode" />
						<p className="mt-1.5 text-xs text-foreground/60">
							Rabat naliczymy przy finalizacji zamówienia.
						</p>
					</div>
					<div className="mt-4 flex items-baseline justify-between border-t border-border pt-4">
						<dt className="font-display text-lg">Razem</dt>
						<dd className="font-display text-3xl font-semibold tabular">{formatPrice(total)}</dd>
					</div>
				</div>

				{/* Acceptance payload przekazywany do action jako JSON */}
				{acceptance ? (
					<input type="hidden" name="acceptance" value={JSON.stringify(acceptance)} />
				) : null}
				<button
					type="submit"
					disabled={!acceptance || submitting || !selectedShipping}
					aria-disabled={!acceptance || submitting || !selectedShipping}
					className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-terracotta px-6 text-sm font-semibold uppercase tracking-[0.08em] text-terracotta-foreground shadow-md transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
				>
					<ShieldIcon className="size-4 text-brass" />
					{submitting ? "Składanie zamówienia…" : "Zapłać bezpiecznie"}
				</button>
				{submitError ? (
					<p
						role="alert"
						className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-center text-sm text-destructive"
					>
						{submitError}
					</p>
				) : null}
				<ul className="space-y-2 rounded-2xl border border-border bg-cream p-4 text-xs text-foreground/70">
					<li className="flex items-start gap-2">
						<CheckIcon className="size-4 text-brass" />
						Brak rejestracji — kupujesz jako gość
					</li>
					<li className="flex items-start gap-2">
						<CheckIcon className="size-4 text-brass" />
						Dane chronione przez Przelewy24 (PCI-DSS)
					</li>
					<li className="flex items-start gap-2">
						<CheckIcon className="size-4 text-brass" />
						Cart abandonment e-mail po 1h od porzucenia koszyka
					</li>
				</ul>
			</aside>
		</form>
	);
}

function TextField({
	label,
	name,
	type = "text",
	required,
	className,
	onChange,
}: {
	label: string;
	name: string;
	type?: string;
	required?: boolean;
	className?: string;
	onChange?: (value: string) => void;
}) {
	const id = useId();
	return (
		<label htmlFor={id} className={className}>
			<span className="text-xs font-semibold uppercase tracking-[0.14em] text-foreground/60">
				{label} {required ? <span aria-hidden>*</span> : null}
			</span>
			<input
				id={id}
				name={name}
				type={type}
				required={required}
				onChange={onChange ? (event) => onChange(event.target.value) : undefined}
				className="mt-2 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm focus-visible:border-terracotta focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta"
			/>
		</label>
	);
}

function RadioCard({
	name,
	value,
	title,
	description,
	price,
	checked,
	onSelect,
}: {
	name: string;
	value: string;
	title: string;
	description: string;
	price: string;
	checked: boolean;
	onSelect: () => void;
}) {
	return (
		<label
			className={`flex cursor-pointer items-start justify-between gap-3 rounded-xl border bg-background p-4 transition-colors ${
				checked ? "border-terracotta bg-cream shadow-md" : "border-border"
			}`}
		>
			<span className="flex items-start gap-3">
				<RadioInput
					name={name}
					value={value}
					checked={checked}
					onChange={onSelect}
					className="mt-1"
				/>
				<span>
					<span className="block font-semibold">{title}</span>
					<span className="mt-0.5 block text-sm text-foreground/70">{description}</span>
				</span>
			</span>
			<span className="font-semibold tabular">{price}</span>
		</label>
	);
}
