"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { ArrowRightIcon, CalendarIcon } from "@/components/icons";
import { CtaLink, Eyebrow } from "@/components/primitives";
import { track } from "@/lib/analytics/posthog";
import {
	type LiveReminderState,
	submitLiveReminder,
} from "@/app/api/live-reminder/action";

type LiveBannerProps = {
	dateIso: string;
	dropTitle: string;
	dropCount: number;
};

const initialState: LiveReminderState = { status: "idle" };

/**
 * Live commerce banner — countdown + 2 CTA (mail / .ics).
 *
 * Reguły:
 * - prefers-reduced-motion: reduce → wyłącz pulsowanie kropki + interwał
 *   countdown skraca do statycznego "wkrótce".
 * - render warunkowy w HomePage gdy `env.NEXT_PUBLIC_LIVE_SCHEDULED === true`.
 */
export function LiveBanner({ dateIso, dropTitle, dropCount }: LiveBannerProps) {
	const [state, formAction, isPending] = useActionState(
		submitLiveReminder,
		initialState,
	);
	const countdown = useCountdown(dateIso);

	useEffect(() => {
		if (state.status === "success") {
			track({ name: "live_reminder_signup", properties: { channel: "email" } });
		}
	}, [state.status]);

	const targetDate = new Date(dateIso);
	const dateLabel = new Intl.DateTimeFormat("pl-PL", {
		weekday: "long",
		day: "numeric",
		month: "long",
		hour: "2-digit",
		minute: "2-digit",
		timeZone: "Europe/Warsaw",
	}).format(targetDate);

	const handleIcs = () => {
		track({ name: "live_reminder_signup", properties: { channel: "calendar" } });
	};

	return (
		<aside
			aria-labelledby="live-heading"
			className="rounded-3xl border border-walnut/15 bg-card p-6 shadow-card md:p-10"
		>
			<div className="grid gap-7 md:grid-cols-[1.1fr_0.9fr] md:items-center">
				<div>
					<div className="flex items-center gap-2 text-terracotta motion-safe:animate-none">
						<span
							aria-hidden="true"
							className="size-2 rounded-full bg-terracotta motion-safe:animate-pulse"
						/>
						<Eyebrow className="!mb-0 !text-terracotta">live commerce</Eyebrow>
					</div>
					<h2
						id="live-heading"
						className="mt-3 font-display text-3xl font-medium leading-tight md:text-4xl"
					>
						{dropTitle}
					</h2>
					<p className="mt-3 max-w-md text-base leading-relaxed text-foreground/75">
						{dropCount} nowych antyków, transmisja na żywo z&nbsp;magazynu w&nbsp;Nowym Targu.
						Pierwsza rezerwacja idzie do&nbsp;osób z&nbsp;listy przypomnień.
					</p>
					<p className="mt-5 cta-text text-xs text-foreground/60">{dateLabel}</p>
					<Countdown {...countdown} />
				</div>

				<div className="grid gap-4">
					<form action={formAction} className="grid gap-2">
						<label htmlFor="live-reminder-email" className="sr-only">
							E-mail do przypomnienia
						</label>
						<div className="flex flex-col gap-2 sm:flex-row">
							<input
								id="live-reminder-email"
								name="email"
								type="email"
								required
								autoComplete="email"
								placeholder="twój e-mail"
								className="h-12 flex-1 rounded-full border border-walnut/25 bg-background px-5 text-sm text-foreground placeholder:text-foreground/55 focus-visible:border-terracotta focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta"
							/>
							<button
								type="submit"
								disabled={isPending}
								className="cta-text inline-flex h-12 items-center justify-center gap-2 rounded-full bg-terracotta px-5 text-xs text-terracotta-foreground transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta disabled:opacity-60"
							>
								{isPending ? "Zapisuję…" : "Powiadom mailem"}
								<ArrowRightIcon className="size-3.5" />
							</button>
						</div>
						{state.status === "success" ? (
							<p
								role="status"
								className="text-xs text-success-foreground bg-success/15 rounded-md px-3 py-2"
							>
								Zapisane — wyślemy maila 30 minut przed startem.
							</p>
						) : null}
						{state.status === "error" ? (
							<p role="alert" className="text-xs text-error-foreground">
								{state.message}
							</p>
						) : null}
					</form>

					<CtaLink
						href="/api/live.ics"
						variant="secondary"
						withArrow={false}
						onClick={handleIcs}
						className="!justify-center"
					>
						<CalendarIcon className="size-4" />
						Dodaj do kalendarza
					</CtaLink>

					<p className="text-xs text-foreground/55">
						Bez spamu. E-mail tylko do tego dropu, kasujemy listę po zakończeniu live.{" "}
						<Link
							href="/polityka-prywatnosci"
							className="underline underline-offset-4 hover:text-terracotta"
						>
							Polityka prywatności
						</Link>
						.
					</p>
				</div>
			</div>
		</aside>
	);
}

/* Countdown — useState + setInterval z prefers-reduced-motion guard */

type CountdownState = {
	days: number;
	hours: number;
	minutes: number;
	seconds: number;
	isLive: boolean;
	reduced: boolean;
};

function useCountdown(targetIso: string): CountdownState {
	const [state, setState] = useState<CountdownState>(() =>
		computeCountdown(new Date(targetIso).getTime(), false),
	);

	useEffect(() => {
		const reduced =
			typeof window !== "undefined" &&
			window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		const target = new Date(targetIso).getTime();
		setState(computeCountdown(target, reduced));
		if (reduced) return;
		const interval = window.setInterval(() => {
			setState(computeCountdown(target, false));
		}, 1000);
		return () => window.clearInterval(interval);
	}, [targetIso]);

	return state;
}

function computeCountdown(targetMs: number, reduced: boolean): CountdownState {
	const diff = targetMs - Date.now();
	if (diff <= 0) {
		return { days: 0, hours: 0, minutes: 0, seconds: 0, isLive: true, reduced };
	}
	const seconds = Math.floor(diff / 1000) % 60;
	const minutes = Math.floor(diff / (1000 * 60)) % 60;
	const hours = Math.floor(diff / (1000 * 60 * 60)) % 24;
	const days = Math.floor(diff / (1000 * 60 * 60 * 24));
	return { days, hours, minutes, seconds, isLive: false, reduced };
}

function Countdown(state: CountdownState) {
	if (state.isLive) {
		return (
			<p className="mt-4 cta-text text-sm text-terracotta">Trwa live — odśwież koszyk</p>
		);
	}
	if (state.reduced) {
		const target = state.days > 0 ? `${state.days} dni` : "wkrótce";
		return (
			<p className="mt-4 cta-text text-sm text-foreground/65">Do startu: {target}</p>
		);
	}
	return (
		<dl
			aria-label="Czas do startu"
			className="mt-4 flex gap-4 text-foreground"
		>
			<CountUnit label="dni" value={state.days} />
			<CountUnit label="godz." value={state.hours} />
			<CountUnit label="min" value={state.minutes} />
			<CountUnit label="sek" value={state.seconds} />
		</dl>
	);
}

function CountUnit({ label, value }: { label: string; value: number }) {
	return (
		<div className="flex flex-col items-start">
			<dt className="cta-text text-[0.6rem] text-foreground/55">{label}</dt>
			<dd className="font-display text-2xl tabular leading-none">
				{String(value).padStart(2, "0")}
			</dd>
		</div>
	);
}
