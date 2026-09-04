/** Identyfikatory podstron zarządzanych przez CMS. */
export type ContentPageId = "home" | "o-nas" | "prezent" | "kontakt" | "sklep";

export type SeoMeta = {
	metaTitle?: string;
	metaDescription?: string;
	ogTitle?: string;
	ogDescription?: string;
	ogImageUrl?: string;
	canonicalUrl?: string;
	noIndex?: boolean;
	noFollow?: boolean;
};

type AnnouncementBar = {
	enabled: boolean;
	text: string;
	link?: string;
};

/** Baner popup nad treścią — sterowany z /magazyn/cms/banery-popup. */
export type PopupBanner = {
	enabled: boolean;
	title: string;
	body?: string;
	imageUrl?: string;
	imageAlt?: string;
	ctaLabel?: string;
	ctaHref?: string;
	/** Po zamknięciu nie pokazuj ponownie w tej sesji przeglądarki. */
	oncePerSession: boolean;
	/** Opóźnienie przed pokazaniem (ms) — 0 = od razu. */
	delayMs: number;
};

export type SocialLinks = {
	instagram?: string;
	facebook?: string;
	whatsapp?: string;
};

export type SiteSettings = {
	title: string;
	description: string;
	announcementBar?: AnnouncementBar;
	popupBanner?: PopupBanner;
	socialLinks?: SocialLinks;
	footerText?: string;
	titleTemplate?: string;
	defaultOgImageUrl?: string;
	googleSiteVerification?: string;
	seo?: SeoMeta;
};

export type HeroContent = {
	headline: string;
	subLead?: string;
	description: string;
	ctaLabel: string;
	ctaHref: string;
	ctaSecondaryLabel?: string;
	ctaSecondaryHref?: string;
	productImageUrl?: string;
	productImageAlt?: string;
	productImageWidth?: number;
	productImageHeight?: number;
	/** Panorama tła hero (np. /sklep). */
	backgroundImageUrl?: string;
	backgroundImageAlt?: string;
};

export type FaqItem = {
	id: string;
	question: string;
	answer: string;
	order: number;
};

export type PageContent = {
	hero?: Partial<HeroContent>;
	faq?: FaqItem[];
};

export type GlobalContent = {
	announcementBar?: AnnouncementBar;
};

export type PageSeoMap = Partial<Record<ContentPageId, SeoMeta>>;
export type PageContentMap = Partial<Record<ContentPageId, PageContent>>;
