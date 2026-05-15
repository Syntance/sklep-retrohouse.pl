/**
 * RetroHouse — typed contract dla eventów PostHog.
 *
 * Źródło prawdy: Notion → "Stack technologiczny" → "Konwencja eventów".
 * Zasada: snake_case, czas przeszły (stan, nie akcja), parametry jako
 * properties (nie w nazwie). Każdy event MUSI być zdefiniowany tutaj
 * zanim trafi do kodu — wymóg z reguły 60-quality.
 *
 * Test anti-regression: tests/analytics-events.test.ts.
 */

/* ──────────────────────────────────────────────────────────── */
/* Słowniki współdzielone                                       */
/* ──────────────────────────────────────────────────────────── */

export type ProductSource =
	| "/sklep"
	| "/prezent"
	| "hp-bestsellers"
	| "/blog"
	| "pdp-related"
	| "/";

export type GiftBudgetBucket = "do_100" | "100_300" | "300_500" | "500_plus";

export type B2BBudgetBucket = "do_2k" | "2_5k" | "5_15k" | "15k_plus";

export type B2BTimeline = "lt_2w" | "2_4w" | "1_3m" | "elastycznie";

export type ShippingMethod = "inpost" | "dpd" | "dhl" | "pickup_nt";

export type PaymentMethod = "blik" | "card" | "transfer";

export type CheckoutStep = "data" | "shipping" | "payment";

export type ContactTopic = "produkt" | "b2b" | "wysylka" | "inne";

export type ScrollSection =
	| "hero"
	| "categories"
	| "bestsellers"
	| "live"
	| "story"
	| "social_proof"
	| "footer_cta"
	| "history"
	| "details"
	| "related"
	| "article_body"
	| "values"
	| "founders"
	| "store_nt"
	| "process"
	| "case_studies"
	| "trust"
	| "faq";

/* ──────────────────────────────────────────────────────────── */
/* Discriminated union — wszystkie 44 eventy                   */
/* ──────────────────────────────────────────────────────────── */

