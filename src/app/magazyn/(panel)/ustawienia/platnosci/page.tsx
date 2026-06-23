import { CreditCard } from "lucide-react";
import { buildPaymentsSection } from "@/lib/admin/settings-snapshot";
import { PageHeader } from "@/components/panel/chrome";
import { SettingsStatusView } from "../components/settings-status-view";

export const dynamic = "force-dynamic";

export const metadata = { title: "Ustawienia sklepu — Płatności" };

export default async function SettingsPlatnosciPage() {
	const section = await buildPaymentsSection();
	return (
		<div className="flex flex-col gap-6">
			<PageHeader
				className="mb-0"
				title="Płatności"
				description="Live status providerów z Medusa Admin API."
			/>
			<SettingsStatusView icon={CreditCard} section={section} />
		</div>
	);
}
