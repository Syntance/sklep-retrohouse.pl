/**
 * Testimoniale klientek RetroHouse — TON „Na Ty" z brandbooka 2026-05-03.
 *
 * UWAGA: do czasu zebrania prawdziwych opinii (z anonimizacją + zgodą),
 * lista jest pusta. Komponent `SocialProofSection` w `src/components/sections`
 * obsługuje stan `length === 0` (renderuje wariant „pre-launch").
 *
 * Procedura dodawania opinii (Notion „SOP — Social Proof"):
 *  1. Zrzut DM/IG + zgoda klientki na publikację (mail / DM).
 *  2. Anonimizacja do imię + miasto (NIE nazwisko).
 *  3. Field `source: 'instagram' | 'dm' | 'google'`.
 *  4. Field `purchasedSlug` jeśli klient wskazał konkretny produkt.
 *  5. Pole `consentVersion` z datą zgody dla audytu GDPR.
 */
export type Testimonial = {
	id: string;
	body: string;
	author: string;
	location: string;
	source: "instagram" | "dm" | "google" | "direct";
	rating: 5;
	purchasedSlug?: string;
	/** Data otrzymania zgody na publikację (YYYY-MM-DD) — wymagane przed go-live. */
	consentDate: string;
};

export const TESTIMONIALS: Testimonial[] = [];
