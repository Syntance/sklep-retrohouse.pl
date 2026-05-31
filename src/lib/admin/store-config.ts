import "server-only";
import { cache } from "react";
import { adminFetch } from "./medusa-admin";

type StoreConfig = {
	salesChannelId: string | null;
	shippingProfileId: string | null;
};

/** Domyślny sales channel + shipping profile — wymagane przy tworzeniu produktu. */
export const getStoreConfig = cache(async (): Promise<StoreConfig> => {
	const [channels, profiles] = await Promise.all([
		adminFetch<{ sales_channels: Array<{ id: string }> }>("/admin/sales-channels?limit=1"),
		adminFetch<{ shipping_profiles: Array<{ id: string }> }>("/admin/shipping-profiles?limit=1"),
	]);

	return {
		salesChannelId: channels.sales_channels[0]?.id ?? null,
		shippingProfileId: profiles.shipping_profiles[0]?.id ?? null,
	};
});
