import { z } from "zod";

/**
 * Model danych wizualnego edytora e-maili transakcyjnych.
 *
 * Edytor jest blokowy (email-safe): bloki układane pionowo + kolumny + odstępy.
 * Brak absolutnego pozycjonowania — w klientach pocztowych (Gmail/Outlook)
 * liczy się układ tabelaryczny z inline-style. Renderer w render-template.ts.
 */

export type TextAlign = "left" | "center" | "right";

export type FontKey = "serif" | "sans" | "mono";

/** Stosy fontów email-safe (web-safe — bez ładowania zewnętrznych krojów). */
export const FONT_STACKS: Record<FontKey, string> = {
	serif: "Georgia, 'Times New Roman', Times, serif",
	sans: "-apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
	mono: "'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace",
};

/** Globalny motyw e-maila — kolory, font, szerokość, nagłówek marki. */
export type EmailTheme = {
	bg: string;
	contentBg: string;
	text: string;
	heading: string;
	accent: string;
	muted: string;
	link: string;
	fontKey: FontKey;
	contentWidth: number;
	radius: number;
	headerBg: string;
	headerText: string;
	brandName: string;
};

/** Styl wspólny dla bloków tekstowych. */
export type BlockStyle = {
	color?: string;
	fontSize?: number;
	bold?: boolean;
	italic?: boolean;
	align?: TextAlign;
	bg?: string;
	paddingY?: number;
	paddingX?: number;
};

type BaseBlock = { id: string };

export type HeadingBlock = BaseBlock & {
	type: "heading";
	text: string;
	level: 1 | 2 | 3;
	style: BlockStyle;
};

export type TextBlock = BaseBlock & {
	type: "text";
	text: string;
	style: BlockStyle;
};

export type ImageBlock = BaseBlock & {
	type: "image";
	src: string;
	alt: string;
	href?: string;
	width: number;
	align: TextAlign;
	paddingY?: number;
};

export type ButtonBlock = BaseBlock & {
	type: "button";
	label: string;
	href: string;
	bg?: string;
	color?: string;
	radius?: number;
	align?: TextAlign;
	paddingY?: number;
};

export type DividerBlock = BaseBlock & {
	type: "divider";
	color?: string;
	paddingY?: number;
};

export type SpacerBlock = BaseBlock & {
	type: "spacer";
	height: number;
};

export type OrderItemsBlock = BaseBlock & {
	type: "orderItems";
	showThumbnails: boolean;
	showTotal: boolean;
	style: BlockStyle;
};

export type FooterBlock = BaseBlock & {
	type: "footer";
	text: string;
	style: BlockStyle;
};

/** Bloki dozwolone wewnątrz kolumn (bez zagnieżdżania kolumn / pozycji). */
export type LeafBlock =
	| HeadingBlock
	| TextBlock
	| ImageBlock
	| ButtonBlock
	| DividerBlock
	| SpacerBlock;

export type ColumnsBlock = BaseBlock & {
	type: "columns";
	left: LeafBlock[];
	right: LeafBlock[];
	gap?: number;
	paddingY?: number;
};

export type Block = LeafBlock | OrderItemsBlock | FooterBlock | ColumnsBlock;

export type BlockType = Block["type"];

export type OrderEmailTemplateType =
	| "placed"
	| "realization_started"
	| "shipped"
	| "completed"
	| "cancelled"
	| "confirmation";

export type CaseEmailTemplateType =
	| "claim_received"
	| "withdrawal_received"
	| "claim_approved"
	| "withdrawal_approved"
	| "case_refunded"
	| "claim_rejected"
	| "withdrawal_rejected";

export type EmailTemplateType = OrderEmailTemplateType | CaseEmailTemplateType;

const CASE_EMAIL_TEMPLATE_TYPES: CaseEmailTemplateType[] = [
	"claim_received",
	"withdrawal_received",
	"claim_approved",
	"withdrawal_approved",
	"case_refunded",
	"claim_rejected",
	"withdrawal_rejected",
];

export function isCaseEmailTemplateType(type: EmailTemplateType): type is CaseEmailTemplateType {
	return (CASE_EMAIL_TEMPLATE_TYPES as EmailTemplateType[]).includes(type);
}

