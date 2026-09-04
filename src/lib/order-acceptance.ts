/**
 * Typy i stałe dla danych akceptacji zbieranych w Kroku 4 checkoutu.
 *
 * Gdy Medusa zostanie podpięta (Railway + DB), te typy mapują się
 * bezpośrednio na metadata pól order i order line item:
 *
 *  Order metadata:
 *    terms_accepted_at        — ISO timestamp
 *    terms_version            — z TERMS_VERSION (legal-versions.ts)
 *    privacy_accepted_at      — ISO timestamp
 *    privacy_version          — z PRIVACY_VERSION (legal-versions.ts)
 *
 *  Line item metadata (per przedmiot):
 *    accepted_at              — ISO timestamp (moment kliknięcia checkboxa)
 *    product_description_snapshot — string (plain text z conditionDescription)
 *    product_description_version  — 8-char hash (z condition-hash.ts)
 *
 * Dane zbierane po stronie klienta w checkout-form, wysyłane do /api/checkout.
 */

export type LineItemAcceptance = {
	/** Slug produktu jako klucz identyfikujący pozycję w koszyku. */
	productSlug: string;
	/** ISO timestamp kliknięcia checkboxa dla tego przedmiotu. */
	acceptedAt: string;
	/** Plain text snapshot opisu stanu (z product.condition w mock / Sanity). */
	productDescriptionSnapshot: string;
	/** 8-char djb2/SHA-256 hash z treści snapshotu. */
	productDescriptionVersion: string;
};

export type OrderAcceptance = {
	/** Akceptacje per-przedmiot — musi zawierać wpis dla każdej pozycji w koszyku. */
	items: LineItemAcceptance[];
	/** ISO timestamp akceptacji regulaminu. */
	termsAcceptedAt: string;
	/** Wersja regulaminu (z TERMS_VERSION). */
	termsVersion: string;
	/** ISO timestamp akceptacji polityki prywatności. */
	privacyAcceptedAt: string;
	/** Wersja polityki prywatności (z PRIVACY_VERSION). */
	privacyVersion: string;
};
