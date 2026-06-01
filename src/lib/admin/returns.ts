import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import type {
	AdminReturnRow,
	ReturnRequest,
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

async function readReturns(): Promise<ReturnRequest[]> {
	try {
		const data = await fs.readFile(RETURNS_FILE, "utf-8");
		return JSON.parse(data);
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
	orderId: string;
	orderDisplayId: number;
	customerEmail: string;
	items: ReturnRequest["items"];
	reason: string;
	totalToRefund: number;
}): Promise<ReturnRequest> {
	const returns = await readReturns();

	const newReturn: ReturnRequest = {
		id: `ret_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
		orderId: data.orderId,
		orderDisplayId: data.orderDisplayId,
		customerEmail: data.customerEmail,
		status: "pending_approval",
		reason: data.reason,
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
