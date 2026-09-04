import { PackageX } from "lucide-react";
import Link from "next/link";
import { Badge, PageHeader } from "@/components/panel/chrome";
import { formatPrice } from "@/lib/format";
import { getReturnsListAction } from "./actions";

const STATUS_LABELS: Record<string, string> = {
	pending_approval: "Oczekuje na akceptację",
	approved: "Zaakceptowany",
	shipped: "Wysłany",
	received: "Otrzymany",
	refunded: "Zwrócono środki",
	rejected: "Odrzucony",
	canceled: "Anulowany",
};

const REQUEST_TYPE_LABELS: Record<string, string> = {
	claim: "Reklamacja",
	withdrawal: "Odstąpienie",
};

const REQUEST_TYPE_COLORS: Record<string, string> = {
	claim: "bg-terracotta/15 text-terracotta",
	withdrawal: "bg-muted text-muted-foreground",
};

const STATUS_COLORS: Record<string, string> = {
	pending_approval: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100",
	approved: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
	shipped: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100",
	received: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-100",
	refunded: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
	rejected: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
	canceled: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100",
};

export default async function ZwrotyPage() {
	const result = await getReturnsListAction();

	if (!result.ok) {
		return (
			<div className="flex flex-col gap-6">
				<PageHeader className="mb-0" title="Zwroty i reklamacje" />
				<div className="rounded-xl border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
					{result.error}
				</div>
			</div>
		);
	}

	const returns = result.returns;

	return (
		<div className="flex flex-col gap-6">
			<PageHeader
				className="mb-0"
				title="Zwroty i reklamacje"
				action={<Badge tone="neutral">{returns.length}</Badge>}
			/>

			{returns.length === 0 ? (
				<div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/30 py-16 px-6 text-center">
					<PackageX className="size-12 text-muted-foreground mb-4" />
					<p className="text-sm font-medium text-foreground">Brak wniosków</p>
					<p className="mt-1 text-xs text-muted-foreground">
						Zwroty (odstąpienie) i reklamacje pojawią się tutaj po złożeniu przez klienta
					</p>
				</div>
			) : (
				<div className="overflow-hidden rounded-xl border border-border bg-card">
					<table className="w-full">
						<thead className="border-b border-border bg-muted/50">
							<tr>
								<th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
									Typ
								</th>
								<th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
									Zamówienie
								</th>
								<th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
									Email klienta
								</th>
								<th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
									Status
								</th>
								<th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">
									Kwota
								</th>
								<th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
									Data
								</th>
								<th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">
									Akcje
								</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-border">
							{returns.map((ret) => (
								<tr key={ret.id} className="hover:bg-muted/30 transition-colors">
									<td className="px-4 py-3">
										<span
											className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${REQUEST_TYPE_COLORS[ret.requestType] ?? ""}`}
										>
											{REQUEST_TYPE_LABELS[ret.requestType] ?? ret.requestType}
										</span>
									</td>
									<td className="px-4 py-3">
										<span className="font-mono text-sm font-medium text-foreground">
											#{ret.orderDisplayId}
										</span>
									</td>
									<td className="px-4 py-3">
										<span className="text-sm text-foreground">{ret.customerEmail}</span>
									</td>
									<td className="px-4 py-3">
										<span
											className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[ret.status] ?? ""}`}
										>
											{STATUS_LABELS[ret.status] ?? ret.status}
										</span>
									</td>
									<td className="px-4 py-3 text-right">
										<span className="text-sm font-medium text-foreground">
											{formatPrice(ret.totalToRefund)}
										</span>
									</td>
									<td className="px-4 py-3">
										<span className="text-sm text-muted-foreground">
											{new Date(ret.createdAt).toLocaleDateString("pl-PL")}
										</span>
									</td>
									<td className="px-4 py-3 text-right">
										<Link
											href={`/magazyn/zwroty/${ret.id}`}
											className="text-sm font-medium text-primary hover:underline"
										>
											Szczegóły →
										</Link>
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
