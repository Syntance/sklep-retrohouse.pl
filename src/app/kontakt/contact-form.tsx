"use client";

import Link from "next/link";
import { useActionState, useEffect, useId, useRef, useState } from "react";
import { ArrowRightIcon } from "@/components/icons";
import { PrivacyPolicyLink } from "@/components/primitives";
import { track } from "@/lib/analytics/posthog";
import { CONTACT_FORM_RESPONSE } from "@/lib/contact/response-time";
import {
	type ContactTopicPreset,
	formatContactTopicLabel,
	getContactTopicOptions,
} from "@/lib/validation/contact";
import { type ContactState, submitContact } from "./actions";

const INITIAL: ContactState = { status: "idle" };

type TopicOption = { value: string; label: string };

type ContactFormProps = {
	/** Na stronach dokumentów — bez duplikatu nagłówka i boxu B2B. */
	variant?: "page" | "embedded";
	/** Tematy w select — dopasowane do podstrony (domyślnie /kontakt). */
	topicPreset?: ContactTopicPreset;
	/** Z konfiguracji magazynu; gdy brak — domyślne z kodu. */
	topicOptions?: TopicOption[];
};

export function ContactForm({
	variant = "page",
	topicPreset = "kontakt",
	topicOptions: topicOptionsProp,
}: ContactFormProps) {
	const topicOptions = topicOptionsProp ?? getContactTopicOptions(topicPreset);
	const embedded = variant === "embedded";
	const [state, formAction, isPending] = useActionState(submitContact, INITIAL);
	const [topic, setTopic] = useState("");
	const lastSubmittedTopicRef = useRef<string | null>(null);

	useEffect(() => {
		if (state.status === "success" && lastSubmittedTopicRef.current !== state.topic) {
			lastSubmittedTopicRef.current = state.topic;
			track({ name: "contact_form_submitted", properties: { topic: state.topic } });
		}
	}, [state]);

	const handleTopicChange = (value: string) => {
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
					Odpowiadamy w {CONTACT_FORM_RESPONSE.withAverage}. Najszybciej odpowiemy w temacie:{" "}
					<strong>
						{formatContactTopicLabel({
							topic: state.topic,
							topicOther: state.topicOther,
						})}
					</strong>
					.
				</p>
				<p className="mt-4 font-mono text-sm tabular-nums text-foreground/80">
					Numer sprawy: <strong className="text-foreground">{state.caseNumber}</strong>
				</p>
				<p className="mt-3 text-sm text-foreground/70">
					Potwierdzenie z tym numerem wysłaliśmy na Twój e-mail.
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
			{embedded ? (
				<p className="text-center font-display text-2xl font-semibold leading-tight">
					Formularz kontaktowy
				</p>
			) : (
				<>
					<p className="font-sans text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-brass">
						Formularz kontaktowy
					</p>
					<h2 className="mt-3 font-display text-3xl font-semibold leading-tight">Napisz do nas</h2>
					<p className="mt-2 max-w-xl text-foreground/70">
						Odpowiadamy w {CONTACT_FORM_RESPONSE.label}. {CONTACT_FORM_RESPONSE.weekendNote}
					</p>
				</>
			)}

			<input type="hidden" name="formPreset" value={topicPreset} />

			<div className="mt-6 grid gap-4 sm:grid-cols-2">
				<TextField label="Imię" name="name" required error={errors.name} />
				<TextField label="E-mail" name="email" type="email" required error={errors.email} />
				<TopicSelect
					options={topicOptions}
					value={topic}
					error={errors.topic}
					onChange={handleTopicChange}
				/>
				{topic === "inne" ? (
					<TextField
						label="Twój temat"
						name="topicOther"
						required
						placeholder="Np. współpraca, reklama, pytanie ogólne…"
						error={errors.topicOther}
						className="sm:col-span-2"
					/>
				) : null}
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
				<p className="sm:col-span-2 text-xs text-foreground/60">
					Wysyłając formularz akceptujesz{" "}
					<PrivacyPolicyLink className="underline underline-offset-4 hover:text-terracotta" />.
				</p>
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

			{embedded ? null : (
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
			)}
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
	const borderClass = error
		? "border-destructive"
		: "border-border focus-visible:border-terracotta";

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
	options,
	value,
	error,
	onChange,
}: {
	options: TopicOption[];
	value: string;
	error?: string;
	onChange: (value: string) => void;
}) {
	const id = useId();
	const errId = `${id}-err`;
	const borderClass = error
		? "border-destructive"
		: "border-border focus-visible:border-terracotta";

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
				onChange={(event) => onChange(event.target.value)}
				className={`mt-2 h-11 w-full rounded-xl border bg-background px-3 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta ${borderClass}`}
			>
				<option value="" disabled>
					Wybierz…
				</option>
				{options.map((option) => (
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
