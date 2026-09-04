import { z } from "zod";

/** Dozwolone metody dostawy (UI sklepu) — mapowane na opcje wysyłki Medusa. */
const CHECKOUT_SHIPPING = ["inpost", "dpd", "dhl", "pickup_nt"] as const;
const CHECKOUT_PAYMENT = ["blik", "card", "transfer"] as const;

export const CheckoutSchema = z.object({
	items: z.array(z.string().trim().min(1)).min(1, "Koszyk jest pusty.").max(50, "Za dużo pozycji."),
	firstName: z.string().trim().min(1, "Podaj imię.").max(100),
	lastName: z.string().trim().min(1, "Podaj nazwisko.").max(100),
	email: z.string().trim().email("Nieprawidłowy e-mail."),
	phone: z.string().trim().min(6, "Podaj telefon.").max(30),
	address: z.string().trim().min(3, "Podaj ulicę i numer.").max(200),
	postal: z.string().trim().min(3, "Podaj kod pocztowy.").max(20),
	city: z.string().trim().min(2, "Podaj miasto.").max(100),
	shipping: z.enum(CHECKOUT_SHIPPING).default("inpost"),
	/** ID opcji wysyłki z Medusy (albo sentinel `fallback:*`). Źródło prawdy dla wyboru dostawy. */
	shippingOptionId: z.string().trim().max(120).optional(),
	payment: z.enum(CHECKOUT_PAYMENT).default("blik"),
	invoice: z.boolean().default(false),
	nip: z.string().trim().max(20).optional(),
	companyName: z.string().trim().max(200).optional(),
	/** Kod promocyjny — weryfikowany po stronie Medusy przy tworzeniu koszyka. */
	promoCode: z.string().trim().max(64).optional(),
});

export type CheckoutInput = z.infer<typeof CheckoutSchema>;
