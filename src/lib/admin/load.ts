import "server-only";
import { redirect } from "next/navigation";
import { AdminUnauthorizedError } from "./medusa-admin";

/**
 * Wrapper dla pobierania danych w Server Components.
 * Wygasła sesja → przekierowanie na route czyszczący cookie (Server Component
 * nie może modyfikować cookies, więc czyszczenie dzieje się w /magazyn/auth/logout).
 */
export async function loadAdmin<T>(fn: () => Promise<T>): Promise<T> {
	try {
		return await fn();
	} catch (error) {
		if (error instanceof AdminUnauthorizedError) {
			redirect("/magazyn/auth/logout");
		}
		throw error;
	}
}
