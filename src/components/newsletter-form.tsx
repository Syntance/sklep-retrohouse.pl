"use client";

import { useId, useState } from "react";
import { ArrowRightIcon } from "@/components/icons";
import { track } from "@/lib/analytics/posthog";
import type { AnalyticsEvent } from "@/lib/analytics/events";

type NewsletterSource = Extract<
	AnalyticsEvent,
	{ name: "newsletter_signup" }
>["properties"]["source"];

type NewsletterFormProps = {
	source: NewsletterSource;
	variant?: "card" | "inline" | "ink";
	heading?: string;
	description?: string;
	className?: string;
};

/**
 * Klient-side newsletter form. Bez Server Action (etap 2: Resend).
 * Po sukcesie emit `newsletter_signup` z `source` zgodnym z kontekstem
 * (homepage / blog / footer / popup / b2b / live_reminder).
 */
export function NewsletterForm({
	source,
	variant = "card",
	heading = "Co 2 tygodnie nowy artykuł i nowa dostawa",
	description = "Bez spamu — dzielimy się tylko nowymi tekstami i świeżymi przedmiotami z Wiednia.",
	className,
}: NewsletterFormProps) {
	const id = useId();
	const [email, setEmail] = useState("");
	const [status, setStatus] = useState<"idle" | "ok">("idle");

	const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const trimmed = email.trim();
		if (!trimmed) return;
		track({ name: "newsletter_signup", properties: { source } });
		setStatus("ok");
		setEmail("");
	};

	const isInk = variant === "ink";
	const inputClass = isInk
		? "h-11 w-full rounded-full border border-ink-foreground/25 bg-ink-foreground/5 px-4 text-sm text-ink-foreground placeholder:text-ink-foreground/55 focus-visible:border-terracotta focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta"
		: "h-11 w-full rounded-full border border-border bg-background px-4 text-sm focus-visible:border-terracotta focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta";

	if (variant === "inline") {
		return (
			<form onSubmit={handleSubmit} className={className}>
				<label htmlFor={id} className="sr-only">
					E-mail
				</label>
				<div className="flex flex-col gap-2 sm:flex-row">
					<input
						id={id}
						name="email"
						type="email"
						required
						autoComplete="email"
						value={email}
						onChange={(event) => setEmail(event.target.value)}
						placeholder="twój e-mail"
						className={inputClass}
					/>
					<button
						type="submit"
						className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-terracotta px-5 text-sm font-semibold uppercase tracking-[0.08em] text-terracotta-foreground"
					>
						{status === "ok" ? "Dziękujemy" : "Zapisz mnie"}
						<ArrowRightIcon className="size-4" />
					</button>
				</div>
				{status === "ok" ? (
					<p className="mt-2 text-xs text-success">
						Sprawdź skrzynkę — wysłaliśmy potwierdzenie.
					</p>
				) : null}
			</form>
		);
	}

	const wrapperClass =
		variant === "ink"
			? "rounded-3xl border border-ink-foreground/20 bg-ink-foreground/5 p-6"
			: "rounded-3xl border border-border bg-card p-6 md:p-8";

	return (
		<div className={`${wrapperClass} ${className ?? ""}`}>
			<p
				className={`font-sans text-[0.7rem] font-semibold uppercase tracking-[0.18em] ${
					isInk ? "text-brass" : "text-brass"
				}`}
			>
				Newsletter RetroHouse
			</p>
			<h3
				className={`mt-3 font-display text-2xl leading-tight md:text-3xl ${
					isInk ? "text-ink-foreground" : ""
				}`}
			>
				{heading}
			</h3>
			<p className={`mt-2 text-sm ${isInk ? "text-ink-foreground/75" : "text-foreground/70"}`}>
				{description}
			</p>
			<form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-2 sm:flex-row">
				<label htmlFor={id} className="sr-only">
					E-mail
				</label>
				<input
					id={id}
					name="email"
					type="email"
					required
					autoComplete="email"
					value={email}
					onChange={(event) => setEmail(event.target.value)}
					placeholder="twój e-mail"
					className={inputClass}
				/>
				<button
					type="submit"
					className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-terracotta px-5 text-sm font-semibold uppercase tracking-[0.08em] text-terracotta-foreground"
				>
					{status === "ok" ? "Dziękujemy" : "Zapisz mnie"}
					<ArrowRightIcon className="size-4" />
				</button>
			</form>
			{status === "ok" ? (
				<p
					className={`mt-2 text-xs ${
						isInk ? "text-success" : "text-success"
					}`}
					role="status"
				>
					Sprawdź skrzynkę — wysłaliśmy potwierdzenie.
				</p>
			) : null}
		</div>
	);
}
