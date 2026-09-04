"use client";

import Link from "next/link";
import { useActionState, useEffect, useId, useRef, useState } from "react";
import { type ContactState, submitContact } from "@/app/kontakt/actions";
import { ArrowRightIcon, InstagramIcon, StarIcon } from "@/components/icons";
import { BrassRule, Container, Eyebrow, Section } from "@/components/primitives";
import { track } from "@/lib/analytics/posthog";
import { CONTACT_FORM_RESPONSE } from "@/lib/contact/response-time";
import { TESTIMONIALS } from "@/lib/mock/testimonials";
import { getContactTopicOptions } from "@/lib/validation/contact";

const HOME_TOPIC_OPTIONS = getContactTopicOptions("kontakt");

/**
 * Social proof — opinie z DM / IG / Google (po zgodzie klientki).
 * Pre-launch: zamiast pustej sekcji pokazuje mini formularz kontaktowy.
 */
export function SocialProofSection() {
	const hasReviews = TESTIMONIALS.length > 0;

	return (
		<Section spacing="lg" tone="default">
			<Container size="lg">
				<header className="mb-10 flex flex-col items-center gap-3 text-center">
					<Eyebrow variant="script">{hasReviews ? "co mówią" : "napisz do nas"}</Eyebrow>
					<h2 className="max-w-xl font-display text-3xl font-medium leading-tight md:text-4xl">
						{hasReviews
							? "Twoje listy po odbiorze paczki."
							: `Odpowiemy w ${CONTACT_FORM_RESPONSE.labelShort}.`}
					</h2>
					<BrassRule className="my-2 max-w-[140px]" />
				</header>

				{hasReviews ? <ReviewsGrid /> : <ContactCard />}
			</Container>
		</Section>
	);
}

/* ── Opinie ────────────────────────────────────────────────────────────── */

function ReviewsGrid() {
	return (
		<>
			<p className="mb-6 text-center text-xs uppercase tracking-[0.16em] text-foreground/55">
				Opinie z DM Instagram, WhatsApp i Google · pisownia oryginalna
			</p>
			<ul className="grid gap-5 md:grid-cols-3">
				{TESTIMONIALS.map((testimonial) => (
					<li
						key={testimonial.id}
						className="flex h-full flex-col gap-4 rounded-2xl border border-walnut/15 bg-card p-6 shadow-card"
					>
						<div
							role="img"
							aria-label={`Ocena: ${testimonial.rating} na 5`}
							className="flex gap-1 text-terracotta"
						>
							{Array.from({ length: 5 }, (_, i) => (
								<StarIcon
									// biome-ignore lint/suspicious/noArrayIndexKey: gwiazdki to czysta dekoracja
									key={`star-${testimonial.id}-${i}`}
									className="size-4 fill-current"
									aria-hidden="true"
								/>
							))}
						</div>
						<blockquote className="flex-1 text-pretty font-display text-lg leading-snug text-foreground">
							„{testimonial.body}"
						</blockquote>
						<footer className="cta-text text-xs text-foreground/55">
							{testimonial.author} · {testimonial.location} ·{" "}
							{testimonial.source === "instagram"
								? "DM Instagram"
								: testimonial.source === "dm"
									? "WhatsApp"
									: testimonial.source === "google"
										? "opinia Google"
										: "wiadomość bezpośrednia"}
						</footer>
					</li>
				))}
			</ul>
		</>
	);
}

/* ── Mini formularz kontaktowy ─────────────────────────────────────────── */

const INITIAL: ContactState = { status: "idle" };

