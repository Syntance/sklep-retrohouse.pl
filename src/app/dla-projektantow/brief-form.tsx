"use client";

import { useActionState, useEffect, useId, useState } from "react";
import { ArrowRightIcon } from "@/components/icons";
import { track } from "@/lib/analytics/posthog";
import type { B2BBudgetBucket, B2BTimeline } from "@/lib/analytics/events";
import { submitBrief, type B2BBriefState } from "./actions";

const initialState: B2BBriefState = { status: "idle" };

const BUDGET_OPTIONS: Array<{ value: B2BBudgetBucket; label: string }> = [
	{ value: "do_2k", label: "do 2 000 zł" },
	{ value: "2_5k", label: "2 000 – 5 000 zł" },
	{ value: "5_15k", label: "5 000 – 15 000 zł" },
	{ value: "15k_plus", label: "15 000+ zł" },
];

const TIMELINE_OPTIONS: Array<{ value: B2BTimeline; label: string }> = [
	{ value: "lt_2w", label: "< 2 tygodnie" },
	{ value: "2_4w", label: "2 – 4 tygodnie" },
	{ value: "1_3m", label: "1 – 3 miesiące" },
	{ value: "elastycznie", label: "Elastyczne" },
];

/**
 * BriefForm — client form z useActionState (React 19).
 *
 * Eventy PostHog:
 *  - b2b_brief_started (raz, na pierwszy onFocus jakiegokolwiek pola)
 *  - b2b_budget_selected (na każdą zmianę selectu budżetu)
 *  - b2b_brief_submitted (po zwróceniu status: 'success')
 */
export function BriefForm() {
	const [state, formAction, isPending] = useActionState(submitBrief, initialState);
	const [started, setStarted] = useState(false);
	const [budget, setBudget] = useState<B2BBudgetBucket | "">("");
	const [timeline, setTimeline] = useState<B2BTimeline | "">("");
	const [hasMoodboard, setHasMoodboard] = useState(false);
	const [newsletter, setNewsletter] = useState(false);

	useEffect(() => {
		if (state.status !== "success") return;
		if (!budget || !timeline) return;
		track({
			name: "b2b_brief_submitted",
			properties: {
				budget,
				timeline,
				has_moodboard: hasMoodboard,
				newsletter_optin: newsletter,
			},
		});
	}, [state.status, budget, timeline, hasMoodboard, newsletter]);

	const handleFirstFocus = () => {
		if (started) return;
		setStarted(true);
		track({ name: "b2b_brief_started", properties: {} });
	};

	const handleBudgetChange = (value: B2BBudgetBucket) => {
		setBudget(value);
		track({ name: "b2b_budget_selected", properties: { budget_bucket: value } });
	};

	const fieldError = (key: string) =>
		state.status === "error" ? state.fieldErrors?.[key] : undefined;

	return (
		<form
			action={formAction}
			onFocus={handleFirstFocus}
			className="rounded-3xl border border-ink-foreground/15 bg-ink-foreground/5 p-6 md:p-10"
			noValidate
		>
			<p className="text-brass cta-text text-xs">Formularz briefu B2B</p>
			<h2 className="mt-3 font-display text-4xl font-semibold leading-tight text-ink-foreground">
				Wyślij brief — odpiszemy w 24h
			</h2>
			<p className="mt-2 text-ink-foreground/70">
				Im więcej szczegółów, tym lepsza selekcja. Nie potrzebujemy gotowych decyzji — wystarczy
				mood board i kierunek.
			</p>

			<div className="mt-6 grid gap-4 sm:grid-cols-2">
				<DarkField label="Imię i nazwisko" name="name" required error={fieldError("name")} />
				<DarkField label="Studio / firma" name="studio" required error={fieldError("studio")} />
				<DarkField label="E-mail" name="email" type="email" required error={fieldError("email")} />
				<DarkField label="Telefon / WhatsApp" name="phone" type="tel" error={fieldError("phone")} />
				<DarkField
					label="NIP (opcjonalnie)"
					name="nip"
					className="sm:col-span-2"
					error={fieldError("nip")}
				/>
				<DarkField
					label="Link do mood boardu lub opis briefu"
					name="brief"
					textarea
					required
					className="sm:col-span-2"
					error={fieldError("brief")}
					hint="Min. 50 znaków. Mile widziany Pinterest / Figma / Notion link."
				/>
				<DarkSelect
					label="Budżet orientacyjny"
					name="budget"
					value={budget}
					onChange={(v) => handleBudgetChange(v as B2BBudgetBucket)}
					options={BUDGET_OPTIONS}
					error={fieldError("budget")}
				/>
				<DarkSelect
					label="Termin realizacji"
					name="timeline"
					value={timeline}
					onChange={(v) => setTimeline(v as B2BTimeline)}
					options={TIMELINE_OPTIONS}
					error={fieldError("timeline")}
				/>
			</div>

			<label className="mt-4 flex items-start gap-2 text-sm text-ink-foreground/80">
				<input
					type="checkbox"
					name="hasMoodboard"
					checked={hasMoodboard}
					onChange={(e) => setHasMoodboard(e.target.checked)}
					className="mt-1 size-4 rounded border-ink-foreground/30 bg-ink-foreground/10 text-brass"
				/>
				<span>Mam już mood board / link do koncepcji.</span>
			</label>

			<label className="mt-3 flex items-start gap-2 text-sm text-ink-foreground/80">
				<input
					type="checkbox"
					name="newsletter"
					checked={newsletter}
					onChange={(e) => setNewsletter(e.target.checked)}
					className="mt-1 size-4 rounded border-ink-foreground/30 bg-ink-foreground/10 text-brass"
				/>
				<span>
					Chcę dostawać priorytetowy newsletter B2B (48h przed publikacją w sklepie).
				</span>
			</label>

			<button
				type="submit"
				disabled={isPending}
				className="cta-text mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-terracotta px-6 text-xs text-terracotta-foreground transition-all hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-terracotta disabled:opacity-60"
			>
				{isPending ? "Wysyłam…" : "Wyślij brief"}
				<ArrowRightIcon className="size-4" />
			</button>

			{state.status === "success" ? (
				<p
					role="status"
					className="mt-4 rounded-md bg-success/15 px-3 py-2 text-sm text-success-foreground"
				>
					Dziękujemy — odpiszemy mailowo w ciągu 24 godzin roboczych.
				</p>
			) : null}
			{state.status === "error" ? (
				<p role="alert" className="mt-4 text-sm text-ink-foreground/80">
					{state.message}
				</p>
			) : null}

			<p className="mt-3 text-xs text-ink-foreground/60">
				Odpowiemy w ciągu 24h roboczych. Priorytet na zapytania B2B.
			</p>
		</form>
	);
}

