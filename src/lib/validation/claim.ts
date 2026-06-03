import { z } from "zod";

export const CLAIM_REMEDIES = ["repair", "price_reduction", "withdrawal"] as const;

const IBAN_PL_REGEX = /^PL[\dA-Z]{26}$/i;

function normalizeIban(value: string): string {
	return value.replace(/\s+/g, "").toUpperCase();
}

export const ClaimSchema = z
	.object({
		fullName: z.string().trim().min(2, "Podaj imię i nazwisko."),
		email: z.string().trim().email("Podaj prawidłowy e-mail."),
		phone: z
			.string()
			.trim()
			.max(30)
			.optional()
			.transform((v) => v ?? ""),
		address: z
			.string()
			.trim()
			.max(300)
			.optional()
			.transform((v) => v ?? ""),
		orderNumber: z.string().trim().min(1, "Podaj numer zamówienia.").max(40),
		purchaseDate: z.string().trim().min(4, "Podaj datę zakupu (np. 15.03.2026).").max(40),
		productName: z.string().trim().min(2, "Podaj nazwę reklamowanego towaru.").max(200),
		description: z
			.string()
			.trim()
			.min(20, "Opis niezgodności — minimum 20 znaków.")
			.max(4000),
		remedy: z.enum(CLAIM_REMEDIES, { message: "Wybierz żądanie." }),
		bankAccount: z
			.string()
			.trim()
			.max(34)
			.optional()
			.transform((v) => v ?? ""),
		/** Honeypot — musi pozostać puste. */
		company: z.preprocess(
			(value) => (value == null ? "" : String(value)),
			z.string().max(0, "Nie udało się wysłać formularza. Spróbuj ponownie."),
		),
		privacyAccepted: z.literal("on", { message: "Zaakceptuj politykę prywatności." }),
	})
	.superRefine((data, ctx) => {
		if (data.phone.length > 0 && data.phone.length < 6) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				path: ["phone"],
				message: "Podaj poprawny numer telefonu.",
			});
		}

		const needsBank =
			data.remedy === "price_reduction" || data.remedy === "withdrawal";
		if (!needsBank) return;

		const iban = normalizeIban(data.bankAccount);
		if (!iban) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				path: ["bankAccount"],
				message: "Podaj numer rachunku do zwrotu (IBAN).",
			});
			return;
		}
		if (!IBAN_PL_REGEX.test(iban)) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				path: ["bankAccount"],
				message: "Podaj polski IBAN (PL + 26 cyfr, bez spacji lub ze spacjami).",
			});
		}
	});

export type ClaimInput = z.input<typeof ClaimSchema>;
export type ClaimData = z.output<typeof ClaimSchema>;
