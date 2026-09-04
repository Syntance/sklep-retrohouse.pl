import "server-only";

import { env } from "@/env";
import { adminFetch } from "./medusa-admin";
import type { SettingsStatusField, SettingsStatusSection, SetupCheckItem } from "./settings-types";

function fieldStatus(ok: boolean, warning = false): "ok" | "warning" | "missing" {
	if (ok) return "ok";
	return warning ? "warning" : "missing";
}

export async function buildSetupChecklist(): Promise<SetupCheckItem[]> {
	const items: SetupCheckItem[] = [];

	items.push({
		id: "medusa-url",
		label: "URL backendu Medusa",
		status: fieldStatus(Boolean(env.NEXT_PUBLIC_MEDUSA_BACKEND_URL)),
		detail: env.NEXT_PUBLIC_MEDUSA_BACKEND_URL,
	});

	items.push({
		id: "publishable-key",
		label: "Publishable API key",
		status: fieldStatus(Boolean(env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY), true),
		detail: env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
			? "Skonfigurowany"
			: "Ustaw NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY",
	});

	const regions = await fetchRegions();
	items.push({
		id: "medusa-regions",
		label: "Region sklepu (Medusa)",
		status: fieldStatus(regions.length > 0),
		detail:
			regions.length > 0
				? `${regions.length} region(ów) · ${regions.map((r) => r.name ?? r.id).join(", ")}`
				: "Brak regionów w Medusie",
	});

	const shipping = await fetchShippingOptions();
	items.push({
		id: "shipping",
		label: "Metody dostawy",
		status: fieldStatus(shipping.length > 0),
		detail:
			shipping.length > 0 ? `${shipping.length} opcji wysyłki` : "Dodaj shipping options w Medusie",
	});

	items.push({
		id: "resend",
		label: "E-maile transakcyjne (Resend)",
		status: fieldStatus(Boolean(env.RESEND_API_KEY), true),
		detail: env.RESEND_API_KEY
			? `Nadawca: ${env.RESEND_FROM_EMAIL ?? "domyślny"}`
			: "Ustaw RESEND_API_KEY w ENV",
	});

	items.push({
		id: "storefront",
		label: "Publiczny URL sklepu",
		status: fieldStatus(Boolean(env.NEXT_PUBLIC_SITE_URL)),
		detail: env.NEXT_PUBLIC_SITE_URL,
	});

	return items;
}

export async function buildGeneralSection(): Promise<SettingsStatusSection> {
	return {
		id: "ogolne",
		tytul: "Dane sklepu",
		opis: "Parametry instancji RetroHouse — branding w kodzie, URL w ENV.",
		pola: [
			{ label: "Nazwa sklepu", val: "RetroHouse", status: "info" },
			{ label: "Panel", val: "Magazyn", status: "info" },
			{ label: "Domena / storefront", val: env.NEXT_PUBLIC_SITE_URL, status: "ok" },
			{ label: "Waluta", val: "PLN · pl-PL", status: "info" },
			{
				label: "Auth panelu",
				val: "Medusa Admin JWT",
				status: "info",
			},
			{
				label: "Kontakt (Resend)",
				val: env.RESEND_CONTACT_TO ?? env.RESEND_FROM_EMAIL ?? "Nie skonfigurowano",
				status: fieldStatus(Boolean(env.RESEND_CONTACT_TO || env.RESEND_FROM_EMAIL), true),
			},
		],
	};
}

export async function buildPaymentsSection(): Promise<SettingsStatusSection> {
	const regions = await fetchRegions();
	const providerIds = new Set<string>();
	for (const region of regions) {
		for (const provider of region.payment_providers ?? []) {
			if (provider?.id) providerIds.add(provider.id);
		}
	}

	const pola: SettingsStatusField[] =
		providerIds.size > 0
			? [...providerIds].map((id) => ({
					label: id,
					val: "Podpięty do regionu",
					status: "ok" as const,
				}))
			: [
					{
						label: "Providery płatności",
						val: "Brak providerów w regionie",
						status: "missing" as const,
						hint: "Skonfiguruj region i payment providers w Medusie.",
					},
				];

	return {
		id: "platnosci",
		tytul: "Płatności",
		opis: "Status providerów z Medusa Admin API.",
		pola,
	};
}

export async function buildShippingSection(): Promise<SettingsStatusSection> {
	const options = await fetchShippingOptions();
	const regions = await fetchRegions();
	const regionNames = new Map(regions.map((r) => [r.id, r.name ?? r.id]));

	if (options.length === 0) {
		return {
			id: "dostawa",
			tytul: "Dostawa",
			opis: "Metody wysyłki z Medusa Admin API.",
			pola: [
				{
					label: "Metody wysyłki",
					val: "Brak shipping options w Medusie",
					status: "missing",
					hint: "Skonfiguruj fulfillment provider i shipping options.",
				},
			],
		};
	}

	return {
		id: "dostawa",
		tytul: "Dostawa",
		opis: "Aktywne metody z Medusa.",
		pola: options.map((o) => ({
			label: o.name ?? o.id,
			val: `${formatMinor(o.amount, o.currency_code)} · ${regionNames.get(o.region_id ?? "") ?? "—"}`,
			status: "ok" as const,
		})),
	};
}