function ContactCard() {
	const [state, formAction, isPending] = useActionState(submitContact, INITIAL);
	const [topic, setTopic] = useState("");
	const lastTopicRef = useRef<string | null>(null);

	useEffect(() => {
		if (state.status === "success" && lastTopicRef.current !== state.topic) {
			lastTopicRef.current = state.topic;
			track({ name: "contact_form_submitted", properties: { topic: state.topic } });
		}
	}, [state]);

	const handleTopicChange = (value: string) => {
		setTopic(value);
		track({ name: "contact_topic_selected", properties: { topic: value } });
		if (value === "b2b") track({ name: "b2b_topic_selected", properties: {} });
	};

	const errors = state.status === "error" ? state.errors : {};
	const formError = state.status === "error" ? state.message : undefined;

	if (state.status === "success") {
		return (
			<div className="mx-auto max-w-xl rounded-3xl border border-walnut/15 bg-card p-8 text-center shadow-card md:p-10">
				<p className="font-display text-2xl font-medium">Dziękujemy — wiadomość przyjęta.</p>
				<p className="mt-3 text-pretty text-sm leading-relaxed text-foreground/70">
					Odpowiadamy w {CONTACT_FORM_RESPONSE.label}. Potwierdzenie leci na Twoją skrzynkę.
				</p>
			</div>
		);
	}

	return (
		<div className="mx-auto max-w-xl rounded-3xl border border-walnut/15 bg-card p-8 shadow-card md:p-10">
			<form action={formAction} noValidate className="flex flex-col gap-4">
				<input type="hidden" name="formPreset" value="kontakt" />
				<div className="grid gap-4 sm:grid-cols-2">
					<Field label="Imię" name="name" required error={errors.name} />
					<Field label="E-mail" name="email" type="email" required error={errors.email} />
				</div>

				<TopicField
					options={HOME_TOPIC_OPTIONS}
					value={topic}
					error={errors.topic}
					onChange={handleTopicChange}
				/>

				{topic === "inne" ? (
					<Field
						label="Twój temat"
						name="topicOther"
						required
						placeholder="Np. współpraca, reklama, pytanie ogólne…"
						error={errors.topicOther}
					/>
				) : null}

				<Field
					label="Wiadomość"
					name="message"
					textarea
					rows={4}
					required
					placeholder="Napisz, czego szukasz — dopasujemy z najnowszej dostawy."
					error={errors.message}
				/>

				<p className="text-xs text-foreground/45">
					Wysyłając akceptujesz{" "}
					<Link
						href="/polityka-prywatnosci"
						className="underline underline-offset-4 hover:text-terracotta"
					>
						politykę prywatności
					</Link>
					.
				</p>

				{formError ? (
					<p
						role="alert"
						className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
					>
						{formError}
					</p>
				) : null}

				<div className="flex items-center justify-between gap-4">
					<button
						type="submit"
						disabled={isPending}
						className="inline-flex h-11 items-center gap-2 rounded-full bg-terracotta px-6 text-sm font-semibold uppercase tracking-[0.08em] text-terracotta-foreground transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
					>
						{isPending ? "Wysyłamy…" : "Wyślij"}
						<ArrowRightIcon className="size-4" />
					</button>

					<Link
						href="https://instagram.com/retrohouse"
						target="_blank"
						rel="noreferrer"
						className="flex items-center gap-1.5 text-xs text-foreground/50 transition-colors hover:text-terracotta"
					>
						<InstagramIcon className="size-3.5" />
						@retrohouse
					</Link>
				</div>
			</form>
		</div>
	);
}

/* ── Pola formularza ───────────────────────────────────────────────────── */

type FieldProps = {
	label: string;
	name: string;
	type?: string;
	required?: boolean;
	textarea?: boolean;
	rows?: number;
	placeholder?: string;
	error?: string;
};

function Field({
	label,
	name,
	type = "text",
	required,
	textarea,
	rows = 4,
	placeholder,
	error,
}: FieldProps) {
	const id = useId();
	const errId = `${id}-err`;
	const base =
		"mt-1.5 w-full rounded-xl border bg-background px-3 text-sm text-foreground placeholder:text-foreground/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta";
	const border = error ? "border-destructive" : "border-border focus-visible:border-terracotta/60";

	return (
		<label htmlFor={id} className="flex flex-col">
			<span className="text-xs font-semibold uppercase tracking-[0.14em] text-foreground/55">
				{label}
				{required ? <span aria-hidden> *</span> : null}
			</span>
			{textarea ? (
				<textarea
					id={id}
					name={name}
					required={required}
					rows={rows}
					placeholder={placeholder}
					aria-invalid={Boolean(error)}
					aria-describedby={error ? errId : undefined}
					className={`${base} ${border} py-2.5`}
				/>
			) : (
				<input
					id={id}
					name={name}
					type={type}
					required={required}
					placeholder={placeholder}
					aria-invalid={Boolean(error)}
					aria-describedby={error ? errId : undefined}
					className={`${base} ${border} h-11`}
				/>
			)}
			{error ? (
				<span id={errId} className="mt-1 text-xs text-destructive">
					{error}
				</span>
			) : null}
		</label>
	);
}

function TopicField({
	options,
	value,
	error,
	onChange,
}: {
	options: Array<{ value: string; label: string }>;
	value: string;
	error?: string;
	onChange: (v: string) => void;
}) {
	const id = useId();
	const errId = `${id}-err`;
	const border = error ? "border-destructive" : "border-border focus-visible:border-terracotta/60";

	return (
		<label htmlFor={id} className="flex flex-col">
			<span className="text-xs font-semibold uppercase tracking-[0.14em] text-foreground/55">
				Temat <span aria-hidden>*</span>
			</span>
			<select
				id={id}
				name="topic"
				required
				value={value}
				aria-invalid={Boolean(error)}
				aria-describedby={error ? errId : undefined}
				onChange={(e) => onChange(e.target.value)}
				className={`mt-1.5 h-11 w-full rounded-xl border bg-background px-3 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta ${border}`}
			>
				<option value="" disabled>
					Wybierz temat…
				</option>
				{options.map((o) => (
					<option key={o.value} value={o.value}>
						{o.label}
					</option>
				))}
			</select>
			{error ? (
				<span id={errId} className="mt-1 text-xs text-destructive">
					{error}
				</span>
			) : null}
		</label>
	);
}
