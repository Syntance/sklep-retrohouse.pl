/** Odstąpienie (14 dni) lub reklamacja (zgodność z umową). */
export type ReturnRequestType = "withdrawal" | "claim";

export type ClaimRemedy = "repair" | "price_reduction" | "withdrawal";

/** Status wniosku o zwrot/odstąpienie od umowy (14 dni UPK art. 27). */
export type ReturnStatus =
	| "pending_approval" // Złożony przez klienta, czeka na akceptację
	| "approved" // Zaakceptowany, klient ma wysłać przesyłkę
	| "shipped" // Klient wysłał zwrot
	| "received" // Otrzymaliśmy zwrot
	| "refunded" // Zwróciliśmy pieniądze
	| "rejected" // Odrzucony (po 14 dniach, uszkodzenie)
	| "canceled"; // Anulowany przez klienta

/** Pojedyncza pozycja w zwrocie (może być partial — nie całe zamówienie). */
export type ReturnItem = {
	orderLineItemId: string;
	productTitle: string;
	quantity: number;
	unitPrice: number;
	thumbnail: string | null;
};

/** Wniosek o zwrot — pełne dane. */
export type ReturnRequest = {
	id: string;
	requestType: ReturnRequestType;
	orderId: string;
	orderDisplayId: number;
	customerEmail: string;
	status: ReturnStatus;
	/** Opis (reklamacja) lub powód zwrotu (odstąpienie). */
	reason: string;
	/** Tylko reklamacje — żądanie klienta. */
	claimRemedy: ClaimRemedy | null;
	/** Numer RK-… dla reklamacji (email do klienta). */
	claimReferenceId: string | null;
	items: ReturnItem[];
	totalToRefund: number; // Suma pozycji (może być < order total jeśli partial)
	createdAt: string;
	updatedAt: string;
	approvedAt: string | null;
	shippedAt: string | null;
	receivedAt: string | null;
	refundedAt: string | null;
	rejectedAt: string | null;
	rejectionReason: string | null;
	adminNotes: string | null;
};

/** Wiersz listy zwrotów w panelu magazynu. */
export type AdminReturnRow = {
	id: string;
	requestType: ReturnRequestType;
	orderDisplayId: number;
	customerEmail: string;
	status: ReturnStatus;
	totalToRefund: number;
	itemCount: number;
	createdAt: string;
};
