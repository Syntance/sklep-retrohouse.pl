"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useForm, type UseFormRegisterReturn } from "react-hook-form";
import { PaymentSelector } from "@/components/checkout/PaymentSelector";
import { CheckIcon, ShieldIcon } from "@/components/icons";
import { CheckboxInput } from "@/components/ui/checkbox-input";
import { RadioInput } from "@/components/ui/radio-input";
import { track } from "@/lib/analytics/posthog";
import type { CheckoutStep, ShippingMethod } from "@/lib/analytics/events";
import { useCartStore } from "@/lib/cart/store";
import { calculateCheckoutTotal } from "@/lib/checkout/calculate-total";
import { generateIdempotencyKey } from "@/lib/checkout/idempotency";
import { lookupCity } from "@/lib/checkout/postal-code-lookup";
import { SHIPPING_OPTIONS } from "@/lib/checkout/shipping-options";
import { formatCurrency } from "@/lib/format";
import { TPAY_PROVIDER_ID } from "@/lib/medusa/checkout-helpers";
import type { OrderAcceptance } from "@/lib/order-acceptance";
import type { Product } from "@/lib/products/types";
import { CheckoutSchema, type CheckoutInput } from "@/lib/validation/checkout";
import { AcceptanceStep } from "./acceptance-step";
import { CheckoutSectionFieldset } from "./checkout-section-fieldset";

type CheckoutFormProps = {
	items: Product[];
};

