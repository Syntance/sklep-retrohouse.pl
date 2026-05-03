import type { Metadata } from "next";
import { CheckoutProgress } from "@/components/checkout-progress";
import { CheckIcon, ShieldIcon } from "@/components/icons";
import { Breadcrumbs, Container, CtaLink, Eyebrow, Section } from "@/components/primitives";
import { formatPrice } from "@/lib/format";
import { PRODUCTS } from "@/lib/mock/products";

export const metadata: Metadata = {
	title: "Płatność i dostawa",
	description: "Krok 2 i 3 — adres dostawy, sposób wysyłki i bezpieczna płatność Przelewy24.",
	robots: { index: false, follow: false },
};

const SAMPLE_ITEMS = PRODUCTS.slice(0, 2);

export default function CheckoutPage() {
	const subtotal = SAMPLE_ITEMS.reduce((acc, item) => acc + item.price, 0);
	const total = subtotal;

	return (
		<main id="main" className="flex flex-col">
			<Section spacing="sm">
				<Container size="xl">
					<Breadcrumbs
						items={[
							{ label: "Home", href: "/" },
							{ label: "Koszyk", href: "/koszyk" },
							{ label: "Płatność" },
						]}
					/>
				</Container>
			</Section>

			<Section spacing="md">
				<Container size="xl">
					<div className="mb-10">
						<Eyebrow>Krok 2 z 4 · Dane dostawy</Eyebrow>
						<h1 className="mt-3 font-display text-5xl font-semibold leading-tight md:text-6xl">
							Płatność i dostawa
						</h1>
					</div>

					<CheckoutProgress step={2} />

					<form
						action="/api/checkout"
						method="post"
						className="mt-10 grid gap-10 lg:grid-cols-[1.4fr_1fr]"
					>
						<div className="space-y-10">
							<FieldSet title="Krok 1 · Dane dostawy" eyebrow="Wysyłka">
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
									<input
										type="checkbox"
										name="invoice"
										className="size-4 rounded border-border text-brass focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta"
									/>
									<span>Chcę fakturę VAT (B2B)</span>
								</label>
								<details className="mt-3 rounded-xl border border-border bg-card p-4 text-sm open:bg-cream">
									<summary className="cursor-pointer font-semibold">Dane do faktury</summary>
									<div className="mt-4 grid gap-4 sm:grid-cols-2">
										<TextField label="NIP" name="nip" />
										<TextField label="Nazwa firmy" name="companyName" className="sm:col-span-2" />
									</div>
								</details>
							</FieldSet>

							<FieldSet title="Krok 2 · Wybór dostawy" eyebrow="Logistyka">
								<RadioCard
									name="shipping"
									value="paczkomat"
									title="InPost Paczkomaty"
									description="2–3 dni robocze · domyślny wybór"
									price="19 zł"
									defaultChecked
								/>
								<RadioCard
									name="shipping"
									value="kurier"
									title="Kurier DPD / DHL"
									description="1–2 dni robocze · większe gabaryty"
									price="29 zł"
								/>
								<RadioCard
									name="shipping"
									value="odbior"
									title="Odbiór osobisty w Nowym Targu"
									description="Tego samego dnia, po wcześniejszym kontakcie"
									price="0 zł"
								/>
							</FieldSet>

							<FieldSet title="Krok 3 · Płatność" eyebrow="Bezpieczne 256-bit">
								<RadioCard
									name="payment"
									value="przelewy24"
									title="Przelewy24 — BLIK · karta · szybki przelew"
									description="Płatność błyskawiczna · obsługa SCA"
									price="bez prowizji"
									defaultChecked
								/>
								<RadioCard
									name="payment"
									value="przelew"
									title="Przelew tradycyjny (B2B)"
									description="Termin 14 dni od FV"
									price="dla firm"
								/>
								<label className="mt-3 flex items-start gap-2 text-sm text-foreground/80">
									<input
										type="checkbox"
										name="terms"
										required
										className="mt-1 size-4 rounded border-border text-brass focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta"
									/>
									<span>
										Akceptuję{" "}
										<a
											href="/regulamin"
											className="font-semibold text-foreground underline-offset-4 hover:underline"
										>
											regulamin
										</a>{" "}
										i{" "}
										<a
											href="/polityka-prywatnosci"
											className="font-semibold text-foreground underline-offset-4 hover:underline"
										>
											politykę prywatności
										</a>
										. Potwierdzam, że odebrałem informację o prawie do odstąpienia w 14 dni.
									</span>
								</label>
							</FieldSet>
						</div>

						<aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
							<div className="rounded-2xl border border-border bg-card p-6">
								<p className="font-sans text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-brass">
									Podsumowanie
								</p>
								<ul className="mt-4 space-y-3 text-sm">
									{SAMPLE_ITEMS.map((item) => (
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
									<dd className="font-display text-3xl font-semibold tabular">
										{formatPrice(total)}
									</dd>
								</div>
							</div>

							<button
								type="submit"
								className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-terracotta px-6 text-sm font-semibold uppercase tracking-[0.08em] text-terracotta-foreground shadow-md transition-transform hover:translate-y-[-1px] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
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
				</Container>
			</Section>

			<Section spacing="md" tone="muted">
				<Container size="md">
					<div className="rounded-3xl border border-border bg-card p-8 text-center md:p-12">
						<Eyebrow className="justify-center">Wątpliwości?</Eyebrow>
						<h2 className="mt-3 font-display text-3xl font-semibold leading-tight md:text-4xl">
							Napisz — odpowiemy w kilka minut
						</h2>
						<p className="mx-auto mt-3 max-w-xl text-foreground/70">
							Każdy przedmiot to unikat. Jeśli masz pytanie o stan, wymiary albo wysyłkę — wolimy
							odpowiedzieć przed zakupem niż po.
						</p>
						<div className="mt-6 flex flex-wrap items-center justify-center gap-3">
							<CtaLink href="/kontakt">Zapytaj o cokolwiek</CtaLink>
							<CtaLink href="/wysylka" variant="secondary" withArrow={false}>
								Zobacz info o wysyłce
							</CtaLink>
						</div>
					</div>
				</Container>
			</Section>
		</main>
	);
}

function FieldSet({
	title,
	eyebrow,
	children,
}: {
	title: string;
	eyebrow?: string;
	children: React.ReactNode;
}) {
	return (
		<fieldset className="rounded-2xl border border-border bg-card p-6 md:p-8">
			{eyebrow ? (
				<p className="font-sans text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-brass">
					{eyebrow}
				</p>
			) : null}
			<legend className="mt-2 font-display text-2xl">{title}</legend>
			<div className="mt-6 space-y-3">{children}</div>
		</fieldset>
	);
}

function TextField({
	label,
	name,
	type = "text",
	required,
	className,
}: {
	label: string;
	name: string;
	type?: string;
	required?: boolean;
	className?: string;
}) {
	const id = `field-${name}`;
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
	defaultChecked,
}: {
	name: string;
	value: string;
	title: string;
	description: string;
	price: string;
	defaultChecked?: boolean;
}) {
	return (
		<label className="flex cursor-pointer items-start justify-between gap-3 rounded-xl border border-border bg-background p-4 transition-colors has-[:checked]:border-terracotta has-[:checked]:bg-cream has-[:checked]:shadow-md">
			<span className="flex items-start gap-3">
				<input
					type="radio"
					name={name}
					value={value}
					defaultChecked={defaultChecked}
					className="mt-1 size-4 border-border text-brass focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta"
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
