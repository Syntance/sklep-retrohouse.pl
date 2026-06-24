import "server-only";

import { adminFetch } from "./medusa-admin";

/** Weryfikuje ważną sesję panelu przed uploadem CMS / innymi operacjami poza adminFetch. */
export async function requireAdminSession(): Promise<void> {
	await adminFetch<{ user?: { email?: string } }>("/admin/users/me?fields=id,email");
}
