import { Bell } from "lucide-react";
import { PageHeader } from "@/components/panel/chrome";
import { buildNotificationsSection } from "@/lib/admin/settings-snapshot";
import { SettingsStatusView } from "../components/settings-status-view";

export const dynamic = "force-dynamic";

export const metadata = { title: "Ustawienia sklepu — Powiadomienia" };

export default async function SettingsPowiadomieniaPage() {
	const section = await buildNotificationsSection();
	return (
		<div className="flex flex-col gap-6">
			<PageHeader
				className="mb-0"
				title="Powiadomienia"
				description="Adresy zespołu dla zdarzeń operacyjnych."
			/>
			<SettingsStatusView icon={Bell} section={section} />
		</div>
	);
}
