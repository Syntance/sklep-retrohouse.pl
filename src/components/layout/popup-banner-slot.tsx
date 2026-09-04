import { getSiteSettings } from "@/lib/content";
import { PopupBanner } from "./popup-banner";

/**
 * Serwerowy slot banera popup — czyta ustawienia CMS i renderuje klienta tylko
 * gdy baner jest faktycznie włączony (wyłączony = zero JS w przeglądarce).
 */
export async function PopupBannerSlot() {
	const settings = await getSiteSettings();
	const banner = settings.popupBanner;

	if (!banner?.enabled || !banner.title.trim()) return null;

	return <PopupBanner banner={banner} />;
}
