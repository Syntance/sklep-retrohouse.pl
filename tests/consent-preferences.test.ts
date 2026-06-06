import { describe, expect, it } from "vitest";
import {
	shopPreferencesToQuery,
	SHOP_PREFERENCES_KEY,
} from "@/lib/analytics/preferences";
import { CONSENT_STORAGE_KEY, CONSENT_VERSION } from "@/lib/analytics/consent";

describe("shop preferences", () => {
	it("serializes saved filters to query string", () => {
		expect(
			shopPreferencesToQuery({
				kategoria: "porcelana",
				sort: "popularne",
				cenaOd: "100",
			}),
		).toBe("?kategoria=porcelana&cenaOd=100&sort=popularne");
	});

	it("returns empty string when no filters saved", () => {
		expect(shopPreferencesToQuery({})).toBe("");
	});
});

describe("consent storage contract", () => {
	it("uses stable localStorage keys", () => {
		expect(CONSENT_STORAGE_KEY).toBe("rh-consent");
		expect(SHOP_PREFERENCES_KEY).toBe("rh-shop-preferences");
	});

	it("versions consent for re-prompt on policy change", () => {
		expect(CONSENT_VERSION).toBeGreaterThan(0);
	});
});