type DarkFieldProps = {
	label: string;
	name: string;
	type?: string;
	textarea?: boolean;
	required?: boolean;
	className?: string;
	error?: string;
	hint?: string;
};

function DarkField({
	label,
	name,
	type = "text",
	textarea,
	required,
	className,
	error,
	hint,
}: DarkFieldProps) {
	const id = useId();
	const errorId = `${id}-err`;
	const hintId = `${id}-hint`;
	return (
		<div className={className}>
			<label htmlFor={id}>
				<span className="cta-text text-xs text-ink-foreground/70">
					{label} {required ? <span aria-hidden="true">*</span> : null}
				</span>
				{textarea ? (
					<textarea
						id={id}
						name={name}
						required={required}
						rows={5}
						minLength={50}
						aria-invalid={Boolean(error)}
						aria-describedby={[error ? errorId : null, hint ? hintId : null]
							.filter(Boolean)
							.join(" ") || undefined}
						className="mt-2 w-full rounded-xl border border-ink-foreground/20 bg-ink-foreground/10 px-3 py-2 text-sm text-ink-foreground placeholder:text-ink-foreground/50 focus-visible:border-terracotta focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta"
						placeholder="Mood board, paleta, klucz designerski, status projektu…"
					/>
				) : (
					<input
						id={id}
						name={name}
						type={type}
						required={required}
						aria-invalid={Boolean(error)}
						aria-describedby={[error ? errorId : null, hint ? hintId : null]
							.filter(Boolean)
							.join(" ") || undefined}
						className="mt-2 h-11 w-full rounded-xl border border-ink-foreground/20 bg-ink-foreground/10 px-3 text-sm text-ink-foreground placeholder:text-ink-foreground/50 focus-visible:border-terracotta focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta"
					/>
				)}
			</label>
			{hint ? (
				<p id={hintId} className="mt-1 text-xs text-ink-foreground/55">
					{hint}
				</p>
			) : null}
			{error ? (
				<p id={errorId} className="mt-1 text-xs text-terracotta">
					{error}
				</p>
			) : null}
		</div>
	);
}

type DarkSelectProps = {
	label: string;
	name: string;
	value: string;
	onChange: (next: string) => void;
	options: ReadonlyArray<{ value: string; label: string }>;
	error?: string;
};

function DarkSelect({ label, name, value, onChange, options, error }: DarkSelectProps) {
	const id = useId();
	return (
		<div>
			<label htmlFor={id}>
				<span className="cta-text text-xs text-ink-foreground/70">{label}</span>
				<select
					id={id}
					name={name}
					required
					value={value}
					onChange={(e) => onChange(e.target.value)}
					aria-invalid={Boolean(error)}
					className="mt-2 h-11 w-full rounded-xl border border-ink-foreground/20 bg-ink-foreground/10 px-3 text-sm text-ink-foreground focus-visible:border-terracotta focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta"
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
			</label>
			{error ? <p className="mt-1 text-xs text-terracotta">{error}</p> : null}
		</div>
	);
}
