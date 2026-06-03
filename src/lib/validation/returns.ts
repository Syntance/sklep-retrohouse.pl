import { z } from "zod";
import { CLAIM_REMEDIES } from "@/lib/validation/claim";

/** Weryfikacja tokenu OTP (one-time password) do logowania klienta przez e-mail. */
export const CustomerLoginSchema = z.object({
	email: z.string().email("Podaj poprawny adres e-mail"),
});

export const CustomerVerifyOtpSchema = z.object({
	email: z.string().email(),
	code: z.string().length(6, "Kod musi mieć 6 cyfr").regex(/^\d{6}$/, "Kod składa się tylko z cyfr"),
});

/** Schema tylko dla pola code w formularzu (e-mail dodawany później) */
export const CustomerCodeOnlySchema = z.object({
	code: z.string().length(6, "Kod musi mieć 6 cyfr").regex(/^\d{6}$/, "Kod składa się tylko z cyfr"),
});

/** Tworzenie wniosku o zwrot/odstąpienie. */
export const CreateReturnSchema = z.object({
	orderId: z.string().min(1),
	itemIds: z.array(z.string()).min(1, "Wybierz produkt, którego dotyczy odstąpienie."),
	reason: z.string().min(10, "Podaj powód zwrotu (min. 10 znaków)").max(500),
});

export type CustomerLoginInput = z.infer<typeof CustomerLoginSchema>;
export type CustomerVerifyOtpInput = z.infer<typeof CustomerVerifyOtpSchema>;
export type CustomerCodeOnlyInput = z.infer<typeof CustomerCodeOnlySchema>;
export type CreateReturnInput = z.infer<typeof CreateReturnSchema>;

const IBAN_PL_REGEX = /^PL[\dA-Z]{26}$/i;

function normalizeIban(value: string): string {
	return value.replace(/\s+/g, "").toUpperCase();
}

/** Wniosek reklamacyjny — po zalogowaniu klienta (zamówienie z Medusy). */
export const CreateClaimSchema = z
	.object({
		orderId: z.string().min(1),
		itemIds: z.array(z.string()).min(1, "Wybierz produkt, którego dotyczy reklamacja."),
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
	})
	.superRefine((data, ctx) => {
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
				message: "Podaj polski IBAN (PL + 26 cyfr).",
			});
		}
	});

export type CreateClaimInput = z.infer<typeof CreateClaimSchema>;
