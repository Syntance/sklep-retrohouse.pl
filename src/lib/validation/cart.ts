import { z } from "zod";

export const AddToCartSchema = z.object({
	slug: z.string().trim().min(1, "Brak identyfikatora produktu."),
});

export type AddToCartInput = z.infer<typeof AddToCartSchema>;
