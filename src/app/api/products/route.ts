import { NextResponse } from "next/server";
import { getProductsBySlugs } from "@/lib/products/queries";

/**
 * GET /api/products?slugs=a,b,c — produkty z Medusa po slugach (koszyk client-side).
 */
export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const slugsParam = searchParams.get("slugs");

	if (!slugsParam) {
		return NextResponse.json({ products: [] });
	}

	const slugs = slugsParam
		.split(",")
		.map((slug) => slug.trim())
		.filter(Boolean);

	const products = await getProductsBySlugs(slugs);
	return NextResponse.json({ products });
}
