import { defineField, defineType } from "sanity";

export const homePageType = defineType({
	name: "homePage",
	title: "Strona główna",
	type: "document",
	fields: [
		defineField({
			name: "heroProductImage",
			title: "Zdjęcie produktu (hero)",
			description: "Prawa kolumna hero na stronie głównej.",
			type: "image",
			options: { hotspot: true },
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: "heroProductImageAlt",
			title: "Opis zdjęcia (ALT)",
			description: "Dla dostępności i SEO, np. „Porcelanowa filiżanka Limoges, lata 20.”",
			type: "string",
			validation: (Rule) => Rule.required().max(180),
		}),
	],
});
