import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import type {
	AdminReturnRow,
	ClaimRemedy,
	ReturnRequest,
	ReturnRequestType,
	ReturnStatus,
} from "@/lib/admin/return-types";

/**
 * Uproszczony storage dla return requests (JSON file).
 * W produkcji: PostgreSQL / Medusa DB.
 */

const RETURNS_FILE = path.join(process.cwd(), "data", "returns.json");

async function ensureDataDir() {
	const dir = path.dirname(RETURNS_FILE);
	try {
		await fs.mkdir(dir, { recursive: true });
	} catch {
		// Directory exists
	}
}

function normalizeReturn(raw: ReturnRequest): ReturnRequest {
	return {
		...raw,
		requestType: raw.requestType ?? "withdrawal",
		claimRemedy: raw.claimRemedy ?? null,
		claimReferenceId: raw.claimReferenceId ?? null,
	};
}

async function readReturns(): Promise<ReturnRequest[]> {
	try {
		const data = await fs.readFile(RETURNS_FILE, "utf-8");
		const parsed = JSON.parse(data) as ReturnRequest[];
		return parsed.map(normalizeReturn);
	} catch {
		return [];
	}
}

async function writeReturns(returns: ReturnRequest[]): Promise<void> {
	await ensureDataDir();
	await fs.writeFile(RETURNS_FILE, JSON.stringify(returns, null, 2));
}

/**
 * Tworzy nowy wniosek o zwrot.
 */
export async function createReturnRequest(data: {
	requestType: ReturnRequestType;
	orderId: string;
	orderDisplayId: number;
	customerEmail: string;
	items: ReturnRequest["items"];
	reason: string;
	totalToRefund: number;
	claimRemedy?: ClaimRemedy | null;
	claimReferenceId?: string | null;
}): Promise<ReturnRequest> {
	const returns = await readReturns();

	const newReturn: ReturnRequest = {
		id: `ret_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
		requestType: data.requestType,
		orderId: data.orderId,
		orderDisplayId: data.orderDisplayId,
		customerEmail: data.customerEmail,
		status: "pending_approval",
		reason: data.reason,
		claimRemedy: data.claimRemedy ?? null,
		claimReferenceId: data.claimReferenceId ?? null,
		items: data.items,
		totalToRefund: data.totalToRefund,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
		approvedAt: null,
		shippedAt: null,
		receivedAt: null,
		refundedAt: null,
		rejectedAt: null,
		rejectionReason: null,
		adminNotes: null,
	};

	returns.push(newReturn);
	await writeReturns(returns);

	return newReturn;
}

/**
 * Pobiera wszystkie zwroty (panel admin).
 */
export async function getAllReturns(): Promise<AdminReturnRow[]> {
	const returns = await readReturns();
	return returns.map((r) => ({
		id: r.id,
		requestType: r.requestType,
		orderDisplayId: r.orderDisplayId,
		customerEmail: r.customerEmail,
		status: r.status,
		totalToRefund: r.totalToRefund,
		itemCount: r.items.length,
		createdAt: r.createdAt,
	}));
}

/**
 * Pobiera szczegóły zwrotu.
 */
export async function getReturnById(id: string): Promise<ReturnRequest | null> {
	const returns = await readReturns();
	return returns.find((r) => r.id === id) ?? null;
}

/**
 * Wnioski klienta (zwroty + reklamacje) po zweryfikowanym e-mailu z OTP.
 */
export async function getReturnRequestsByCustomerEmail(email: string): Promise<ReturnRequest[]> {
	const returns = await readReturns();
	const normalized = email.trim().toLowerCase();
	return returns.filter((r) => r.customerEmail.trim().toLowerCase() === normalized);
}

const ACTIVE_STATUSES: ReturnRequest["status"][] = [
	"pending_approval",
	"approved",
	"shipped",
	"received",
];

function isActiveReturnRequest(r: ReturnRequest): boolean {
	return ACTIVE_STATUSES.includes(r.status);
}

/** Aktywna reklamacja na zamówienie (blokuje odstąpienie). */
export async function getActiveClaimForOrder(
	customerEmail: string,
	orderId: string,
): Promise<ReturnRequest | null> {
	const requests = await getReturnRequestsByCustomerEmail(customerEmail);
	return (
		requests.find(
			(r) => r.requestType === "claim" && r.orderId === orderId && isActiveReturnRequest(r),
		) ?? null
	);
}

/** Aktywne odstąpienie na zamówienie (blokuje reklamację). */
export async function getActiveWithdrawalForOrder(
	customerEmail: string,
	orderId: string,
): Promise<ReturnRequest | null> {
	const requests = await getReturnRequestsByCustomerEmail(customerEmail);
	return (
		requests.find(
			(r) => r.requestType === "withdrawal" && r.orderId === orderId && isActiveReturnRequest(r),
		) ?? null
	);
}

/**
 * Aktualizuje status zwrotu (admin).
 */
export async function updateReturnStatus(
	id: string,
	status: ReturnStatus,
	extra?: {
		rejectionReason?: string;
		adminNotes?: string;
	},
): Promise<void> {
	const returns = await readReturns();
	const returnIdx = returns.findIndex((r) => r.id === id);
	if (returnIdx === -1) throw new Error("Return not found");

	const now = new Date().toISOString();
	const ret = returns[returnIdx];
	ret.status = status;
	ret.updatedAt = now;

	if (status === "approved") ret.approvedAt = now;
	if (status === "shipped") ret.shippedAt = now;
	if (status === "received") ret.receivedAt = now;
	if (status === "refunded") ret.refundedAt = now;
	if (status === "rejected") {
		ret.rejectedAt = now;
		if (extra?.rejectionReason) ret.rejectionReason = extra.rejectionReason;
	}

	if (extra?.adminNotes) ret.adminNotes = extra.adminNotes;

	returns[returnIdx] = ret;
	await writeReturns(returns);
}
