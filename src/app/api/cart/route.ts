import { NextResponse } from "next/server";
import { getProductBySlug } from "@/lib/mock/products";
import { AddToCartSchema } from "@/lib/validation/cart";

/**
 * POST /api/cart — walidacja slug + JSON (bez redirectu).
 *
 * Koszyk MVP trzymany po stronie klienta (Zustand + localStorage).
 * Endpoint zostaje na przyszłą integrację z Medusa / cookie sync.
 */
export async function POST(request: Request) {
	let formData: FormData;

	try {
		formData = await request.formData();
	} catch {
		return NextResponse.json({ ok: false, error: "invalid" }, { status: 400 });
	}

	const parsed = AddToCartSchema.safeParse({
		slug: formData.get("slug"),
	});

	if (!parsed.success) {
		return NextResponse.json({ ok: false, error: "invalid" }, { status: 400 });
	}

	const product = getProductBySlug(parsed.data.slug);
	if (!product) {
		return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
	}

	return NextResponse.json({
		ok: true,
		slug: product.slug,
		name: product.name,
	});
}