export type EmailTemplate = {
	type: EmailTemplateType;
	subject: string;
	preheader: string;
	theme: EmailTheme;
	blocks: Block[];
	/** Domyślnie włączone; `false` wyłącza automatyczną wysyłkę tego etapu. */
	enabled?: boolean;
};

export function isEmailTemplateEnabled(template: EmailTemplate | null | undefined): boolean {
	return template?.enabled !== false;
}

/** Kolejność + etykiety zakładek szablonów w edytorze. */
export const EMAIL_TEMPLATE_TYPES: Array<{
	type: EmailTemplateType;
	label: string;
	description: string;
}> = [
	{ type: "placed", label: "Złożone", description: "Po złożeniu zamówienia (checkout)." },
	{
		type: "realization_started",
		label: "Realizacja",
		description: "Po zaakceptowaniu — start realizacji.",
	},
	{ type: "shipped", label: "Wysłane", description: "Po nadaniu przesyłki." },
	{ type: "completed", label: "Zakończone", description: "Po zakończeniu zamówienia." },
	{ type: "cancelled", label: "Anulowane", description: "Po anulowaniu zamówienia." },
	{ type: "confirmation", label: "Potwierdzenie", description: "Pełne potwierdzenie zamówienia." },
	{
		type: "claim_received",
		label: "Reklamacja · przyjęta",
		description: "Po złożeniu reklamacji przez klienta.",
	},
	{
		type: "withdrawal_received",
		label: "Odstąpienie · przyjęte",
		description: "Po złożeniu wniosku o odstąpienie (14 dni).",
	},
	{
		type: "claim_approved",
		label: "Reklamacja · zaakceptowana",
		description: "Po zmianie statusu w magazynie na zaakceptowaną.",
	},
	{
		type: "withdrawal_approved",
		label: "Odstąpienie · zaakceptowane",
		description: "Po zaakceptowaniu odstąpienia — adres zwrotu.",
	},
	{
		type: "case_refunded",
		label: "Zwrot środków",
		description: "Po rozliczeniu reklamacji lub odstąpienia.",
	},
	{
		type: "claim_rejected",
		label: "Reklamacja · odrzucona",
		description: "Po odrzuceniu reklamacji.",
	},
	{
		type: "withdrawal_rejected",
		label: "Odstąpienie · odrzucone",
		description: "Po odrzuceniu wniosku o odstąpienie.",
	},
];

export type EmailTemplateCategoryId = "order" | "returns";

/** Grupy szablonów w edytorze magazynu (/magazyn/maile). */
export const EMAIL_TEMPLATE_CATEGORIES: Array<{
	id: EmailTemplateCategoryId;
	title: string;
}> = [
	{ id: "order", title: "Zamówienie" },
	{ id: "returns", title: "Zwroty" },
];

export function getEmailTemplatesByCategory(
	category: EmailTemplateCategoryId,
): typeof EMAIL_TEMPLATE_TYPES {
	return EMAIL_TEMPLATE_TYPES.filter((entry) =>
		category === "returns"
			? isCaseEmailTemplateType(entry.type)
			: !isCaseEmailTemplateType(entry.type),
	);
}

/** Zmienne danych zamówienia dostępne w treści jako {{token}}. */
export const MERGE_VARIABLES: Array<{
	token: string;
	label: string;
	sample: string;
}> = [
	{ token: "imie", label: "Imię klienta", sample: "Anna" },
	{ token: "nrZamowienia", label: "Numer zamówienia", sample: "1042" },
	{ token: "suma", label: "Suma do zapłaty", sample: "640 zł" },
	{ token: "sumaProduktow", label: "Suma produktów", sample: "590 zł" },
	{ token: "kosztWysylki", label: "Koszt wysyłki", sample: "50 zł" },
	{ token: "wysylka", label: "Metoda dostawy", sample: "Kurier InPost" },
	{ token: "email", label: "E-mail klienta", sample: "anna@przyklad.pl" },
	{ token: "telefon", label: "Telefon", sample: "600 100 200" },
	{ token: "adres", label: "Adres dostawy", sample: "ul. Ludźmierska 25A, 34-400 Nowy Targ" },
];

