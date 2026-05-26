import { defineField, defineType } from "sanity";

/**
 * Schemat produktu w Sanity.
 *
 * Kluczowe pole: `conditionDescription` (rich text) — "Opis stanu przedmiotu"
 * wymagany przez art. 43a ust. 4 UPK. Przy każdej edycji Sanity automatycznie
 * aktualizuje `conditionDescriptionVersion` (hash SHA-1 z treści).
 * Hash trafia do order line item jako `product_description_version` —
 * snapshot w momencie zakupu (compliance trail).
 */
export const productType = defineType({
	name: "product",
	title: "Produkt",
	type: "document",
	fields: [
		defineField({
			name: "slug",
			title: "Slug (URL)",
			type: "slug",
			options: { source: "name" },
			validation: (rule) => rule.required(),
		}),
		defineField({
			name: "name",
			title: "Nazwa",
			type: "string",
			validation: (rule) => rule.required(),
		}),
		defineField({
			name: "price",
			title: "Cena (PLN, brutto)",
			type: "number",
			validation: (rule) => rule.required().positive(),
		}),
		defineField({
			name: "shortDescription",
			title: "Krótki opis",
			type: "text",
			rows: 3,
		}),
		defineField({
			name: "conditionDescription",
			title: "Opis stanu przedmiotu (UPK art. 43a ust. 4)",
			description:
				"Pełen opis uszkodzeń, śladów użytkowania i napraw. Treść jest hashowana — każda zmiana generuje nową wersję (compliance trail przy zakupie).",
			type: "array",
			of: [{ type: "block" }],
			validation: (rule) => rule.required(),
		}),
		defineField({
			name: "conditionDescriptionVersion",
			title: "Wersja opisu stanu (SHA-1, auto)",
			description:
				"Automatycznie generowany hash z treści conditionDescription. Nie edytuj ręcznie.",
			type: "string",
			readOnly: true,
		}),
		defineField({
			name: "conditionDescriptionUpdatedAt",
			title: "Data ostatniej zmiany opisu stanu (auto)",
			type: "datetime",
			readOnly: true,
		}),
		defineField({
			name: "category",
			title: "Kategoria",
			type: "string",
			options: {
				list: [
					{ title: "Porcelana", value: "porcelana" },
					{ title: "Szkło", value: "szklo" },
					{ title: "Dekoracje", value: "dekoracje" },
					{ title: "Meble", value: "meble" },
					{ title: "Obrazy", value: "obrazy" },
					{ title: "Inne", value: "inne" },
				],
			},
		}),
		defineField({
			name: "epoch",
			title: "Epoka / styl",
			type: "string",
			options: {
				list: [
					{ title: "Secesja", value: "secesja" },
					{ title: "Art Déco", value: "art-deco" },
					{ title: "Lata 50.", value: "lata-50" },
					{ title: "Lata 60–70.", value: "lata-60-70" },
					{ title: "Inne", value: "inne" },
				],
			},
		}),
		defineField({
			name: "manufacturer",
			title: "Producent",
			type: "string",
		}),
		defineField({
			name: "signature",
			title: "Sygnatura",
			type: "string",
		}),
		defineField({
			name: "dimensions",
			title: "Wymiary",
			type: "string",
		}),
		defineField({
			name: "story",
			title: "Historia przedmiotu",
			type: "text",
			rows: 4,
		}),
		defineField({
			name: "giftBestseller",
			title: "Bestseller prezentowy",
			type: "boolean",
			description: "Zaznacz, jeśli produkt pojawia się w sekcji prezentów.",
		}),
	],
	preview: {
		select: {
			title: "name",
			subtitle: "conditionDescriptionVersion",
		},
		prepare({ title, subtitle }) {
			return {
				title: title as string,
				subtitle: subtitle ? `v: ${(subtitle as string).slice(0, 8)}` : "Brak opisu stanu",
			};
		},
	},
});
