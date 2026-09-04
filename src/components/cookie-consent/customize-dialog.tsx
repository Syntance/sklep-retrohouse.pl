"use client";

import { useEffect, useId, useRef, useState } from "react";
import { CheckIcon } from "@/components/icons";
import type { ConsentCategories } from "@/lib/analytics/consent";
import { cn } from "@/lib/utils";

type CustomizeDialogProps = {
	open: boolean;
	current: ConsentCategories | null;
	onClose: () => void;
	onSave: (next: Omit<ConsentCategories, "necessary">) => void;
};

/**
 * Native <dialog> z 4 toggle. Necessary lock-on (UODO/EAA wymóg techniczny:
 * pliki niezbędne nie wymagają zgody, art. 173 ust. 3 PT).
 */
export function CustomizeDialog({ open, current, onClose, onSave }: CustomizeDialogProps) {
	const dialogRef = useRef<HTMLDialogElement>(null);
	const headingId = useId();
	const [analytics, setAnalytics] = useState(Boolean(current?.analytics));
	const [marketing, setMarketing] = useState(Boolean(current?.marketing));
	const [preferences, setPreferences] = useState(Boolean(current?.preferences));

	useEffect(() => {
		setAnalytics(Boolean(current?.analytics));
		setMarketing(Boolean(current?.marketing));
		setPreferences(Boolean(current?.preferences));
	}, [current]);

	useEffect(() => {
		const dialog = dialogRef.current;
		if (!dialog) return;
		if (open && !dialog.open) dialog.showModal();
		if (!open && dialog.open) dialog.close();
	}, [open]);

	const handleSave = () => {
		onSave({ analytics, marketing, preferences });
		onClose();
	};

	return (
		<dialog
			ref={dialogRef}
			aria-labelledby={headingId}
			onClose={onClose}
			className="m-auto w-[min(32rem,calc(100vw-2rem))] rounded-2xl border border-walnut/15 bg-background p-0 text-foreground backdrop:bg-ink/60 backdrop:backdrop-blur-sm"
		>
			<div className="p-6 md:p-8">
				<h2 id={headingId} className="font-display text-2xl font-medium leading-tight">
					Dostosuj preferencje plików cookie
				</h2>
				<p className="mt-2 text-sm leading-relaxed text-foreground/70">
					Włącz lub wyłącz poszczególne kategorie. Pliki niezbędne są zawsze aktywne — bez nich
					strona nie zadziała (sesja, koszyk, ochrona przed CSRF).
				</p>

				<ul className="mt-6 grid gap-3">
					<ConsentRow
						title="Niezbędne"
						description="Sesja, koszyk, ochrona CSRF, preferencje dostępności."
						checked
						disabled
						onChange={() => undefined}
					/>
					<ConsentRow
						title="Analityka (PostHog)"
						description="Anonimowe dane o tym, jak korzystasz ze strony — pomaga nam ją ulepszać. Hosting w EU, retencja 12 miesięcy."
						checked={analytics}
						onChange={setAnalytics}
					/>
					<ConsentRow
						title="Marketing"
						description="Piksel Meta (Facebook / Instagram) — mierzenie skuteczności kampanii i remarketing. Ładuje się dopiero po Twojej zgodzie."
						checked={marketing}
						onChange={setMarketing}
					/>
					<ConsentRow
						title="Preferencje"
						description="Zapamiętanie filtrów sklepu (kategoria, cena, epoka, sortowanie), żeby wrócić tam, gdzie skończyłaś."
						checked={preferences}
						onChange={setPreferences}
					/>
				</ul>

				<div className="mt-7 flex flex-col gap-2 sm:flex-row sm:justify-end">
					<button
						type="button"
						onClick={onClose}
						className="cta-text inline-flex h-11 items-center justify-center rounded-full border border-walnut/25 bg-background px-5 text-xs text-foreground/75 transition-colors hover:border-terracotta hover:text-terracotta focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta"
					>
						Anuluj
					</button>
					<button
						type="button"
						onClick={handleSave}
						className="cta-text inline-flex h-11 items-center justify-center rounded-full bg-terracotta px-5 text-xs text-terracotta-foreground transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta"
					>
						Zapisz wybór
					</button>
				</div>
			</div>
		</dialog>
	);
}

type ConsentRowProps = {
	title: string;
	description: string;
	checked: boolean;
	disabled?: boolean;
	onChange: (next: boolean) => void;
};

function ConsentRow({ title, description, checked, disabled, onChange }: ConsentRowProps) {
	const id = useId();
	return (
		<li
			className={cn(
				"flex items-start gap-4 rounded-xl border border-walnut/15 bg-card p-4",
				disabled && "opacity-80",
			)}
		>
			<div className="flex-1">
				<label htmlFor={id} className="block font-sans text-sm font-semibold">
					{title}
				</label>
				<p className="mt-1 text-xs leading-relaxed text-foreground/65">{description}</p>
			</div>
			<label
				htmlFor={id}
				className={cn(
					"mt-1 grid size-5 shrink-0 place-items-center rounded border border-walnut/35 bg-background",
					"has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-terracotta",
					disabled ? "cursor-not-allowed" : "cursor-pointer",
				)}
			>
				<input
					id={id}
					type="checkbox"
					checked={checked}
					disabled={disabled}
					onChange={(e) => onChange(e.target.checked)}
					className="sr-only"
				/>
				{checked ? <CheckIcon className="size-3.5 text-terracotta" aria-hidden /> : null}
			</label>
		</li>
	);
}