/** Zmienne dla e-maili reklamacji / odstąpienia ({{token}}). */
export const CASE_MERGE_VARIABLES: Array<{
	token: string;
	label: string;
	sample: string;
}> = [
	{ token: "nrZamowienia", label: "Numer zamówienia", sample: "1042" },
	{ token: "numerZgloszenia", label: "Numer reklamacji (RK-…)", sample: "RK-2026-0042" },
	{ token: "zadanieReklamacji", label: "Żądanie reklamacji", sample: "Naprawa" },
	{ token: "kwotaZwrotu", label: "Kwota zwrotu", sample: "420 zł" },
	{ token: "powodOdrzucenia", label: "Powód odrzucenia", sample: "Brak dokumentacji uszkodzenia." },
	{
		token: "produkty",
		label: "Produkty objęte sprawą",
		sample: "Wazon Rosenthal Art Deco 1934",
	},
	{
		token: "linkKonto",
		label: "Link do panelu konta",
		sample: "https://sklep-retrohouse.pl/konto?tab=reklamacje",
	},
];

export function getMergeVariablesForTemplate(type: EmailTemplateType) {
	return isCaseEmailTemplateType(type) ? CASE_MERGE_VARIABLES : MERGE_VARIABLES;
}

export const MERGE_TOKENS = MERGE_VARIABLES.map((v) => v.token);

/* ────────────────────────────────────────────── */
/* Domyślny motyw + szablony (odtwarzają obecne e-maile) */
/* ────────────────────────────────────────────── */

export const DEFAULT_THEME: EmailTheme = {
	bg: "#f5f0e8",
	contentBg: "#fffdf8",
	text: "#2a1f14",
	heading: "#2a1f14",
	accent: "#c8622a",
	muted: "#7a6a5a",
	link: "#c8622a",
	fontKey: "serif",
	contentWidth: 600,
	radius: 16,
	headerBg: "#2a1f14",
	headerText: "#e8dcc0",
	brandName: "RetroHouse",
};

const FOOTER_TEXT = "RetroHouse · ul. Ludźmierska 25A, 34-400 Nowy Targ";

type StageContent = {
	subject: string;
	preheader: string;
	headline: string;
	paragraphs: string[];
	withItems: boolean;
	links?: string;
	/** Przycisk „Przejdź do panelu konta” ({{linkKonto}}). */
	withKontoButton?: boolean;
};

