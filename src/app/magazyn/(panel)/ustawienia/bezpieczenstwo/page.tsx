import { Shield } from "lucide-react";
import { buildSecuritySection } from "@/lib/admin/settings-snapshot";
import { PageHeader } from "@/components/panel/chrome";
import { SettingsStatusView } from "../components/settings-status-view";

export const dynamic = "force-dynamic";

export const metadata = { title: "Ustawienia sklepu — Bezpieczeństwo" };

export default async function SettingsBezpieczenstwoPage() {
	const section = await buildSecuritySection();
	return (
		<div className="flex flex-col gap-6">
			<PageHeader
				className="mb-0"
				title="Bezpieczeństwo"
				description="Sesja panelu i integracje — sekrety tylko w ENV."
			/>
			<SettingsStatusView icon={Shield} section={section} />
		</div>
	);
}
