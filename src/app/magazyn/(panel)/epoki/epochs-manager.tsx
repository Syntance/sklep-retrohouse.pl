"use client";

import { Check, Clock, Pencil, Plus, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AdminEpoch } from "@/lib/admin/epochs";
import { slugify } from "@/lib/admin/slug";
import { cn } from "@/lib/utils";
import { deleteEpochAction, saveEpochAction } from "./actions";

type FormState = {
	previousValue?: string;
	label: string;
};

const EMPTY: FormState = {
	label: "",
};

export function EpochsManager({ epochs }: { epochs: AdminEpoch[] }) {
	const router = useRouter();
	const [form, setForm] = useState<FormState>(EMPTY);
	const [error, setError] = useState<string | null>(null);
	const [pending, startTransition] = useTransition();

	const isEditing = Boolean(form.previousValue);

	function startEdit(epoch: AdminEpoch) {
		setError(null);
		setForm({
			previousValue: epoch.value,
			label: epoch.label,
		});
	}

	function reset() {
		setForm(EMPTY);
		setError(null);
	}

	function onSubmit(event: React.FormEvent) {
		event.preventDefault();
		setError(null);
		startTransition(async () => {
			const result = await saveEpochAction({
				previousValue: form.previousValue,
				label: form.label.trim(),
			});
			if (!result.ok) {
				setError(result.error);
				return;
			}
			reset();
			router.refresh();
		});
	}

	function onDelete(epoch: AdminEpoch) {
		if (epoch.productCount > 0) {
			if (
				!window.confirm(
					`Epoka „${epoch.label}" jest przypisana do ${epoch.productCount} produktów. Usunąć mimo to?`,
				)
			)
				return;
		} else if (!window.confirm(`Usunąć epokę „${epoch.label}"?`)) {
			return;
		}

		startTransition(async () => {
			const result = await deleteEpochAction(epoch.value);
			if (!result.ok) {
				setError(result.error);
				return;
			}
			if (form.previousValue === epoch.value) reset();
			router.refresh();
		});
	}

	return (
		<div className="grid gap-6 lg:grid-cols-[1fr_340px]">
			<div className="overflow-hidden rounded-xl border border-border">
				{epochs.length === 0 ? (
					<p className="p-8 text-center text-sm text-muted-foreground">
						Brak epok. Dodaj pierwszą po prawej.
					</p>
				) : (
					<ul className="divide-y divide-border">
						{epochs.map((epoch) => (
							<li
								key={epoch.value}
								className="flex items-center gap-3 bg-card px-4 py-3 transition-colors hover:bg-muted/30"
							>
								<span className="grid size-8 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground">
									<Clock className="size-4" aria-hidden />
								</span>
								<div className="min-w-0 flex-1">
									<span className="block truncate text-sm font-medium text-foreground">
										{epoch.label}
									</span>
									<span className="text-xs text-muted-foreground">
										/{epoch.value} · {epoch.productCount} prod.
									</span>
								</div>
								<button
									type="button"
									onClick={() => startEdit(epoch)}
									aria-label={`Edytuj ${epoch.label}`}
									className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
								>
									<Pencil className="size-4" aria-hidden />
								</button>
								<button
									type="button"
									onClick={() => onDelete(epoch)}
									disabled={pending}
									aria-label={`Usuń ${epoch.label}`}
									className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-destructive/30 disabled:opacity-50"
								>
									<Trash2 className="size-4" aria-hidden />
								</button>
							</li>
						))}
					</ul>
				)}
			</div>

			<form
				onSubmit={onSubmit}
				className="flex h-fit flex-col gap-4 rounded-xl border border-border bg-card p-5"
			>
				<div className="flex items-center justify-between">
					<h2 className="font-serif text-lg text-foreground">
						{isEditing ? "Edytuj epokę" : "Nowa epoka"}
					</h2>
					{isEditing ? (
						<button
							type="button"
							onClick={reset}
							className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
						>
							<X className="size-3.5" aria-hidden />
							Anuluj
						</button>
					) : null}
				</div>

				<div className="flex flex-col gap-1.5">
					<label htmlFor="epoch-label" className="text-sm font-medium">
						Nazwa
					</label>
					<Input
						id="epoch-label"
						value={form.label}
						onChange={(e) => setForm((prev) => ({ ...prev, label: e.target.value }))}
						placeholder="np. Art Deco"
						required
						className="h-10"
					/>
					{form.label.trim() ? (
						<p className="text-xs text-muted-foreground">Adres: /{slugify(form.label)}</p>
					) : null}
				</div>

				{error ? (
					<p role="alert" className="text-sm text-destructive">
						{error}
					</p>
				) : null}

				<Button type="submit" size="lg" disabled={pending} className={cn("h-10 gap-1.5")}>
					{isEditing ? <Check className="size-4" aria-hidden /> : <Plus className="size-4" aria-hidden />}
					{pending ? "Zapisywanie…" : isEditing ? "Zapisz" : "Dodaj epokę"}
				</Button>
			</form>
		</div>
	);
}