const STAGE_CONTENT: Record<EmailTemplateType, StageContent> = {
	placed: {
		subject: "[RetroHouse] Dziękujemy za zamówienie #{{nrZamowienia}}",
		preheader: "Otrzymaliśmy Twoje zamówienie.",
		headline: "Dziękujemy za złożenie zamówienia!",
		paragraphs: [
			"Cześć {{imie}}, otrzymaliśmy Twoje zamówienie #{{nrZamowienia}} i właśnie je przetwarzamy.",
			"Gdy je zaakceptujemy, wyślemy kolejne potwierdzenie o rozpoczęciu realizacji.",
		],
		withItems: true,
	},
	realization_started: {
		subject: "[RetroHouse] Rozpoczęliśmy realizację zamówienia #{{nrZamowienia}}",
		preheader: "Twoje zamówienie trafiło do realizacji.",
		headline: "Rozpoczęcie realizacji",
		paragraphs: [
			"Cześć {{imie}}, Twoje zamówienie #{{nrZamowienia}} zostało zaakceptowane i przekazane do realizacji.",
			"Pakujemy przedmioty z dbałością o bezpieczny transport — damy znać, gdy kurier odbierze paczkę.",
		],
		withItems: true,
	},
	shipped: {
		subject: "[RetroHouse] Przesyłka w drodze — zamówienie #{{nrZamowienia}}",
		preheader: "Paczka opuściła nasz magazyn.",
		headline: "Przesyłka odebrana przez kuriera",
		paragraphs: [
			"Cześć {{imie}}, paczka z zamówienia #{{nrZamowienia}} opuściła nasz magazyn — kurier właśnie ją przewozi.",
			"Śledzenie przesyłki otrzymasz od przewoźnika, jeśli dotyczy wybranej metody dostawy ({{wysylka}}).",
		],
		withItems: true,
	},
	completed: {
		subject: "[RetroHouse] Zamówienie #{{nrZamowienia}} zakończone",
		preheader: "Dziękujemy za zakupy w RetroHouse.",
		headline: "Zamówienie zakończone",
		paragraphs: [
			"Cześć {{imie}}, dziękujemy za zakupy w RetroHouse. Mamy nadzieję, że antyki cieszą w Twoim wnętrzu.",
			"Masz 14 dni na odstąpienie od umowy — szczegóły: https://sklep-retrohouse.pl/odstapienie",
		],
		withItems: false,
	},
	cancelled: {
		subject: "[RetroHouse] Zamówienie #{{nrZamowienia}} anulowane",
		preheader: "Twoje zamówienie zostało anulowane.",
		headline: "Zamówienie zostało anulowane",
		paragraphs: [
			"Cześć {{imie}}, Twoje zamówienie #{{nrZamowienia}} zostało anulowane. Jeśli płatność została pobrana, zwrot środków nastąpi zgodnie z regulaminem.",
			"Pytania? Napisz na kontakt@sklep-retrohouse.pl",
		],
		withItems: false,
	},
	confirmation: {
		subject: "[RetroHouse] Potwierdzenie zamówienia #{{nrZamowienia}}",
		preheader: "Potwierdzenie Twojego zamówienia.",
		headline: "Dziękujemy za zamówienie, {{imie}}!",
		paragraphs: ["Potwierdzamy zamówienie #{{nrZamowienia}}. Poniżej szczegóły zakupu."],
		withItems: true,
		links: "Reklamacje: https://sklep-retrohouse.pl/reklamacje · Regulamin: https://sklep-retrohouse.pl/regulamin",
	},
	claim_received: {
		subject: "[RetroHouse] Reklamacja przyjęta — {{numerZgloszenia}}",
		preheader: "Przyjęliśmy Twoją reklamację.",
		headline: "Reklamacja przyjęta",
		paragraphs: [
			"Przyjęliśmy reklamację do zamówienia #{{nrZamowienia}}.",
			"Numer zgłoszenia: {{numerZgloszenia}}. Żądanie: {{zadanieReklamacji}}.",
			"Ustosunkujemy się w terminie 14 dni. Zdjęcia możesz dosłać odpowiadając na ten e-mail.",
		],
		withItems: false,
		withKontoButton: true,
	},
	withdrawal_received: {
		subject: "Złożono wniosek o odstąpienie od umowy — RetroHouse",
		preheader: "Otrzymaliśmy wniosek o odstąpienie.",
		headline: "Wniosek o odstąpienie",
		paragraphs: [
			"Otrzymaliśmy Twój wniosek o odstąpienie od umowy (zamówienie #{{nrZamowienia}}).",
			"Dotyczy: {{produkty}}.",
			"Odpowiemy w ciągu 2 dni roboczych.",
		],
		withItems: false,
		withKontoButton: true,
	},
	claim_approved: {
		subject: "Reklamacja zaakceptowana — RetroHouse",
		preheader: "Zaakceptowaliśmy reklamację.",
		headline: "Reklamacja zaakceptowana",
		paragraphs: [
			"Zaakceptowaliśmy Twoją reklamację (zamówienie #{{nrZamowienia}}, {{numerZgloszenia}}).",
			"Wyślij przesyłkę zwrotną na adres: RetroHouse, ul. Ludźmierska 25A, 34-400 Nowy Targ.",
			"Po otrzymaniu towaru prześlemy rozliczenie.",
		],
		withItems: false,
		withKontoButton: true,
	},
	withdrawal_approved: {
		subject: "Odstąpienie zaakceptowane — RetroHouse",
		preheader: "Zaakceptowaliśmy odstąpienie od umowy.",
		headline: "Odstąpienie zaakceptowane",
		paragraphs: [
			"Zaakceptowaliśmy odstąpienie od umowy (zamówienie #{{nrZamowienia}}).",
			"Wyślij przesyłkę zwrotną na adres: RetroHouse, ul. Ludźmierska 25A, 34-400 Nowy Targ.",
			"Po otrzymaniu towaru prześlemy rozliczenie.",
		],
		withItems: false,
		withKontoButton: true,
	},
	case_refunded: {
		subject: "Zwrot środków — RetroHouse",
		preheader: "Zwróciliśmy środki.",
		headline: "Zwrot środków",
		paragraphs: [
			"Zwróciliśmy środki (zamówienie #{{nrZamowienia}}).",
			"Kwota {{kwotaZwrotu}} zostanie na Twoim koncie w ciągu 3–5 dni roboczych.",
		],
		withItems: false,
		withKontoButton: true,
	},
	claim_rejected: {
		subject: "Reklamacja odrzucona — RetroHouse",
		preheader: "Reklamacja została odrzucona.",
		headline: "Reklamacja odrzucona",
		paragraphs: [
			"Twój wniosek o reklamację (zamówienie #{{nrZamowienia}}, {{numerZgloszenia}}) został odrzucony.",
			"Powód: {{powodOdrzucenia}}",
			"Masz pytania? Odpowiedz na ten e-mail.",
		],
		withItems: false,
		withKontoButton: true,
	},
	withdrawal_rejected: {
		subject: "Odstąpienie odrzucone — RetroHouse",
		preheader: "Wniosek o odstąpienie został odrzucony.",
		headline: "Odstąpienie odrzucone",
		paragraphs: [
			"Twój wniosek o odstąpienie od umowy (zamówienie #{{nrZamowienia}}) został odrzucony.",
			"Powód: {{powodOdrzucenia}}",
			"Masz pytania? Odpowiedz na ten e-mail.",
		],
		withItems: false,
		withKontoButton: true,
	},
};

