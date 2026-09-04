import "server-only";

import { isAdminEmailAllowed } from "./allowlist";
import { AdminUnauthorizedError, adminFetch } from "./medusa-admin";

/**
 * Twardo weryfikuje, że bieżąca sesja panelu jest WAŻNA (nie tylko obecne cookie)
 * ORAZ że e-mail administratora jest na allowliście (`MAGAZYN_ADMIN_ALLOWLIST`).
 *
 * Używane w Server Actions / route handlerach, które wykonują uprzywilejowane
 * operacje POZA `adminFetch` (upload do R2, wysyłka maila przez Resend, deploy
 * hook Vercel) i bez tego byłyby wywoływalne bez ważnej sesji administratora.
 */
export async function requireAdminSession(): Promise<void> {
	const data = await adminFetch<{ user?: { email?: string } }>("/admin/users/me?fields=id,email");
	if (!isAdminEmailAllowed(data?.user?.email)) {
		throw new AdminUnauthorizedError("Konto nie ma dostępu do panelu.");
	}
}
