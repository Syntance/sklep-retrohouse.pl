import type { SocialLinks } from "./types";

function trimSocialValue(value: unknown): string | undefined {
	if (typeof value !== "string") return undefined;
	const trimmed = value.trim();
	return trimmed.length > 0 ? trimmed : undefined;
}

/** Usuwa puste / białe znaki — linki bez wartości nie trafiają na storefront. */
export function normalizeSocialLinks(links?: SocialLinks | null): SocialLinks | undefined {
	if (!links) return undefined;

	const normalized: SocialLinks = {};
	const instagram = trimSocialValue(links.instagram);
	const facebook = trimSocialValue(links.facebook);
	const whatsapp = trimSocialValue(links.whatsapp);

	if (instagram) normalized.instagram = instagram;
	if (facebook) normalized.facebook = facebook;
	if (whatsapp) normalized.whatsapp = whatsapp;

	return Object.keys(normalized).length > 0 ? normalized : undefined;
}

export function hasSocialLink(value?: string): value is string {
	return trimSocialValue(value) !== undefined;
}

/** Numer, pełny wa.me lub whatsapp.com → href do otwarcia czatu. */
export function buildWhatsAppHref(value: string): string {
	const trimmed = value.trim();
	if (/^https?:\/\//i.test(trimmed)) return trimmed;

	const digits = trimmed.replace(/\D/g, "");
	if (!digits) return trimmed;

	return `https://wa.me/${digits}`;
}
