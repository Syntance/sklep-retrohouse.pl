import { verifyCustomerToken } from "@/lib/customer/auth";

export function getCustomerEmailFromRequest(request: Request): string | null {
	const authHeader = request.headers.get("Authorization");
	if (!authHeader?.startsWith("Bearer ")) return null;
	return verifyCustomerToken(authHeader.slice(7));
}
