import { describe, expect, it } from "vitest";
import {
	type EmailRenderContext,
	mergeSubject,
	renderTemplate,
	sampleRenderContext,
	sampleRenderContextForTemplate,
} from "@/lib/email/render-template";
import {
	buildDefaultTemplate,
	type EmailTemplate,
	parseTemplate,
} from "@/lib/email/template-types";

const ctx = sampleRenderContext();

describe("renderTemplate", () => {
	it("scala zmienne {{token}} w treści bloków", () => {
		const template = buildDefaultTemplate("placed");
		const { html } = renderTemplate(template, ctx);
		expect(html).toContain("Anna");
		expect(html).toContain("#1042");
		expect(html).not.toContain("{{imie}}");
		expect(html).not.toContain("{{nrZamowienia}}");
	});

	it("renderuje pozycje zamówienia i wiersz Razem", () => {
		const template = buildDefaultTemplate("placed");
		const { html, text } = renderTemplate(template, ctx);
		expect(html).toContain("Wazon Rosenthal Art Deco 1934");
		expect(html).toContain("Razem");
		expect(html).toContain("640 zł");
		expect(text).toContain("• Wazon Rosenthal Art Deco 1934");
		expect(text).toContain("Razem: 640 zł");
	});

	it("produkuje email-safe HTML (doctype + tabela + inline style)", () => {
		const { html } = renderTemplate(buildDefaultTemplate("shipped"), ctx);
		expect(html).toContain("<!DOCTYPE html>");
		expect(html).toContain("<table");
		expect(html).toContain("style=");
	});

	it("escapuje wartości zmiennych (ochrona przed wstrzyknięciem HTML)", () => {
		const malicious: EmailRenderContext = {
			vars: { imie: "<script>alert(1)</script>", nrZamowienia: "1", suma: "0 zł" },
			items: [],
		};
		const template = buildDefaultTemplate("placed");
		const { html } = renderTemplate(template, malicious);
		expect(html).not.toContain("<script>alert(1)</script>");
		expect(html).toContain("&lt;script&gt;");
	});

	it("scala {{linkKonto}} w href przycisku (e-maile spraw)", () => {
		const template = buildDefaultTemplate("claim_received");
		const ctx = sampleRenderContextForTemplate("claim_received");
		const { html } = renderTemplate(template, ctx);
		expect(html).toContain("https://sklep-retrohouse.pl/konto?tab=reklamacje");
		expect(html).not.toContain("{{linkKonto}}");
	});

	it("renderuje przycisk z linkiem", () => {
		const template: EmailTemplate = {
			...buildDefaultTemplate("placed"),
			blocks: [
				{
					id: "b1",
					type: "button",
					label: "Zobacz zamówienie",
					href: "https://sklep-retrohouse.pl/konto",
					align: "center",
				},
			],
		};
		const { html, text } = renderTemplate(template, ctx);
		expect(html).toContain("https://sklep-retrohouse.pl/konto");
		expect(html).toContain("Zobacz zamówienie");
		expect(text).toContain("Zobacz zamówienie: https://sklep-retrohouse.pl/konto");
	});
});

describe("mergeSubject", () => {
	it("podstawia tokeny w temacie", () => {
		expect(mergeSubject("Zamówienie #{{nrZamowienia}}", ctx.vars)).toBe("Zamówienie #1042");
	});
});

describe("parseTemplate (walidacja Zod)", () => {
	it("akceptuje domyślny szablon", () => {
		const template = buildDefaultTemplate("confirmation");
		expect(parseTemplate(template)).not.toBeNull();
	});

	it("odrzuca nieprawidłowy obiekt", () => {
		expect(parseTemplate({ type: "nieznany", blocks: "x" })).toBeNull();
		expect(parseTemplate(null)).toBeNull();
	});
});
