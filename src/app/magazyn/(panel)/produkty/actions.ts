"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { AdminApiError, AdminUnauthorizedError, adminUpload } from "@/lib/admin/medusa-admin";
import { resolveMedusaMediaUrls } from "@/lib/medusa/media-url";
import {
	createAdminProduct,
	deleteAdminProduct,
	type ProductFormValues,
	updateAdminProduct,
} from "@/lib/admin/products";
import { slugify } from "@/lib/admin/slug";

export type SaveProductState = { error: string | null; ok: boolean };

const defectSchema = z.object({
	label: z.string().trim(),
	note: z.string().trim(),
});

const productSchema = z.object({
	id: z.string().trim().optional(),
	variantId: z.string().trim().nullable().optional(),
	title: z.string().trim().min(2, "Nazwa musi mieć min. 2 znaki."),
	status: z.enum(["draft", "published"]),
	categoryId: z.string().trim().nullable(),
	description: z.string(),
	shortDescription: z.string(),
	story: z.string(),
	manufacturer: z.string(),
	epoch: z.string(),
	signature: z.string(),
	dimensions: z.string(),
	condition: z.string(),
	defects: z.array(defectSchema),
	pickupOnly: z.boolean(),
	pricePln: z.number().nonnegative().nullable(),
	images: z.array(z.string().url()),
	badges: z.array(z.string()),
	popularity: z.number().int().min(0).max(100),
	giftBestseller: z.boolean(),
});

export type ProductPayload = z.input<typeof productSchema>;

function toValues(data: z.infer<typeof productSchema>): ProductFormValues {
	return {
		title: data.title,
		handle: slugify(data.title),
		status: data.status,
		categoryId: data.categoryId,
		description: data.description,
		shortDescription: data.shortDescription,
		story: data.story,
		manufacturer: data.manufacturer,
		epoch: data.epoch,
		signature: data.signature,
		dimensions: data.dimensions,
		condition: data.condition,
		defects: data.defects.filter((d) => d.label.trim().length > 0),
		pickupOnly: data.pickupOnly,
		pricePln: data.pricePln,
		images: data.images,
		badges: data.badges.map((b) => b.trim()).filter(Boolean),
		popularity: data.popularity,
		giftBestseller: data.giftBestseller,
	};
}

export async function saveProductAction(payload: ProductPayload): Promise<SaveProductState> {
	const parsed = productSchema.safeParse(payload);
	if (!parsed.success) {
		return { ok: false, error: parsed.error.issues[0]?.message ?? "Błędne dane formularza." };
	}

	const data = parsed.data;
	if (data.pricePln == null) {
		return { ok: false, error: "Podaj cenę w PLN." };
	}

	const values = toValues(data);

	try {
		if (data.id) {
			await updateAdminProduct(data.id, data.variantId ?? null, values);
		} else {
			await createAdminProduct(values);
		}
	} catch (error) {
		if (error instanceof AdminUnauthorizedError) redirect("/magazyn/auth/logout");
		if (error instanceof AdminApiError) return { ok: false, error: error.message };
		return { ok: false, error: "Nie udało się zapisać produktu. Spróbuj ponownie." };
	}

	revalidatePath("/magazyn/produkty");
	redirect("/magazyn/produkty");
}

export async function deleteProductAction(id: string): Promise<void> {
	try {
		await deleteAdminProduct(id);
	} catch (error) {
		if (error instanceof AdminUnauthorizedError) redirect("/magazyn/auth/logout");
		throw error;
	}
	revalidatePath("/magazyn/produkty");
}

export type UploadState = { urls: string[]; error: string | null };

export async function uploadImagesAction(formData: FormData): Promise<UploadState> {
	const files = formData.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
	if (files.length === 0) return { urls: [], error: "Nie wybrano plików." };

	try {
		const urls = resolveMedusaMediaUrls(await adminUpload(files));
		return { urls, error: null };
	} catch (error) {
		if (error instanceof AdminUnauthorizedError) redirect("/magazyn/auth/logout");
		if (error instanceof AdminApiError) return { urls: [], error: error.message };
		return { urls: [], error: "Upload nie powiódł się." };
	}
}
