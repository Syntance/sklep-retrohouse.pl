import { describe, expect, it } from "vitest";
import { KNOWN_EVENT_NAMES } from "@/lib/analytics/events";

/**
 * Anti-regression: nazwa eventu PostHog jest stabilną częścią
 * kontraktu z dashboardami i Notion ("Konwencja eventów"). Zmiana
 * = ręczne wyrównanie raportów. Jeśli ten test failuje,
 * świadomie zaktualizuj listę poniżej i dashboardy w PostHog.
 */
describe("analytics events contract", () => {
	const STRATEGY_EVENT_NAMES = [
		// Ogólne
		"page_viewed",
		"scroll_depth",
		"newsletter_signup",
		"whatsapp_clicked",
		"phone_clicked",
		"consent_updated",
		// Sklep i produkt
		"category_tile_clicked",
		"filter_used",
		"product_card_clicked",
		"product_viewed",
		"image_zoom",
		"product_ask_clicked",
		"wishlist_added",
		"related_product_clicked",
		"bestseller_clicked",
		// Hero / Homepage
		"hero_cta_clicked",
		"b2b_strip_clicked",
		// Koszyk i checkout
		"add_to_cart",
		"remove_from_cart",
		"view_cart",
		"checkout_started",
		"checkout_step_completed",
		"shipping_selected",
		"payment_selected",
		"invoice_requested",
		"gift_wrapping_selected",
		"purchase",
		"cart_abandoned",
		// Prezent
		"gift_budget_filter_selected",
		"gift_theme_selected",
		// B2B
		"b2b_brief_started",
		"b2b_brief_submitted",
		"b2b_budget_selected",
		"b2b_whatsapp_clicked",
		"b2b_call_scheduled",
		"b2b_case_study_clicked",
		"b2b_landing_clicked",
		"b2b_topic_selected",
		// Live / lokalizacja
		"live_reminder_signup",
		"visit_store_cta_clicked",
		"map_directions_clicked",
		// Blog / kontakt
		"article_cta_clicked",
		"related_article_clicked",
		"contact_form_submitted",
		"contact_topic_selected",
		// Retencja
		"ugc_cta_clicked",
		"review_google_clicked",
		// Story scroll
		"story_section_scrolled",
	] as const;

	it("KNOWN_EVENT_NAMES exposes every Notion-strategy event", () => {
		const set = new Set<string>(KNOWN_EVENT_NAMES);
		for (const expected of STRATEGY_EVENT_NAMES) {
			expect(set.has(expected), `missing event: ${expected}`).toBe(true);
		}
	});

	it("KNOWN_EVENT_NAMES has no duplicates", () => {
		const set = new Set(KNOWN_EVENT_NAMES);
		expect(set.size).toBe(KNOWN_EVENT_NAMES.length);
	});

	it("KNOWN_EVENT_NAMES uses snake_case + past-tense state", () => {
		for (const name of KNOWN_EVENT_NAMES) {
			expect(name, `event "${name}" must be snake_case`).toMatch(/^[a-z][a-z0-9_]*$/);
		}
	});
});
