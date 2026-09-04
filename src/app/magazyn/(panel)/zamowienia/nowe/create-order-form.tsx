"use client";

import { Loader2, Plus, Search, Trash2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { CheckboxInput } from "@/components/ui/checkbox-input";
import { Input } from "@/components/ui/input";
import type {
	ManualOrderSource,
	OrderFormProductOption,
	OrderFormShippingOption,
} from "@/lib/admin/manual-order";
import { formatPrice } from "@/lib/format";
import { createManualOrderAction, searchOrderProductsAction } from "./actions";

type Props = {
	shippingOptions: OrderFormShippingOption[];
	initialProducts: OrderFormProductOption[];
};

const SOURCE_OPTIONS: Array<{ value: ManualOrderSource; label: string }> = [
	{ value: "telefon", label: "Telefon" },
	{ value: "instagram", label: "Instagram" },
	{ value: "email", label: "E-mail" },
	{ value: "inne", label: "Inne" },
];

const inputClass =
	"h-10 w-full rounded-lg border border-input bg-transparent px-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export function CreateOrderForm({ shippingOptions, initialProducts }: Props) {
	const router = useRouter();
	const formId = useId();

	const [items, setItems] = useState<OrderFormProductOption[]>([]);
	const [query, setQuery] = useState("");
	const [results, setResults] = useState<OrderFormProductOption[]>(initialProducts);
	const [searching, setSearching] = useState(false);
	const searchSeq = useRef(0);

	const [email, setEmail] = useState("");
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [phone, setPhone] = useState("");
	const [address1, setAddress1] = useState("");
	const [postalCode, setPostalCode] = useState("");
	const [city, setCity] = useState("");
	const [invoiceRequested, setInvoiceRequested] = useState(false);
	const [companyName, setCompanyName] = useState("");
	const [nip, setNip] = useState("");
	const [orderNotes, setOrderNotes] = useState("");
	const [sourceChannel, setSourceChannel] = useState<ManualOrderSource>("telefon");
	const [shippingOptionId, setShippingOptionId] = useState(shippingOptions[0]?.id ?? "");
	const [sendConfirmationEmail, setSendConfirmationEmail] = useState(true);

	const [error, setError] = useState<string | null>(null);
	const [submitting, startSubmit] = useTransition();
	// Stały przez cały czas życia formularza — ponowienie po timeoucie trafia
	// w to samo zamówienie zamiast tworzyć drugie.
	const idempotencyKey = useId();

	// Debounce wyszukiwarki produktów (server action, sesja weryfikowana serwerowo).
	useEffect(() => {
		const seq = ++searchSeq.current;
		const timer = setTimeout(async () => {
			setSearching(true);
			try {
				const found = await searchOrderProductsAction(query);
				if (searchSeq.current === seq) setResults(found);
			} catch {
				if (searchSeq.current === seq) setResults([]);
			} finally {
				if (searchSeq.current === seq) setSearching(false);
			}
		}, 300);
		return () => clearTimeout(timer);
	}, [query]);

	const selectedVariantIds = useMemo(() => new Set(items.map((item) => item.variantId)), [items]);

	const itemsTotal = useMemo(
		() => items.reduce((sum, item) => sum + (item.pricePln ?? 0), 0),
		[items],
	);
	const shippingPrice = shippingOptions.find((o) => o.id === shippingOptionId)?.pricePln ?? 0;

	function addItem(product: OrderFormProductOption) {
		if (selectedVariantIds.has(product.variantId)) return;
		setItems((prev) => [...prev, product]);
	}

	function removeItem(variantId: string) {
		setItems((prev) => prev.filter((item) => item.variantId !== variantId));
	}

	function handleSubmit() {
		setError(null);
		startSubmit(async () => {
			const result = await createManualOrderAction({
				email,
				firstName,
				lastName,
				phone: phone || undefined,
				address1,
				postalCode,
				city,
				companyName: companyName || undefined,
				nip: nip || undefined,
				orderNotes: orderNotes || undefined,
				sourceChannel,
				shippingOptionId,
				items: items.map((item) => ({
					variantId: item.variantId,
					productTitle: item.title,
				})),
				sendConfirmationEmail,
				invoiceRequested,
				idempotencyKey: `manual-${idempotencyKey}`,
			});
			if (!result.ok || !result.orderId) {
				setError(result.error ?? "Nie udało się utworzyć zamówienia.");
				return;
			}
			router.push(`/magazyn/zamowienia/${result.orderId}`);
			router.refresh();
		});
	}

	return (
		<div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
			<div className="flex flex-col gap-8">
				{/* Pozycje zamówienia */}
				<section className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
					<h2 className="font-serif text-lg text-foreground">Pozycje zamówienia</h2>

					{items.length > 0 ? (
						<ul className="divide-y divide-border rounded-lg border border-border">
							{items.map((item) => (
								<li key={item.variantId} className="flex items-center gap-3 px-3 py-2.5">
									<span className="relative size-10 shrink-0 overflow-hidden rounded-md border border-border bg-muted">
										{item.thumbnail ? (
											<Image
												src={item.thumbnail}
												alt=""
												fill
												sizes="40px"
												className="object-cover"
												unoptimized
											/>
										) : null}
									</span>
									<span className="min-w-0 flex-1">
										<span className="block truncate text-sm font-medium text-foreground">
											{item.title}
										</span>
										<span className="block text-xs text-muted-foreground">
											{item.pricePln != null ? formatPrice(item.pricePln) : "brak ceny"}
										</span>
									</span>
									<button
										type="button"
										onClick={() => removeItem(item.variantId)}
										aria-label={`Usuń ${item.title}`}
										className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-destructive/30"
									>
										<Trash2 className="size-4" aria-hidden />
									</button>
								</li>
							))}
						</ul>
					) : (
						<p className="rounded-lg border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
							Brak pozycji. Wyszukaj i dodaj produkt poniżej.
						</p>
					)}

					<div className="relative">
						<Search
							className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
							aria-hidden
						/>
						<Input
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							placeholder="Szukaj produktu po nazwie…"
							className="h-10 pl-9"
							aria-label="Szukaj produktu"
						/>
					</div>

					<ul className="max-h-64 divide-y divide-border overflow-y-auto rounded-lg border border-border">
						{searching ? (
							<li className="px-3 py-4 text-center text-sm text-muted-foreground">
								<Loader2 className="mx-auto size-4 animate-spin" aria-hidden />
							</li>
						) : results.length === 0 ? (
							<li className="px-3 py-4 text-center text-sm text-muted-foreground">
								Brak wyników.
							</li>
						) : (
							results.map((product) => {
								const added = selectedVariantIds.has(product.variantId);
								return (
									<li key={product.variantId} className="flex items-center gap-3 px-3 py-2.5">
										<span className="relative size-10 shrink-0 overflow-hidden rounded-md border border-border bg-muted">
											{product.thumbnail ? (
												<Image
													src={product.thumbnail}
													alt=""
													fill
													sizes="40px"
													className="object-cover"
													unoptimized
												/>
											) : null}
										</span>
										<span className="min-w-0 flex-1">
											<span className="block truncate text-sm font-medium text-foreground">
												{product.title}
											</span>
											<span className="block text-xs text-muted-foreground">
												{product.pricePln != null ? formatPrice(product.pricePln) : "brak ceny"}
											</span>
										</span>
										<Button
											type="button"
											variant="outline"
											size="sm"
											disabled={added}
											onClick={() => addItem(product)}
										>
											<Plus className="size-4" aria-hidden />
											{added ? "Dodano" : "Dodaj"}
										</Button>
									</li>
								);
							})
						)}
					</ul>
				</section>

				{/* Dane klienta */}
				<section className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
					<h2 className="font-serif text-lg text-foreground">Dane klienta</h2>
					<div className="grid gap-4 sm:grid-cols-2">
						<Field label="Imię" required>
							{(id) => (
								<Input
									id={id}
									value={firstName}
									onChange={(e) => setFirstName(e.target.value)}
									className={inputClass}
									autoComplete="off"
								/>
							)}
						</Field>
						<Field label="Nazwisko" required>
							{(id) => (
								<Input
									id={id}
									value={lastName}
									onChange={(e) => setLastName(e.target.value)}
									className={inputClass}
									autoComplete="off"
								/>
							)}
						</Field>
						<Field label="E-mail" required>
							{(id) => (
								<Input
									id={id}
									type="email"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									className={inputClass}
									autoComplete="off"
								/>
							)}
						</Field>
						<Field label="Telefon">
							{(id) => (
								<Input
									id={id}
									type="tel"
									value={phone}
									onChange={(e) => setPhone(e.target.value)}
									className={inputClass}
									autoComplete="off"
								/>
							)}
						</Field>
						<Field label="Ulica i numer" required className="sm:col-span-2">
							{(id) => (
								<Input
									id={id}
									value={address1}
									onChange={(e) => setAddress1(e.target.value)}
									className={inputClass}
									autoComplete="off"
								/>
							)}
						</Field>
						<Field label="Kod pocztowy (00-000)" required>
							{(id) => (
								<Input
									id={id}
									value={postalCode}
									onChange={(e) => setPostalCode(e.target.value)}
									placeholder="00-000"
									className={inputClass}
									autoComplete="off"
								/>
							)}
						</Field>
						<Field label="Miasto" required>
							{(id) => (
								<Input
									id={id}
									value={city}
									onChange={(e) => setCity(e.target.value)}
									className={inputClass}
									autoComplete="off"
								/>
							)}
						</Field>
					</div>

					<label className="flex items-center gap-2 text-sm">
						<CheckboxInput
							checked={invoiceRequested}
							onChange={(e) => setInvoiceRequested(e.target.checked)}
						/>
						<span>Faktura VAT (B2B)</span>
					</label>
					{invoiceRequested ? (
						<div className="grid gap-4 sm:grid-cols-2">
							<Field label="NIP">
								{(id) => (
									<Input
										id={id}
										value={nip}
										onChange={(e) => setNip(e.target.value)}
										className={inputClass}
										autoComplete="off"
									/>
								)}
							</Field>
							<Field label="Nazwa firmy">
								{(id) => (
									<Input
										id={id}
										value={companyName}
										onChange={(e) => setCompanyName(e.target.value)}
										className={inputClass}
										autoComplete="off"
									/>
								)}
							</Field>
						</div>
					) : null}
				</section>

				{/* Dostawa i źródło */}
				<section className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
					<h2 className="font-serif text-lg text-foreground">Dostawa i źródło</h2>
					<div className="grid gap-4 sm:grid-cols-2">
						<Field label="Metoda dostawy" required>
							{(id) => (
								<select
									id={id}
									value={shippingOptionId}
									onChange={(e) => setShippingOptionId(e.target.value)}
									className={inputClass}
								>
									{shippingOptions.map((option) => (
										<option key={option.id} value={option.id}>
											{option.name} — {formatPrice(option.pricePln)}
										</option>
									))}
								</select>
							)}
						</Field>
						<Field label="Źródło zamówienia">
							{(id) => (
								<select
									id={id}
									value={sourceChannel}
									onChange={(e) => setSourceChannel(e.target.value as ManualOrderSource)}
									className={inputClass}
								>
									{SOURCE_OPTIONS.map((option) => (
										<option key={option.value} value={option.value}>
											{option.label}
										</option>
									))}
								</select>
							)}
						</Field>
					</div>
					<Field label="Notatka do zamówienia">
						{(id) => (
							<textarea
								id={id}
								value={orderNotes}
								onChange={(e) => setOrderNotes(e.target.value)}
								rows={3}
								className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
								placeholder="np. ustalenia telefoniczne, preferowany termin dostawy"
							/>
						)}
					</Field>
					<label className="flex items-center gap-2 text-sm">
						<CheckboxInput
							checked={sendConfirmationEmail}
							onChange={(e) => setSendConfirmationEmail(e.target.checked)}
						/>
						<span>Wyślij klientowi e-mail z potwierdzeniem zamówienia</span>
					</label>
				</section>
			</div>

			{/* Podsumowanie */}
			<aside className="lg:sticky lg:top-6 lg:self-start">
				<div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
					<h2 className="font-serif text-lg text-foreground">Podsumowanie</h2>
					<dl className="space-y-2 text-sm">
						<div className="flex items-center justify-between">
							<dt className="text-muted-foreground">
								Pozycje ({items.length})
							</dt>
							<dd className="font-medium tabular-nums">{formatPrice(itemsTotal)}</dd>
						</div>
						<div className="flex items-center justify-between">
							<dt className="text-muted-foreground">Dostawa</dt>
							<dd className="font-medium tabular-nums">{formatPrice(shippingPrice)}</dd>
						</div>
						<div className="flex items-center justify-between border-t border-border pt-2">
							<dt className="font-medium">Razem</dt>
							<dd className="text-lg font-semibold tabular-nums">
								{formatPrice(itemsTotal + shippingPrice)}
							</dd>
						</div>
					</dl>

					{error ? (
						<p className="text-sm text-destructive" role="alert">
							{error}
						</p>
					) : null}

					<Button
						type="button"
						form={formId}
						onClick={handleSubmit}
						disabled={submitting || items.length === 0}
						className="w-full"
					>
						{submitting ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
						Utwórz zamówienie
					</Button>
					<p className="text-xs text-muted-foreground">
						Zamówienie powstaje jako opłacane przelewem tradycyjnym — status płatności
						zmienisz w szczegółach zamówienia.
					</p>
				</div>
			</aside>
		</div>
	);
}

/** Etykieta + kontrolka powiązane przez `htmlFor`/`id` (render-prop dostarcza id). */
function Field({
	label,
	required,
	className,
	children,
}: {
	label: string;
	required?: boolean;
	className?: string;
	children: (id: string) => React.ReactNode;
}) {
	const id = useId();
	return (
		<div className={`flex flex-col gap-1.5 ${className ?? ""}`}>
			<label htmlFor={id} className="text-sm font-medium text-foreground">
				{label} {required ? <span aria-hidden>*</span> : null}
			</label>
			{children(id)}
		</div>
	);
}