function leafText(id: string, text: string, style: BlockStyle): TextBlock {
	return { id, type: "text", text, style };
}

/** Domyślne bloki dla danego typu szablonu (odwzorowanie obecnych e-maili). */
export function buildDefaultBlocks(type: EmailTemplateType): Block[] {
	const content = STAGE_CONTENT[type];
	const blocks: Block[] = [
		{
			id: `${type}-headline`,
			type: "heading",
			text: content.headline,
			level: 1,
			style: { color: DEFAULT_THEME.accent, fontSize: 22, bold: true, align: "left", paddingY: 8 },
		},
		...content.paragraphs.map((p, i) =>
			leafText(`${type}-p${i}`, p, {
				color: "#5a4a3a",
				fontSize: 14,
				align: "left",
				paddingY: 6,
			}),
		),
	];

	if (content.withItems) {
		blocks.push({
			id: `${type}-items`,
			type: "orderItems",
			showThumbnails: false,
			showTotal: true,
			style: { color: DEFAULT_THEME.text, fontSize: 14, paddingY: 12 },
		});
	}

	if (content.links) {
		blocks.push(
			leafText(`${type}-links`, content.links, {
				color: DEFAULT_THEME.muted,
				fontSize: 13,
				align: "left",
				paddingY: 8,
			}),
		);
	}

	if (content.withKontoButton) {
		blocks.push({
			id: `${type}-konto`,
			type: "button",
			label: "Przejdź do panelu konta",
			href: "{{linkKonto}}",
			bg: DEFAULT_THEME.accent,
			color: "#fffdf8",
			radius: 8,
			align: "center",
			paddingY: 16,
		});
		blocks.push(
			leafText(`${type}-konto-hint`, "Logowanie kodem wysłanym na adres z zamówienia.", {
				color: DEFAULT_THEME.muted,
				fontSize: 12,
				align: "center",
				paddingY: 4,
			}),
		);
	}

	blocks.push({
		id: `${type}-footer`,
		type: "footer",
		text: FOOTER_TEXT,
		style: { color: DEFAULT_THEME.muted, fontSize: 11, align: "left", paddingY: 4 },
	});

	return blocks;
}

export function buildDefaultTemplate(type: EmailTemplateType): EmailTemplate {
	const content = STAGE_CONTENT[type];
	return {
		type,
		subject: content.subject,
		preheader: content.preheader,
		theme: { ...DEFAULT_THEME },
		blocks: buildDefaultBlocks(type),
		enabled: true,
	};
}

/* ────────────────────────────────────────────── */
/* Walidacja (Zod) — wspólna client + server         */
/* ────────────────────────────────────────────── */

