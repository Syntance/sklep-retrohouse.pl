import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/panel/chrome";
import type { SettingsFieldStatus, SettingsStatusSection } from "@/lib/admin/settings-types";
import { cn } from "@/lib/utils";

const STATUS_LABEL: Record<SettingsFieldStatus, string> = {
	ok: "OK",
	warning: "Uwaga",
	missing: "Brak",
	info: "Info",
};

const STATUS_TONE: Record<SettingsFieldStatus, string> = {
	ok: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
	warning: "bg-amber-500/10 text-amber-600 dark:text-amber-500",
	missing: "bg-destructive/10 text-destructive",
	info: "bg-muted text-muted-foreground",
};

type Props = {
	icon: LucideIcon;
	section: SettingsStatusSection;
};

export function SettingsStatusView({ icon: Icon, section }: Props) {
	return (
		<Card>
			<div className="mb-5 flex items-center gap-3">
				<span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
					<Icon className="size-4" aria-hidden />
				</span>
				<div className="flex-1">
					<h2 className="font-serif text-lg text-foreground">{section.tytul}</h2>
					<p className="text-xs text-muted-foreground">{section.opis}</p>
				</div>
			</div>

			<dl className="grid gap-3 sm:grid-cols-2">
				{section.pola.map((p) => (
					<div key={p.label} className="rounded-lg border border-border bg-muted/30 p-3">
						<div className="flex flex-wrap items-center justify-between gap-2">
							<dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
								{p.label}
							</dt>
							{p.status ? (
								<span
									className={cn(
										"inline-flex items-center whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium",
										STATUS_TONE[p.status],
									)}
								>
									{STATUS_LABEL[p.status]}
								</span>
							) : null}
						</div>
						<dd className="mt-1 text-sm text-foreground">{p.val}</dd>
						{p.hint ? <p className="mt-2 text-xs text-muted-foreground">{p.hint}</p> : null}
					</div>
				))}
			</dl>
		</Card>
	);
}
