import "server-only";

import { revalidatePath, revalidateTag } from "next/cache";
import { RETROHOUSE_CONTENT_CACHE_TAG } from "./metadata-keys";

export type RevalidateContentResult = {
	live: true;
};

/** Rewalidacja CMS po zapisie — tekst live bez redeploy. */
export async function revalidateContentCache(
	paths: string[] = [],
): Promise<RevalidateContentResult> {
	revalidateTag(RETROHOUSE_CONTENT_CACHE_TAG, "max");
	for (const path of paths) {
		if (path) revalidatePath(path);
	}
	revalidatePath("/magazyn/cms");
	return { live: true };
}

/** Ręczny redeploy → sync obrazów CMS w buildzie (PageSpeed). */
export async function triggerCmsRedeploy(_reason = "CMS manual redeploy"): Promise<boolean> {
	const hookUrl = process.env.VERCEL_DEPLOY_HOOK_URL?.trim();
	if (!hookUrl) return false;

	try {
		const res = await fetch(hookUrl, {
			method: "POST",
			signal: AbortSignal.timeout(30_000),
		});
		return res.ok;
	} catch {
		return false;
	}
}
