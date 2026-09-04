import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CLAIM_REMEDY_LABELS } from "@/lib/claims/labels";
import { formatPrice } from "@/lib/format";
import { getReturnDetailAction } from "../actions";
import { ReturnActions } from "./return-actions";

const STATUS_LABELS: Record<string, string> = {
	pending_approval: "Oczekuje na akceptację",
	approved: "Zaakceptowany",
	shipped: "Wysłany",
	received: "Otrzymany",
	refunded: "Zwrócono środki",
	rejected: "Odrzucony",
	canceled: "Anulowany",
};

export default async function ReturnDetailPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	const result = await getReturnDetailAction(id);

	if (!result.ok) {
		notFound();
	}

	const ret = result.return;
	const isClaim = ret.requestType === "claim";
	const typeLabel = isClaim ? "Reklamacja" : "Odstąpienie od umowy";

	return (
		<div className="space-y-6">
			<div className="flex items-center gap-4">
				<Link
					href="/magazyn/zwroty"
					className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
				>
					<ArrowLeft className="size-4" />
					Powrót
				</Link>
			</div>

			<div className="grid gap-6 lg:grid-cols-3">
				<div className="lg:col-span-2 space-y-6">
					<div className="rounded-xl border border-border bg-card p-6">
						<h1 className="font-serif text-2xl text-foreground mb-4">
							{typeLabel}: zamówienie #{ret.orderDisplayId}
						</h1>

						<dl className="grid grid-cols-2 gap-4 text-sm">
							{isClaim && ret.claimReferenceId ? (
								<div>
									<dt className="font-medium text-muted-foreground">Nr reklamacji</dt>
									<dd className="mt-1 font-mono text-foreground">{ret.claimReferenceId}</dd>
								</div>
							) : null}
							{isClaim && ret.claimRemedy ? (
								<div>
									<dt className="font-medium text-muted-foreground">Żądanie klienta</dt>
									<dd className="mt-1 text-foreground">{CLAIM_REMEDY_LABELS[ret.claimRemedy]}</dd>
								</div>
							) : null}
							<div>
								<dt className="font-medium text-muted-foreground">E-mail klienta</dt>
								<dd className="mt-1 text-foreground">{ret.customerEmail}</dd>
							</div>
							<div>
								<dt className="font-medium text-muted-foreground">Status</dt>
								<dd className="mt-1">
									<span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
										{STATUS_LABELS[ret.status] ?? ret.status}
									</span>
								</dd>
							</div>
							<div>
								<dt className="font-medium text-muted-foreground">Data złożenia</dt>
								<dd className="mt-1 text-foreground">
									{new Date(ret.createdAt).toLocaleString("pl-PL")}
								</dd>
							</div>
							<div>
								<dt className="font-medium text-muted-foreground">Kwota do zwrotu</dt>
								<dd className="mt-1 font-medium text-foreground">
									{formatPrice(ret.totalToRefund)}
								</dd>
							</div>
						</dl>
					</div>

					<div className="rounded-xl border border-border bg-card p-6">
						<h2 className="font-serif text-lg text-foreground mb-4">Produkty</h2>
						<div className="space-y-3">
							{ret.items.map((item) => (
								<div
									key={item.orderLineItemId}
									className="flex items-center gap-4 rounded-lg border border-border p-3"
								>
									{item.thumbnail && (
										<Image
											src={item.thumbnail}
											alt={item.productTitle}
											width={64}
											height={64}
											className="rounded object-cover"
										/>
									)}
									<div className="flex-1">
										<p className="font-medium text-foreground">{item.productTitle}</p>
										<p className="text-sm text-muted-foreground">
											{formatPrice(item.unitPrice)} × {item.quantity}
										</p>
									</div>
									<div className="text-right">
										<p className="font-medium text-foreground">
											{formatPrice(item.unitPrice * item.quantity)}
										</p>
									</div>
								</div>
							))}
						</div>
					</div>

					<div className="rounded-xl border border-border bg-card p-6">
						<h2 className="font-serif text-lg text-foreground mb-4">
							{isClaim ? "Opis niezgodności" : "Powód zwrotu"}
						</h2>
						<p className="text-sm text-foreground/80 leading-relaxed">{ret.reason}</p>
					</div>

					{ret.rejectionReason && (
						<div className="rounded-xl border border-destructive/50 bg-destructive/10 p-6">
							<h3 className="font-medium text-destructive mb-2">Powód odrzucenia</h3>
							<p className="text-sm text-destructive/80">{ret.rejectionReason}</p>
						</div>
					)}

					{ret.adminNotes && (
						<div className="rounded-xl border border-border bg-muted/30 p-6">
							<h3 className="font-medium text-foreground mb-2">Notatki admina</h3>
							<p className="text-sm text-foreground/80">{ret.adminNotes}</p>
						</div>
					)}
				</div>

				<div className="space-y-6">
					<div className="rounded-xl border border-border bg-card p-6">
						<ReturnActions returnId={ret.id} currentStatus={ret.status} />
					</div>

					<div className="rounded-xl border border-border bg-card p-6">
						<h3 className="font-serif text-lg text-foreground mb-4">Timeline</h3>
						<div className="space-y-3 text-sm">
							<div>
								<p className="font-medium text-foreground">Złożony</p>
								<p className="text-muted-foreground">
									{new Date(ret.createdAt).toLocaleString("pl-PL")}
								</p>
							</div>
							{ret.approvedAt && (
								<div>
									<p className="font-medium text-foreground">Zaakceptowany</p>
									<p className="text-muted-foreground">
										{new Date(ret.approvedAt).toLocaleString("pl-PL")}
									</p>
								</div>
							)}
							{ret.shippedAt && (
								<div>
									<p className="font-medium text-foreground">Wysłany</p>
									<p className="text-muted-foreground">
										{new Date(ret.shippedAt).toLocaleString("pl-PL")}
									</p>
								</div>
							)}
							{ret.receivedAt && (
								<div>
									<p className="font-medium text-foreground">Otrzymany</p>
									<p className="text-muted-foreground">
										{new Date(ret.receivedAt).toLocaleString("pl-PL")}
									</p>
								</div>
							)}
							{ret.refundedAt && (
								<div>
									<p className="font-medium text-success">Zwrócono środki</p>
									<p className="text-muted-foreground">
										{new Date(ret.refundedAt).toLocaleString("pl-PL")}
									</p>
								</div>
							)}
							{ret.rejectedAt && (
								<div>
									<p className="font-medium text-destructive">Odrzucony</p>
									<p className="text-muted-foreground">
										{new Date(ret.rejectedAt).toLocaleString("pl-PL")}
									</p>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