const alignSchema = z.enum(["left", "center", "right"]);

const blockStyleSchema = z.object({
	color: z.string().optional(),
	fontSize: z.number().int().min(8).max(72).optional(),
	bold: z.boolean().optional(),
	italic: z.boolean().optional(),
	align: alignSchema.optional(),
	bg: z.string().optional(),
	paddingY: z.number().int().min(0).max(96).optional(),
	paddingX: z.number().int().min(0).max(96).optional(),
});

const headingSchema = z.object({
	id: z.string().min(1),
	type: z.literal("heading"),
	text: z.string(),
	level: z.union([z.literal(1), z.literal(2), z.literal(3)]),
	style: blockStyleSchema,
});

const textSchema = z.object({
	id: z.string().min(1),
	type: z.literal("text"),
	text: z.string(),
	style: blockStyleSchema,
});

const imageSchema = z.object({
	id: z.string().min(1),
	type: z.literal("image"),
	src: z.string(),
	alt: z.string(),
	href: z.string().optional(),
	width: z.number().int().min(16).max(1200),
	align: alignSchema,
	paddingY: z.number().int().min(0).max(96).optional(),
});

const buttonSchema = z.object({
	id: z.string().min(1),
	type: z.literal("button"),
	label: z.string(),
	href: z.string(),
	bg: z.string().optional(),
	color: z.string().optional(),
	radius: z.number().int().min(0).max(48).optional(),
	align: alignSchema.optional(),
	paddingY: z.number().int().min(0).max(96).optional(),
});

const dividerSchema = z.object({
	id: z.string().min(1),
	type: z.literal("divider"),
	color: z.string().optional(),
	paddingY: z.number().int().min(0).max(96).optional(),
});

const spacerSchema = z.object({
	id: z.string().min(1),
	type: z.literal("spacer"),
	height: z.number().int().min(2).max(160),
});

const leafSchema = z.discriminatedUnion("type", [
	headingSchema,
	textSchema,
	imageSchema,
	buttonSchema,
	dividerSchema,
	spacerSchema,
]);

const orderItemsSchema = z.object({
	id: z.string().min(1),
	type: z.literal("orderItems"),
	showThumbnails: z.boolean(),
	showTotal: z.boolean(),
	style: blockStyleSchema,
});

const footerSchema = z.object({
	id: z.string().min(1),
	type: z.literal("footer"),
	text: z.string(),
	style: blockStyleSchema,
});

const columnsSchema = z.object({
	id: z.string().min(1),
	type: z.literal("columns"),
	left: z.array(leafSchema),
	right: z.array(leafSchema),
	gap: z.number().int().min(0).max(64).optional(),
	paddingY: z.number().int().min(0).max(96).optional(),
});

export const blockSchema = z.union([
	leafSchema,
	orderItemsSchema,
	footerSchema,
	columnsSchema,
]);

const themeSchema = z.object({
	bg: z.string(),
	contentBg: z.string(),
	text: z.string(),
	heading: z.string(),
	accent: z.string(),
	muted: z.string(),
	link: z.string(),
	fontKey: z.enum(["serif", "sans", "mono"]),
	contentWidth: z.number().int().min(320).max(800),
	radius: z.number().int().min(0).max(48),
	headerBg: z.string(),
	headerText: z.string(),
	brandName: z.string(),
});

export const emailTemplateTypeSchema = z.enum([
	"placed",
	"realization_started",
	"shipped",
	"completed",
	"cancelled",
	"confirmation",
	"claim_received",
	"withdrawal_received",
	"claim_approved",
	"withdrawal_approved",
	"case_refunded",
	"claim_rejected",
	"withdrawal_rejected",
]);

export const emailTemplateSchema = z.object({
	type: emailTemplateTypeSchema,
	subject: z.string().min(1).max(200),
	preheader: z.string().max(200),
	theme: themeSchema,
	blocks: z.array(blockSchema).max(200),
	enabled: z.boolean().optional(),
});

/** Bezpieczny parse jednego szablonu z nieznanego JSON (fallback = null). */
export function parseTemplate(raw: unknown): EmailTemplate | null {
	const result = emailTemplateSchema.safeParse(raw);
	return result.success ? (result.data as EmailTemplate) : null;
}
