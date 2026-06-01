"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import {
	CustomerLoginSchema,
	CustomerCodeOnlySchema,
	type CustomerLoginInput,
	type CustomerCodeOnlyInput,
} from "@/lib/validation/returns";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type LoginStep = "email" | "code";

type Props = {
	onSuccess: (token: string) => void;
};

export function CustomerLogin({ onSuccess }: Props) {
	const [step, setStep] = useState<LoginStep>("email");
	const [email, setEmail] = useState("");
	const [loading, setLoading] = useState(false);

	const loginForm = useForm<CustomerLoginInput>();
	const otpForm = useForm<CustomerCodeOnlyInput>();

	async function handleRequestCode(data: CustomerLoginInput) {
		const parsed = CustomerLoginSchema.safeParse(data);
		if (!parsed.success) {
			const emailIssue = parsed.error.issues.find((issue) => issue.path[0] === "email");
			if (emailIssue) loginForm.setError("email", { message: emailIssue.message });
			return;
		}
		setLoading(true);
		try {
			const res = await fetch("/api/customer/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(parsed.data),
			});

			const json = await res.json();

			if (json.ok) {
				setEmail(parsed.data.email);
				otpForm.reset({ code: "" }); // Reset formularza kodu
				setStep("code");
				toast.success("Kod został wysłany na Twój email");
			} else {
				toast.error(json.error ?? "Nie udało się wysłać kodu");
			}
		} catch {
			toast.error("Błąd połączenia");
		} finally {
			setLoading(false);
		}
	}

	async function handleVerifyCode(data: CustomerCodeOnlyInput) {
		const parsed = CustomerCodeOnlySchema.safeParse(data);
		if (!parsed.success) {
			const codeIssue = parsed.error.issues.find((issue) => issue.path[0] === "code");
			if (codeIssue) otpForm.setError("code", { message: codeIssue.message });
			toast.error("Kod musi mieć 6 cyfr");
			return;
		}

		setLoading(true);
		try {
			const payload = { ...parsed.data, email };
			
			const res = await fetch("/api/customer/verify-otp", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});

			const json = await res.json();

			if (json.ok && json.token) {
				toast.success("Zalogowano");
				onSuccess(json.token);
			} else {
				toast.error(json.error ?? "Niepoprawny kod");
			}
		} catch {
			toast.error("Błąd połączenia");
		} finally {
			setLoading(false);
		}
	}

	if (step === "email") {
		return (
			<div className="rounded-2xl border border-border bg-card p-6 max-w-md mx-auto">
				<h2 className="font-display text-2xl font-semibold mb-4">Zaloguj się</h2>
				<p className="text-sm text-muted-foreground mb-6">
					Wyślemy kod na Twój email, którym składałeś zamówienie.
				</p>

				<form onSubmit={loginForm.handleSubmit(handleRequestCode)} className="space-y-4">
					<div>
						<label htmlFor="email" className="block text-sm font-medium mb-1.5">
							Email
						</label>
						<input
							{...loginForm.register("email")}
							id="email"
							type="email"
							placeholder="jan@example.com"
							className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
							disabled={loading}
						/>
						{loginForm.formState.errors.email && (
							<p className="mt-1 text-xs text-destructive">
								{loginForm.formState.errors.email.message}
							</p>
						)}
					</div>

					<Button type="submit" disabled={loading} className="w-full">
						{loading ? "Wysyłanie..." : "Wyślij kod"}
					</Button>
				</form>
			</div>
		);
	}

	return (
		<div className="rounded-2xl border border-border bg-card p-6 max-w-md mx-auto">
			<h2 className="font-display text-2xl font-semibold mb-4">Wpisz kod</h2>
			<p className="text-sm text-muted-foreground mb-6">
				Kod został wysłany na <strong>{email}</strong>
			</p>

			<form 
				onSubmit={otpForm.handleSubmit(
					handleVerifyCode,
					(errors) => {
						console.log("[otpForm] Validation errors:", errors);
						toast.error("Kod musi mieć 6 cyfr");
					}
				)} 
				className="space-y-4"
			>
				<div>
					<label htmlFor="code" className="block text-sm font-medium mb-1.5">
						Kod (6 cyfr)
					</label>
					<input
						{...otpForm.register("code")}
						id="code"
						type="text"
						inputMode="numeric"
						pattern="[0-9]*"
						placeholder="123456"
						maxLength={6}
						className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-mono text-center text-2xl tracking-widest focus:outline-none focus:ring-2 focus:ring-ring"
						disabled={loading}
						autoComplete="one-time-code"
						autoFocus
					/>
					{otpForm.formState.errors.code && (
						<p className="mt-1 text-xs text-destructive">
							{otpForm.formState.errors.code.message}
						</p>
					)}
				</div>

				<Button type="submit" disabled={loading} className="w-full">
					{loading ? "Sprawdzanie..." : "Zaloguj się"}
				</Button>

				<button
					type="button"
					onClick={() => {
						setStep("email");
						otpForm.reset();
					}}
					className="w-full text-sm text-muted-foreground hover:text-foreground"
					disabled={loading}
				>
					Zmień email
				</button>
			</form>
		</div>
	);
}
