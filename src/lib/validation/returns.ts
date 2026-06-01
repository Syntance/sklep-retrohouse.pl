import { z } from "zod";

/** Weryfikacja tokenu OTP (one-time password) do logowania klienta przez email. */
export const CustomerLoginSchema = z.object({
	email: z.string().email("Podaj poprawny adres email"),
});

export const CustomerVerifyOtpSchema = z.object({
	email: z.string().email(),
	code: z.string().length(6, "Kod musi mieć 6 cyfr").regex(/^\d{6}$/, "Kod składa się tylko z cyfr"),
});

/** Schema tylko dla pola code w formularzu (email dodawany później) */
export const CustomerCodeOnlySchema = z.object({
	code: z.string().length(6, "Kod musi mieć 6 cyfr").regex(/^\d{6}$/, "Kod składa się tylko z cyfr"),
});

/** Tworzenie wniosku o zwrot/odstąpienie. */
export const CreateReturnSchema = z.object({
	orderId: z.string().min(1),
	itemIds: z.array(z.string()).min(1, "Wybierz co najmniej jeden produkt do zwrotu"),
	reason: z.string().min(10, "Podaj powód zwrotu (min. 10 znaków)").max(500),
});

export type CustomerLoginInput = z.infer<typeof CustomerLoginSchema>;
export type CustomerVerifyOtpInput = z.infer<typeof CustomerVerifyOtpSchema>;
export type CustomerCodeOnlyInput = z.infer<typeof CustomerCodeOnlySchema>;
export type CreateReturnInput = z.infer<typeof CreateReturnSchema>;
