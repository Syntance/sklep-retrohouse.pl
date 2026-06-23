"use client";

import Link from "next/link";
import { Edit3, Eye, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	EMAIL_TEMPLATE_TYPES,
	type EmailTemplate,
	isEmailTemplateEnabled,
} from "@/lib/email/template-types";
import { Badge, Card, PageHeader, StatTile } from "@/components/panel/chrome";

const EMAILS_BASE_PATH = "/magazyn/maile";

type Props = {
	templates: EmailTemplate[];
};

export function EmailsList({ templates }: Props) {
	const byType = new Map(templates.map((t) => [t.type, t]));
	const enabledCount = templates.filter((t) => isEmailTemplateEnabled(t)).length;

	return (
		<div className="flex flex-col gap-6">
			<PageHeader
				className="mb-0"
				title="E-maile"
				description="Szablony wiadomości transakcyjnych wysyłanych do klientów."
				action={
					<Button type="button" disabled className="gap-1.5 opacity-60">
						<Mail className="size-4" aria-hidden />
						Nowy szablon
					</Button>
				}
			/>

			<div className="grid gap-4 sm:grid-cols-3">
				<StatTile label="Aktywne szablony" value={enabledCount} />
				<StatTile label="Łącznie" value={templates.length} />
				<StatTile label="Kategorie" value="Zamówienie · Reklamacje · Formularze" />
			</div>

			<ul className="flex flex-col gap-3">
				{EMAIL_TEMPLATE_TYPES.map(({ type, label, description }) => {
					const template = byType.get(type);
					const enabled = isEmailTemplateEnabled(template);
					return (
						<li key={type}>
							<Card className="p-5">
								<div className="flex flex-col gap-4 lg:flex-row lg:items-center">
									<div className="flex flex-1 items-center gap-4">
										<div className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
											<Mail className="size-4" aria-hidden />
										</div>
										<div className="min-w-0 flex-1">
											<div className="flex flex-wrap items-center gap-2">
												<p className="text-sm font-semibold text-foreground">{label}</p>
												<Badge tone={enabled ? "success" : "warning"}>
													{enabled ? "Aktywny" : "Wyłączony"}
												</Badge>
											</div>
											<p className="mt-0.5 font-mono text-xs text-muted-foreground">{type}</p>
											<p className="mt-1 text-xs text-muted-foreground">{description}</p>
										</div>
									</div>

									<div className="flex gap-2">
										<Button type="button" variant="outline" size="sm" disabled className="gap-1.5">
											<Eye className="size-3.5" aria-hidden />
											Podgląd
										</Button>
										<Link
											href={`${EMAILS_BASE_PATH}/${type}`}
											className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-card px-3 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
										>
											<Edit3 className="size-3.5" aria-hidden />
											Edytuj
										</Link>
									</div>
								</div>
							</Card>
						</li>
					);
				})}
			</ul>
		</div>
	);
}
