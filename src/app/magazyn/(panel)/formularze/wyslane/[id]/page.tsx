export const dynamic = "force-dynamic";

import Link from "next/link";
import { FormsSubnav } from "../../forms-subnav";
import { getSubmissionDetailAction } from "../../submissions-actions";

function formatWhen(iso: string): string {
	try {
		return new Intl.DateTimeFormat("pl-PL", {
			dateStyle: "long",
			timeStyle: "short",
		}).format(new Date(iso));
	} catch {
		return iso;
	}
}

export default async function SubmissionDetailPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const result = await getSubmissionDetailAction(id);

	if (!result.ok) {
		return (
			<div className="space-y-4">
				<FormsSubnav />
				<p className="text-sm text-destructive">{result.error}</p>
				<Link href="/magazyn/formularze/wyslane" className="text-sm text-terracotta hover:underline">
					← Wróć do listy
				</Link>
			</div>
		);
	}

	const s = result.submission;

	return (
		<div className="flex flex-col gap-6">
			<FormsSubnav />
			<Link href="/magazyn/formularze/wyslane" className="text-sm text-terracotta hover:underline">
				← Wysłane formularze
			</Link>
			<header className="space-y-1">
				<h1 className="font-serif text-2xl text-foreground">{s.caseNumber}</h1>
				<p className="text-sm text-muted-foreground">
					{s.formName} · {formatWhen(s.createdAt)}
				</p>
			</header>
			<dl className="grid gap-4 rounded-xl border border-border bg-card p-6 sm:grid-cols-2">
				<div>
					<dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
						Klient
					</dt>
					<dd className="mt-1 font-medium">{s.customerName}</dd>
					<dd className="text-sm text-muted-foreground">{s.customerEmail}</dd>
				</div>
				<div>
					<dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
						Temat
					</dt>
					<dd className="mt-1">{s.topicLabel}</dd>
					<dd className="font-mono text-xs text-muted-foreground">{s.topic}</dd>
				</div>
			</dl>
			<div className="rounded-xl border border-border bg-card p-6">
				<h2 className="text-sm font-semibold text-foreground">Wiadomość</h2>
				<p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
					{s.message}
				</p>
			</div>
		</div>
	);
}
