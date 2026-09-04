export const dynamic = "force-dynamic";

import Link from "next/link";
import { PageHeader } from "@/components/panel/chrome";
import { FormsSubnav } from "../forms-subnav";
import { getSubmissionsListAction } from "../submissions-actions";

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

export default async function OtrzymaneFormularzePage() {
	const result = await getSubmissionsListAction();

	return (
		<div className="flex flex-col gap-6">
			<PageHeader
				className="mb-0"
				title="Otrzymane formularze"
				description="Archiwum wiadomości z formularzy kontaktowych na podstronach sklepu."
			/>

			<FormsSubnav />

			{!result.ok ? (
				<p className="text-sm text-destructive">{result.error}</p>
			) : result.submissions.length === 0 ? (
				<p className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
					Brak otrzymanych formularzy.
				</p>
			) : (
				<div className="overflow-hidden rounded-xl border border-border bg-card">
					<table className="w-full text-left text-sm">
						<thead className="border-b border-border bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
							<tr>
								<th className="px-4 py-3 font-medium">Numer</th>
								<th className="px-4 py-3 font-medium">Formularz</th>
								<th className="px-4 py-3 font-medium">Klient</th>
								<th className="px-4 py-3 font-medium">Temat</th>
								<th className="px-4 py-3 font-medium">Data</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-border">
							{result.submissions.map((row) => (
								<tr key={row.id} className="hover:bg-muted/30">
									<td className="px-4 py-3">
										<Link
											href={`/magazyn/formularze/otrzymane/${row.id}`}
											className="font-mono text-xs font-medium text-terracotta hover:underline"
										>
											{row.caseNumber}
										</Link>
									</td>
									<td className="px-4 py-3 text-foreground/90">{row.formName}</td>
									<td className="px-4 py-3">
										<span className="block font-medium">{row.customerName}</span>
										<span className="text-xs text-muted-foreground">{row.customerEmail}</span>
									</td>
									<td className="px-4 py-3">{row.topicLabel}</td>
									<td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
										{formatWhen(row.createdAt)}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);
}