export async function buildNotificationsSection(): Promise<SettingsStatusSection> {
	return {
		id: "powiadomienia",
		tytul: "Powiadomienia",
		opis: "Adresy operacyjne z ENV storefrontu.",
		pola: [
			{
				label: "Formularze kontaktowe",
				val: env.RESEND_CONTACT_TO ?? "Nie ustawiono (RESEND_CONTACT_TO)",
				status: fieldStatus(Boolean(env.RESEND_CONTACT_TO), true),
			},
			{
				label: "Nadawca e-maili",
				val: env.RESEND_FROM_EMAIL ?? "Nie ustawiono (RESEND_FROM_EMAIL)",
				status: fieldStatus(Boolean(env.RESEND_FROM_EMAIL), true),
			},
			{
				label: "Resend API",
				val: env.RESEND_API_KEY ? "Skonfigurowany" : "Brak RESEND_API_KEY",
				status: fieldStatus(Boolean(env.RESEND_API_KEY), true),
			},
		],
	};
}

export async function buildSecuritySection(): Promise<SettingsStatusSection> {
	return {
		id: "bezpieczenstwo",
		tytul: "Bezpieczeństwo",
		opis: "Sesja panelu i integracje — sekrety tylko w ENV.",
		pola: [
			{
				label: "Cookie sesji",
				val: "medusa_admin_token (httpOnly)",
				status: "info",
			},
			{
				label: "Logowanie Google",
				val: env.MEDUSA_ADMIN_EMAIL ? "Email/hasło Medusa Admin" : "Brak MEDUSA_ADMIN_EMAIL w ENV",
				status: fieldStatus(Boolean(env.MEDUSA_ADMIN_EMAIL), true),
			},
			{
				label: "Sentry",
				val: env.NEXT_PUBLIC_SENTRY_DSN ? "Skonfigurowany" : "Nieaktywny",
				status: fieldStatus(Boolean(env.NEXT_PUBLIC_SENTRY_DSN), true),
			},
		],
	};
}

export async function buildApiSection(): Promise<SettingsStatusSection> {
	const deployHook = process.env.VERCEL_DEPLOY_HOOK_URL?.trim();
	return {
		id: "api",
		tytul: "API & Webhooks",
		opis: "Integracje server-to-server — wartości z ENV.",
		pola: [
			{
				label: "Vercel deploy hook",
				val: deployHook ? "Skonfigurowany" : "Nieaktywny",
				status: fieldStatus(Boolean(deployHook), true),
				hint: "VERCEL_DEPLOY_HOOK_URL — sync obrazów CMS",
			},
			{
				label: "Media CDN",
				val: env.NEXT_PUBLIC_MEDIA_CDN_URL ?? "Domyślny storage Medusa",
				status: fieldStatus(Boolean(env.NEXT_PUBLIC_MEDIA_CDN_URL), true),
			},
			{
				label: "Sanity CMS (legacy)",
				val: env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "Nie skonfigurowano",
				status: fieldStatus(Boolean(env.NEXT_PUBLIC_SANITY_PROJECT_ID), true),
			},
		],
	};
}

type MedusaRegion = {
	id: string;
	name?: string | null;
	payment_providers?: Array<{ id?: string | null }> | null;
};

type MedusaShippingOption = {
	id: string;
	name?: string | null;
	amount?: number | null;
	currency_code?: string | null;
	region_id?: string | null;
};

async function fetchRegions(): Promise<MedusaRegion[]> {
	try {
		const data = await adminFetch<{ regions: MedusaRegion[] }>(
			"/admin/regions?limit=50&fields=id,name,*payment_providers",
		);
		return data.regions ?? [];
	} catch {
		return [];
	}
}

async function fetchShippingOptions(): Promise<MedusaShippingOption[]> {
	try {
		const data = await adminFetch<{ shipping_options: MedusaShippingOption[] }>(
			"/admin/shipping-options?limit=100&fields=id,name,amount,currency_code,region_id",
		);
		return data.shipping_options ?? [];
	} catch {
		return [];
	}
}

function formatMinor(
	amount: number | null | undefined,
	currency: string | null | undefined,
): string {
	if (amount == null) return "—";
	const code = (currency ?? "pln").toUpperCase();
	return new Intl.NumberFormat("pl-PL", {
		style: "currency",
		currency: code === "PLN" ? "PLN" : code,
	}).format(amount / 100);
}
