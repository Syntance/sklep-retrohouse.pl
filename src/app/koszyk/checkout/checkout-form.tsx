"use client";

import { useEffect, useId, useRef, useState } from "react";
import { CheckIcon, ShieldIcon } from "@/components/icons";
import { CheckboxInput } from "@/components/ui/checkbox-input";
import { RadioInput } from "@/components/ui/radio-input";
import { track } from "@/lib/analytics/posthog";
import type {
	CheckoutStep,
	PaymentMethod,
	ShippingMethod,
} from "@/lib/analytics/events";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/lib/products/types";
import type { OrderAcceptance } from "@/lib/order-acceptance";
import { AcceptanceStep } from "./acceptance-step";
import { CheckoutSectionFieldset } from "./checkout-section-fieldset";

type CheckoutFormProps = {
	items: Product[];
	subtotal: number;
};

const SHIPPING_OPTIONS: Array<{
	value: ShippingMethod;
	radio: string;
	title: string;
	description: string;
	price: string;
	defaultChecked?: boolean;
}> = [
	{
		value: "inpost",
		radio: "paczkomat",
		title: "InPost Paczkomaty",
		description: "2–3 dni robocze · domyślny wybór",
		price: "19 zł",
		defaultChecked: true,
	},
	{
		value: "dpd",
		radio: "kurier-dpd",
		title: "Kurier DPD",
		description: "1–2 dni robocze · standardowe gabaryty",
		price: "29 zł",
	},
	{
		value: "dhl",
		radio: "kurier-dhl",
		title: "Kurier DHL",
		description: "1–2 dni robocze · większe gabaryty",
		price: "39 zł",
	},
	{
		value: "pickup_nt",
		radio: "odbior-nt",
		title: "Odbiór osobisty w Nowym Targu",
		description: "Tego samego dnia, po wcześniejszym kontakcie",
		price: "0 zł",
	},
];

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

export function CheckoutForm({ items, subtotal }: CheckoutFormProps) {
	const total = subtotal;
	const formId = useId();
	const [shipping, setShipping] = useState<ShippingMethod>("inpost");
	const [payment, setPayment] = useState<PaymentMethod>("blik");
	const [invoice, setInvoice] = useState(false);
	const [nipFilled, setNipFilled] = useState(false);
	const [acceptance, setAcceptance] = useState<OrderAcceptance | null>(null);
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

	const handleShippingChange = (method: ShippingMethod) => {
		setShipping(method);
		track({ name: "shipping_selected", properties: { method } });
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

	useEffect(() => {
		// Pierwszy event po mount: domyślne `inpost` + `blik`. Bez tego
		// PostHog nie widzi wyboru, gdy user nic nie zmienia.
		track({ name: "shipping_selected", properties: { method: "inpost" } });
		track({ name: "payment_selected", properties: { method: "blik" } });
		// Brak deps — strzelamy raz przy mount.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<form
			action="/api/checkout"
			method="post"
			id={formId}
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
				<CheckoutSectionFieldset
					step={1}
					title="Dane dostawy"
					eyebrow="Wysyłka"
					dataStep="data"
				>
					<div className="grid gap-4 sm:grid-cols-2">
						<TextField label="Imię" name="firstName" required />
						<TextField label="Nazwisko" name="lastName" required />
						<TextField label="E-mail" name="email" type="email" required />
						<TextField label="Telefon" name="phone" type="tel" required />
						<TextField
							label="Ulica i numer"
							name="address"
							required
							className="sm:col-span-2"
						/>
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
								<TextField
									label="Nazwa firmy"
									name="companyName"
									className="sm:col-span-2"
								/>
							</div>
						</div>
					) : null}
				</CheckoutSectionFieldset>

				<CheckoutSectionFieldset step={2} title="Wybór dostawy" eyebrow="Logistyka">
					{SHIPPING_OPTIONS.map((option) => (
						<RadioCard
							key={option.value}
							name="shipping"
							value={option.radio}
							title={option.title}
							description={option.description}
							price={option.price}
							checked={shipping === option.value}
							onSelect={() => handleShippingChange(option.value)}
						/>
					))}
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
							<dd className="tabular">obliczana wyżej</dd>
						</div>
					</dl>
					<div className="mt-4 flex items-baseline justify-between border-t border-border pt-4">
						<dt className="font-display text-lg">Razem</dt>
						<dd className="font-display text-3xl font-semibold tabular">{formatPrice(total)}</dd>
					</div>
				</div>

				{/* Acceptance payload przekazywany do action jako JSON */}
				{acceptance ? (
					<input
						type="hidden"
						name="acceptance"
						value={JSON.stringify(acceptance)}
					/>
				) : null}
				<button
					type="submit"
					disabled={!acceptance}
					aria-disabled={!acceptance}
					className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-terracotta px-6 text-sm font-semibold uppercase tracking-[0.08em] text-terracotta-foreground shadow-md transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
				>
					<ShieldIcon className="size-4 text-brass" />
					Zapłać bezpiecznie
				</button>
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
						Cart abandonment email po 1h od porzucenia koszyka
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
