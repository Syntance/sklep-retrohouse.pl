import { describe, expect, it } from "vitest";
import { parseStoreMetadataJson } from "@/lib/content/metadata-json";
import { parsePageContentMap } from "@/lib/content/parsers";

describe("parseStoreMetadataJson", () => {
	it("parses JSON string", () => {
		expect(
			parseStoreMetadataJson('{"home":{"hero":{"productImageUrl":"https://cdn.example/a.webp"}}}'),
		).toEqual({
			home: { hero: { productImageUrl: "https://cdn.example/a.webp" } },
		});
	});

	it("accepts already-parsed object from Medusa", () => {
		const object = {
			home: { hero: { productImageUrl: "https://cdn.example/a.webp" } },
		};
		expect(parseStoreMetadataJson(object)).toBe(object);
	});

	it("returns null for empty string", () => {
		expect(parseStoreMetadataJson("")).toBeNull();
		expect(parseStoreMetadataJson("   ")).toBeNull();
	});
});

describe("parsePageContentMap", () => {
	it("accepts hero with only image URL (no copy fields)", () => {
		const raw = {
			prezent: {
				hero: {
					productImageUrl: "https://pub-0830cd4d3a284718ab20b01eaab23d3b.r2.dev/cms-uploads/x.webp",
				},
			},
		};
		const parsed = parsePageContentMap(raw);
		expect(parsed?.prezent?.hero?.productImageUrl).toContain("cms-uploads");
	});
});
