import "server-only";
import { cache } from "react";
import { env } from "@/env";

let warned = false;

/** Szybki ping — omija JS SDK gdy Railway/backend nie odpowiada. */
export const isMedusaBackendHealthy = cache(async (): Promise<boolean> => {
	const baseUrl = env.NEXT_PUBLIC_MEDUSA_BACKEND_URL.replace(/\/$/, "");

	try {
		const res = await fetch(`${baseUrl}/health`, {
			signal: AbortSignal.timeout(5_000),
			cache: "no-store",
		});

		if (res.ok) return true;

		if (!warned) {
			warned = true;
			console.warn(
				`[retrohouse] Backend Medusa niedostępny (HTTP ${res.status}). Sprawdź Railway i NEXT_PUBLIC_MEDUSA_BACKEND_URL.`,
			);
		}
		return false;
	} catch {
		if (!warned) {
			warned = true;
			console.warn(
				"[retrohouse] Backend Medusa niedostępny (timeout/sieć). Sprawdź Railway i NEXT_PUBLIC_MEDUSA_BACKEND_URL.",
			);
		}
		return false;
	}
});