export type AnalyticsEvent =
	// Ogólne (wszystkie strony)
	| { name: "page_viewed"; properties: { path: string; referrer?: string; utm_source?: string; utm_medium?: string; utm_campaign?: string; utm_content?: string; utm_term?: string } }
	| { name: "scroll_depth"; properties: { percent: 25 | 50 | 75 | 100; section: ScrollSection } }
	| { name: "newsletter_signup"; properties: { source: "homepage" | "blog" | "footer" | "popup" | "b2b" | "live_reminder" } }
	| { name: "whatsapp_clicked"; properties: { source: string } }
	| { name: "phone_clicked"; properties: { source: string } }
	| { name: "consent_updated"; properties: { analytics: boolean; marketing: boolean; preferences: boolean } }
	// Sklep i produkt
	| { name: "category_tile_clicked"; properties: { category: string } }
	| { name: "filter_used"; properties: { filter_name: string; filter_value: string } }
	| { name: "product_card_clicked"; properties: { product_id: string; position: number; source: ProductSource } }
	| { name: "product_viewed"; properties: { product_id: string; category: string; price: number; source: ProductSource | "direct" } }
	| { name: "image_zoom"; properties: { image_index: number } }
	| { name: "product_ask_clicked"; properties: { channel: "form" | "dm" | "whatsapp" } }
	| { name: "wishlist_added"; properties: { product_id: string } }
	| { name: "related_product_clicked"; properties: { product_id: string; from_product_id: string } }
	| { name: "bestseller_clicked"; properties: { product_id: string; position: number } }
	// Hero / Homepage CTAs
	| { name: "hero_cta_clicked"; properties: { variant: "primary" | "secondary" } }
	| { name: "b2b_strip_clicked"; properties: Record<string, never> }
	// Koszyk i checkout
	| { name: "add_to_cart"; properties: { product_id: string; price: number; source: ProductSource | "pdp" } }
	| { name: "remove_from_cart"; properties: { product_id: string } }
	| { name: "view_cart"; properties: { items_count: number; cart_value: number } }
	| { name: "checkout_started"; properties: { cart_value: number } }
	| { name: "checkout_step_completed"; properties: { step: CheckoutStep } }
	| { name: "shipping_selected"; properties: { method: ShippingMethod } }
	| { name: "payment_selected"; properties: { method: PaymentMethod } }
	| { name: "invoice_requested"; properties: { has_nip: boolean } }
	| { name: "gift_wrapping_selected"; properties: Record<string, never> }
	| { name: "purchase"; properties: { value: number; currency: "PLN"; order_id: string; items: number } }
	| { name: "cart_abandoned"; properties: { cart_value: number; last_step: CheckoutStep | "cart" } }
	// Prezent (Flow 4)
	| { name: "gift_budget_filter_selected"; properties: { budget_bucket: GiftBudgetBucket } }
	| { name: "gift_theme_selected"; properties: { theme: string } }
	// B2B (Flow 5, segment C)
	| { name: "b2b_brief_started"; properties: Record<string, never> }
	| { name: "b2b_brief_submitted"; properties: { budget: B2BBudgetBucket; timeline: B2BTimeline; has_moodboard: boolean; newsletter_optin: boolean } }
	| { name: "b2b_budget_selected"; properties: { budget_bucket: B2BBudgetBucket } }
	| { name: "b2b_whatsapp_clicked"; properties: Record<string, never> }
	| { name: "b2b_call_scheduled"; properties: Record<string, never> }
	| { name: "b2b_case_study_clicked"; properties: { case_study_id: string } }
	| { name: "b2b_landing_clicked"; properties: { source: "/o-nas" | "footer" | "/blog" | "header" } }
	| { name: "b2b_topic_selected"; properties: Record<string, never> }
	// Live commerce (Flow 2)
	| { name: "live_reminder_signup"; properties: { channel: "email" | "calendar" } }
	// Lokalizacja / offline (Flow 3)
	| { name: "visit_store_cta_clicked"; properties: { source: "homepage" | "/o-nas" | "/kontakt" } }
	| { name: "map_directions_clicked"; properties: Record<string, never> }
	// Blog i kontakt
	| { name: "article_cta_clicked"; properties: { cta_type: "product" | "category" | "b2b" | "newsletter"; article_slug: string } }
	| { name: "related_article_clicked"; properties: { article_slug: string } }
	| { name: "contact_form_submitted"; properties: { topic: ContactTopic } }
	| { name: "contact_topic_selected"; properties: { topic: ContactTopic } }
	// Retencja / Post-purchase (Flow 6)
	| { name: "ugc_cta_clicked"; properties: Record<string, never> }
	| { name: "review_google_clicked"; properties: Record<string, never> }
	// Story scroll target (Notion: "story_section_scrolled" >60%)
	| { name: "story_section_scrolled"; properties: { percent: 25 | 50 | 75 | 100 } };

export type AnalyticsEventName = AnalyticsEvent["name"];

/**
 * Lista wszystkich nazw eventów — pojedyncze źródło prawdy
 * dla testu anti-regression. Manualna duplikacja z unii powyżej:
 * TS nie potrafi runtime-extract typów, więc lista musi być tu.
 *
 * Jeżeli dodasz event do `AnalyticsEvent`, dodaj go również tutaj
 * — test sprawdzi, czy lista jest w sync z dokumentem Notion.
 */
export const KNOWN_EVENT_NAMES = [
	"page_viewed",
	"scroll_depth",
	"newsletter_signup",
	"whatsapp_clicked",
	"phone_clicked",
	"consent_updated",
	"category_tile_clicked",
	"filter_used",
	"product_card_clicked",
	"product_viewed",
	"image_zoom",
	"product_ask_clicked",
	"wishlist_added",
	"related_product_clicked",
	"bestseller_clicked",
	"hero_cta_clicked",
	"b2b_strip_clicked",
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
	"gift_budget_filter_selected",
	"gift_theme_selected",
	"b2b_brief_started",
	"b2b_brief_submitted",
	"b2b_budget_selected",
	"b2b_whatsapp_clicked",
	"b2b_call_scheduled",
	"b2b_case_study_clicked",
	"b2b_landing_clicked",
	"b2b_topic_selected",
	"live_reminder_signup",
	"visit_store_cta_clicked",
	"map_directions_clicked",
	"article_cta_clicked",
	"related_article_clicked",
	"contact_form_submitted",
	"contact_topic_selected",
	"ugc_cta_clicked",
	"review_google_clicked",
	"story_section_scrolled",
] as const satisfies ReadonlyArray<AnalyticsEventName>;
