import "server-only";
import { cache } from "react";
import { catalogAdminFetch } from "@/lib/admin/medusa-admin";
import {
	DEFAULT_EPOCH_OPTIONS,
	parseEpochsJson,
	type EpochOption,
} from "@/lib/products/epoch-types";

/** Epoki sklepu — z metadata Medusa Store, fallback na domyślną listę. */
export const getEpochOptions = cache(async (): Promise<EpochOption[]> => {
	const data = await catalogAdminFetch<{ stores: Array<{ metadata?: Record<string, unknown> | null }> }>(
		"/admin/stores?limit=1&fields=metadata",
	);

	const raw = data?.stores[0]?.metadata?.epochs;
	const parsed = parseEpochsJson(typeof raw === "string" ? raw : undefined);
	return parsed ?? DEFAULT_EPOCH_OPTIONS;
});
