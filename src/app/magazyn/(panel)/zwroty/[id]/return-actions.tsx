"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { updateReturnStatusAction } from "../actions";
import type { ReturnStatus } from "@/lib/admin/return-types";

type Props = {
	returnId: string;
	currentStatus: ReturnStatus;
};

export function ReturnActions({ returnId, currentStatus }: Props) {
	const [loading, setLoading] = useState(false);
	const [rejectionReason, setRejectionReason] = useState("");
	const [showRejectForm, setShowRejectForm] = useState(false);
	const router = useRouter();

	async function handleStatusChange(newStatus: ReturnStatus, extra?: Record<string, string>) {
		setLoading(true);
		try {
			const result = await updateReturnStatusAction(returnId, newStatus, extra);

			if (result.ok) {
				toast.success("Status zaktualizowany");
				router.refresh();
				setShowRejectForm(false);
			} else {
				toast.error(result.error ?? "Błąd aktualizacji");
			}
		} catch {
			toast.error("Błąd połączenia");
		} finally {
			setLoading(false);
		}
	}

	function handleReject() {
		if (!rejectionReason.trim()) {
			toast.error("Podaj powód odrzucenia");
			return;
		}
		handleStatusChange("rejected", { rejectionReason });
	}

	if (currentStatus === "refunded" || currentStatus === "canceled") {
		return (
			<div className="rounded-lg border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
				Zwrot zakończony — brak dostępnych akcji
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<h3 className="font-serif text-lg text-foreground">Akcje</h3>

			{currentStatus === "pending_approval" && (
				<div className="flex gap-2">
					<Button
						onClick={() => handleStatusChange("approved")}
						disabled={loading}
						variant="default"
						size="sm"
					>
						Zaakceptuj zwrot
					</Button>
					<Button
						onClick={() => setShowRejectForm(!showRejectForm)}
						disabled={loading}
						variant="outline"
						size="sm"
					>
						Odrzuć
					</Button>
				</div>
			)}

			{currentStatus === "approved" && (
				<Button
					onClick={() => handleStatusChange("shipped")}
					disabled={loading}
					variant="default"
					size="sm"
				>
					Oznacz jako wysłany przez klienta
				</Button>
			)}

			{currentStatus === "shipped" && (
				<Button
					onClick={() => handleStatusChange("received")}
					disabled={loading}
					variant="default"
					size="sm"
				>
					Oznacz jako otrzymany
				</Button>
			)}

			{currentStatus === "received" && (
				<Button
					onClick={() => handleStatusChange("refunded")}
					disabled={loading}
					variant="default"
					size="sm"
				>
					Oznacz jako zwrócono środki
				</Button>
			)}

			{showRejectForm && (
				<div className="rounded-lg border border-border bg-card p-4 space-y-3">
					<div>
						<label htmlFor="rejection-reason" className="block text-sm font-medium mb-1.5">
							Powód odrzucenia
						</label>
						<textarea
							id="rejection-reason"
							value={rejectionReason}
							onChange={(e) => setRejectionReason(e.target.value)}
							placeholder="Np. Minął termin 14 dni..."
							rows={3}
							className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
							disabled={loading}
						/>
					</div>
					<div className="flex gap-2">
						<Button onClick={handleReject} disabled={loading} variant="destructive" size="sm">
							Potwierdź odrzucenie
						</Button>
						<Button
							onClick={() => setShowRejectForm(false)}
							disabled={loading}
							variant="ghost"
							size="sm"
						>
							Anuluj
						</Button>
					</div>
				</div>
			)}
		</div>
	);
}
