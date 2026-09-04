import { Key } from "lucide-react";
import { PageHeader } from "@/components/panel/chrome";
import { buildApiSection } from "@/lib/admin/settings-snapshot";
import { SettingsStatusView } from "../components/settings-status-view";

export const dynamic = "force-dynamic";

export const metadata = { title: "Ustawienia sklepu — API & Webhooks" };

export default async function SettingsApiPage() {
	const section = await buildApiSection();
	return (
		<div className="flex flex-col gap-6">
			<PageHeader
				className="mb-0"
				title="API & Webhooks"
				description="Revalidacja, deploy hook i storage mediów."
			/>
			<SettingsStatusView icon={Key} section={section} />
		</div>
	);
}
