"use client";

import { useActionState, useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRightIcon } from "@/components/icons";
import { track } from "@/lib/analytics/posthog";
import type { ContactTopic } from "@/lib/analytics/events";
import { submitContact, type ContactState } from "./actions";

const INITIAL: ContactState = { status: "idle" };

const TOPIC_OPTIONS: Array<{ value: ContactTopic; label: string }> = [
	{ value: "produkt", label: "Pytanie o produkt" },
	{ value: "b2b", label: "Współpraca B2B" },
	{ value: "wysylka", label: "Wysyłka i zwroty" },
	{ value: "inne", label: "Inne" },
];

export function ContactForm() {
	const [state, formAction, isPending] = useActionState(submitContact, INITIAL);
	const [topic, setTopic] = useState<ContactTopic | "">("");
	const lastSubmittedTopicRef = useRef<ContactTopic | null>(null);

	useEffect(() => {
		if (state.status === "success" && lastSubmittedTopicRef.current !== state.topic) {
			lastSubmittedTopicRef.current = state.topic;
			track({ name: "contact_form_submitted", properties: { topic: state.topic } });
		}
	}, [state]);

	const handleTopicChange = (value: ContactTopic) => {
		setTopic(value);
		track({ name: "contact_topic_selected", properties: { topic: value } });
		if (value === "b2b") {
			track({ name: "b2b_topic_selected", properties: {} });
		}
	};

	const errors = state.status === "error" ? state.errors : {};
	const formError = state.status === "error" ? state.message : undefined;

	if (state.status === "success") {
		return (
			<div className="rounded-3xl border border-success/40 bg-success/10 p-8 text-center md:p-12">
				<p className="font-display text-3xl font-semibold leading-tight">
					Dziękujemy — wiadomość przyjęta.
				</p>
				<p className="mt-3 max-w-xl text-pretty text-foreground/80 md:mx-auto">
					Odpowiadamy w 12 godzin roboczych (średnia 4h). Najszybciej odpowiemy w temacie:{" "}
					<strong>{TOPIC_OPTIONS.find((option) => option.value === state.topic)?.label}</strong>.
				</p>
				<p className="mt-6 text-sm text-foreground/70">
					Sprawdź skrzynkę za chwilę — wysłaliśmy potwierdzenie z numerem zgłoszenia.
				</p>
			</div>
		);
	}

	return (
		<form
			action={formAction}
			className="rounded-3xl border border-border bg-card p-6 md:p-8"
			noValidate
		>
			<p className="font-sans text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-brass">
				Formularz kontaktowy
			</p>
			<h2 className="mt-3 font-display text-3xl font-semibold leading-tight">Napisz do nas</h2>
			<p className="mt-2 max-w-xl text-foreground/70">
				Odpowiadamy w 12 godzin roboczych. W weekendy i święta — w poniedziałek rano.
			</p>

			<div className="mt-6 grid gap-4 sm:grid-cols-2">
				<TextField label="Imię" name="name" required error={errors.name} />
				<TextField label="E-mail" name="email" type="email" required error={errors.email} />
				<TopicSelect
					value={topic}
					error={errors.topic}
					onChange={handleTopicChange}
				/>
				<TextField
					label="Wiadomość"
					name="message"
					textarea
					required
					rows={5}
					placeholder="Napisz, czego szukasz — dopasujemy z najnowszej dostawy z Wiednia."
					error={errors.message}
					className="sm:col-span-2"
				/>
			</div>

			{formError ? (
				<p
					role="alert"
					className="mt-4 rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive"
				>
					{formError}
				</p>
			) : null}

			<button
				type="submit"
				disabled={isPending}
				className="mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-terracotta px-6 text-sm font-semibold uppercase tracking-[0.08em] text-terracotta-foreground transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
			>
				{isPending ? "Wysyłamy…" : "Wyślij"}
				<ArrowRightIcon className="size-4" />
			</button>

			<p className="mt-3 text-xs text-foreground/60">
				Wysyłając formularz akceptujesz{" "}
				<Link
					href="/polityka-prywatnosci"
					className="underline underline-offset-4 hover:text-terracotta"
				>
					politykę prywatności
				</Link>
				.
			</p>

			<aside className="mt-6 rounded-2xl border border-brass/40 bg-terracotta/15 p-4 text-sm">
				<p className="font-display text-base">Jesteś projektantem wnętrz / architektem?</p>
				<p className="mt-1 text-foreground/80">
					Przejdź na{" "}
					<Link
						href="/dla-projektantow"
						className="font-semibold text-foreground underline underline-offset-4 hover:text-terracotta"
					>
						/dla-projektantow
					</Link>
					— tam jest dedykowany formularz briefu B2B (mood board, budżet, termin, rezerwacja 14
					dni). Odpowiemy szybciej niż tutaj.
				</p>
			</aside>
		</form>
	);
}

type TextFieldProps = {
	label: string;
	name: string;
	type?: string;
	required?: boolean;
	textarea?: boolean;
	rows?: number;
	placeholder?: string;
	error?: string;
	className?: string;
};

function TextField({
	label,
	name,
	type = "text",
	required,
	textarea,
	rows = 4,
	placeholder,
	error,
	className,
}: TextFieldProps) {
	const id = useId();
	const errId = `${id}-err`;
	const baseClass =
		"mt-2 w-full rounded-xl border bg-background px-3 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta";
	const borderClass = error ? "border-destructive" : "border-border focus-visible:border-terracotta";

	return (
		<label htmlFor={id} className={className}>
			<span className="text-xs font-semibold uppercase tracking-[0.14em] text-foreground/60">
				{label} {required ? <span aria-hidden>*</span> : null}
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
					className={`${baseClass} ${borderClass} py-2`}
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
					className={`${baseClass} ${borderClass} h-11`}
				/>
			)}
			{error ? (
				<span id={errId} className="mt-1 block text-xs text-destructive">
					{error}
				</span>
			) : null}
		</label>
	);
}

function TopicSelect({
	value,
	error,
	onChange,
}: {
	value: ContactTopic | "";
	error?: string;
	onChange: (value: ContactTopic) => void;
}) {
	const id = useId();
	const errId = `${id}-err`;
	const borderClass = error ? "border-destructive" : "border-border focus-visible:border-terracotta";

	return (
		<label htmlFor={id} className="sm:col-span-2">
			<span className="text-xs font-semibold uppercase tracking-[0.14em] text-foreground/60">
				Temat *
			</span>
			<select
				id={id}
				name="topic"
				required
				value={value}
				aria-invalid={Boolean(error)}
				aria-describedby={error ? errId : undefined}
				onChange={(event) => onChange(event.target.value as ContactTopic)}
				className={`mt-2 h-11 w-full rounded-xl border bg-background px-3 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta ${borderClass}`}
			>
				<option value="" disabled>
					Wybierz…
				</option>
				{TOPIC_OPTIONS.map((option) => (
					<option key={option.value} value={option.value}>
						{option.label}
					</option>
				))}
			</select>
			{error ? (
				<span id={errId} className="mt-1 block text-xs text-destructive">
					{error}
				</span>
			) : null}
		</label>
	);
}