export function CheckoutForm({ items }: CheckoutFormProps) {
	const formId = useId();
	const router = useRouter();
	const clearCart = useCartStore((state) => state.clear);
	const idempotencyKeyRef = useRef(generateIdempotencyKey());
	const [acceptance, setAcceptance] = useState<OrderAcceptance | null>(null);
	const [submitError, setSubmitError] = useState<string | null>(null);
	const [nipFilled, setNipFilled] = useState(false);
	const completedRef = useRef<Record<CheckoutStep, boolean>>({
		data: false,
		shipping: false,
		payment: false,
		acceptance: false,
	});

	const {
		register,
		handleSubmit,
		watch,
		setValue,
		formState: { errors, isSubmitting },
	} = useForm<CheckoutInput>({
		resolver: zodResolver(CheckoutSchema),
		defaultValues: {
			items: items.map((item) => item.slug),
			firstName: "",
			lastName: "",
			email: "",
			phone: "",
			address: "",
			postal: "",
			city: "",
			shipping: "inpost",
			payment_provider_id: TPAY_PROVIDER_ID,
			invoice: false,
			nip: "",
			companyName: "",
		},
	});

	const shipping = watch("shipping");
	const paymentProviderId = watch("payment_provider_id");
	const invoice = watch("invoice");
	const postalCode = watch("postal");

	const { subtotalInCents, shippingInCents, totalInCents } = useMemo(
		() => calculateCheckoutTotal(items, shipping),
		[items, shipping],
	);

	useEffect(() => {
		setValue(
			"items",
			items.map((item) => item.slug),
		);
	}, [items, setValue]);

	useEffect(() => {
		track({ name: "shipping_selected", properties: { method: "inpost" } });
		track({
			name: "payment_provider_selected",
			properties: { provider_id: TPAY_PROVIDER_ID },
		});
	}, []);

	useEffect(() => {
		const fetchCity = async () => {
			if (!postalCode || postalCode.replace(/\s|-/g, "").length !== 5) return;
			const city = await lookupCity(postalCode);
			if (city) setValue("city", city, { shouldValidate: true });
		};
		void fetchCity();
	}, [postalCode, setValue]);

	const handleStepCompleted = (step: CheckoutStep) => {
		if (completedRef.current[step]) return;
		completedRef.current[step] = true;
		track({ name: "checkout_step_completed", properties: { step } });
	};

	const handleShippingChange = (method: ShippingMethod) => {
		setValue("shipping", method, { shouldValidate: true });
		track({ name: "shipping_selected", properties: { method } });
		handleStepCompleted("shipping");
	};

	const handlePaymentProviderChange = (providerId: string) => {
		setValue(
			"payment_provider_id",
			providerId as CheckoutInput["payment_provider_id"],
			{ shouldValidate: true },
		);
		track({ name: "payment_provider_selected", properties: { provider_id: providerId } });
		handleStepCompleted("payment");
	};

	const handleInvoiceToggle = (checked: boolean) => {
		setValue("invoice", checked);
		if (checked) {
			track({ name: "invoice_requested", properties: { has_nip: nipFilled } });
		}
	};

	const onSubmit = async (data: CheckoutInput) => {
		if (!acceptance || isSubmitting) return;

		setSubmitError(null);

		const payload: CheckoutInput = {
			...data,
			items: items.map((item) => item.slug),
		};

		try {
			const response = await fetch("/api/checkout", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"X-Idempotency-Key": idempotencyKeyRef.current,
				},
				body: JSON.stringify(payload),
			});

			const result = (await response.json()) as {
				ok: boolean;
				error?: string;
				redirect?: boolean;
				url?: string;
				cartId?: string;
				displayId?: number;
			};

			if (!response.ok || !result.ok) {
				setSubmitError(result.error ?? "Nie udało się złożyć zamówienia. Spróbuj ponownie.");
				return;
			}

			clearCart();

			if (result.redirect && result.url) {
				window.location.href = result.url;
				return;
			}

			router.push(
				result.displayId ? `/dziekujemy?order=${result.displayId}` : "/dziekujemy",
			);
		} catch {
			setSubmitError("Błąd połączenia. Sprawdź internet i spróbuj ponownie.");
		}
	};

	return (
		<form
			id={formId}
			onSubmit={handleSubmit(onSubmit)}
			className="mt-10 grid gap-10 lg:grid-cols-[1.4fr_1fr]"
			onBlur={(event) => {
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
						<TextField
							label="Imię"
							autoComplete="given-name"
							error={errors.firstName?.message}
							{...register("firstName")}
							required
						/>
						<TextField
							label="Nazwisko"
							autoComplete="family-name"
							error={errors.lastName?.message}
							{...register("lastName")}
							required
						/>
						<TextField
							label="E-mail"
							type="email"
							autoComplete="email"
							error={errors.email?.message}
							{...register("email")}
							required
						/>
						<TextField
							label="Telefon"
							type="tel"
							autoComplete="tel"
							error={errors.phone?.message}
							{...register("phone")}
							required
						/>
						<TextField
							label="Ulica i numer"
							autoComplete="shipping street-address"
							error={errors.address?.message}
							className="sm:col-span-2"
							{...register("address")}
							required
						/>
						<TextField
							label="Kod pocztowy"
							autoComplete="shipping postal-code"
							error={errors.postal?.message}
							{...register("postal")}
							required
						/>
						<TextField
							label="Miasto"
							autoComplete="shipping address-level2"
							error={errors.city?.message}
							{...register("city")}
							required
						/>
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
									error={errors.nip?.message}
									{...register("nip", {
										onChange: (event) =>
											setNipFilled(event.target.value.trim().length === 10),
									})}
								/>
								<TextField
									label="Nazwa firmy"
									error={errors.companyName?.message}
									className="sm:col-span-2"
									{...register("companyName")}
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
							title={option.label}
							description={option.description}
							price={formatCurrency(option.priceInCents)}
							checked={shipping === option.value}
							onSelect={() => handleShippingChange(option.value)}
						/>
					))}
				</CheckoutSectionFieldset>

				<CheckoutSectionFieldset step={3} title="Płatność" eyebrow="Bezpieczne 256-bit">
					<PaymentSelector
						selectedProviderId={paymentProviderId}
						onSelect={handlePaymentProviderChange}
					/>
					{errors.payment_provider_id ? (
						<p className="mt-2 text-xs text-destructive" role="alert">
							{errors.payment_provider_id.message}
						</p>
					) : null}
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
								<span className="tabular text-foreground/80">
									{formatCurrency(Math.round(item.price * 100))}
								</span>
							</li>
						))}
					</ul>
					<dl className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
						<div className="flex items-center justify-between">
							<dt>Suma cząstkowa</dt>
							<dd className="tabular">{formatCurrency(subtotalInCents)}</dd>
						</div>
						<div className="flex items-center justify-between">
							<dt>Wysyłka</dt>
							<dd className="tabular">{formatCurrency(shippingInCents)}</dd>
						</div>
					</dl>
					<div className="mt-4 flex items-baseline justify-between border-t border-border pt-4">
						<dt className="font-display text-lg">Razem</dt>
						<dd className="font-display text-3xl font-semibold tabular">
							{formatCurrency(totalInCents)}
						</dd>
					</div>
				</div>

				{acceptance ? (
					<input
						type="hidden"
						name="acceptance"
						value={JSON.stringify(acceptance)}
					/>
				) : null}
				<button
					type="submit"
					disabled={!acceptance || isSubmitting}
					aria-disabled={!acceptance || isSubmitting}
					className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-terracotta px-6 text-sm font-semibold uppercase tracking-[0.08em] text-terracotta-foreground shadow-md transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
				>
					<ShieldIcon className="size-4 text-brass" />
					{isSubmitting ? "Składanie zamówienia…" : "Zapłać bezpiecznie"}
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
						Dane chronione przez Tpay (PCI-DSS)
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

type TextFieldProps = {
	label: string;
	error?: string;
	autoComplete?: string;
	type?: string;
	required?: boolean;
	className?: string;
} & UseFormRegisterReturn;

function TextField({
	label,
	error,
	autoComplete,
	type = "text",
	required,
	className,
	name,
	onBlur,
	onChange,
	ref,
}: TextFieldProps) {
	const id = useId();
	const errorId = `${name}-error`;

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
				autoComplete={autoComplete}
				aria-invalid={!!error}
				aria-describedby={error ? errorId : undefined}
				onBlur={onBlur}
				onChange={onChange}
				ref={ref}
				className="mt-2 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm focus-visible:border-terracotta focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta aria-invalid:border-destructive"
			/>
			{error ? (
				<p id={errorId} className="mt-1 text-xs text-destructive" role="alert">
					{error}
				</p>
			) : null}
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
