"use client";

import { useEffect, useState } from "react";
import type { ContactSubmission } from "@/lib/admin/contact-submissions";

type Props = {
	token: string;
};

function formatWhen(iso: string): string {
	try {
		return new Intl.DateTimeFormat("pl-PL", {
			dateStyle: "medium",
			timeStyle: "short",
		}).format(new Date(iso));
	} catch {
		return iso;
	}
}

export function CustomerContactSubmissions({ token }: Props) {
	const [rows, setRows] = useState<ContactSubmission[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [expandedId, setExpandedId] = useState<string | null>(null);

	useEffect(() => {
		let cancelled = false;
		(async () => {
			setLoading(true);
			setError(null);
			try {
				const res = await fetch("/api/customer/contact-submissions", {
					headers: { Authorization: `Bearer ${token}` },
				});
				const data = (await res.json()) as {
					ok: boolean;
					submissions?: ContactSubmission[];
					error?: string;
				};
				if (cancelled) return;
				if (!data.ok || !data.submissions) {
					setError(data.error ?? "Nie udało się wczytać formularzy.");
					setRows([]);
					return;
				}
				setRows(data.submissions);
			} catch {
				if (!cancelled) setError("Nie udało się wczytać formularzy.");
			} finally {
				if (!cancelled) setLoading(false);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [token]);

	if (loading) {
		return <p className="text-sm text-muted-foreground">Ładowanie formularzy…</p>;
	}

	if (error) {
		return <p className="text-sm text-destructive">{error}</p>;
	}

	if (rows.length === 0) {
		return (
			<p className="rounded-xl border border-border bg-muted/30 p-6 text-sm text-muted-foreground">
				Nie masz jeszcze wysłanych formularzy kontaktowych na ten adres e-mail.
			</p>
		);
	}

	return (
		<ul className="space-y-3">
			{rows.map((row) => {
				const open = expandedId === row.id;
				return (
					<li key={row.id} className="rounded-xl border border-border bg-card">
						<button
							type="button"
							className="flex w-full flex-wrap items-start justify-between gap-2 px-4 py-3 text-left"
							onClick={() => setExpandedId(open ? null : row.id)}
							aria-expanded={open}
						>
							<div>
								<p className="font-mono text-xs font-medium text-terracotta">{row.caseNumber}</p>
								<p className="mt-1 text-sm font-medium text-foreground">{row.topicLabel}</p>
								<p className="text-xs text-muted-foreground">{row.formName}</p>
							</div>
							<time className="text-xs text-muted-foreground">{formatWhen(row.createdAt)}</time>
						</button>
						{open ? (
							<div className="border-t border-border px-4 py-3 text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">
								{row.message}
							</div>
						) : null}
					</li>
				);
			})}
		</ul>
	);
}
