import { Truck } from "lucide-react";
import { buildShippingSection } from "@/lib/admin/settings-snapshot";
import { PageHeader } from "@/components/panel/chrome";
import { SettingsStatusView } from "../components/settings-status-view";

export const dynamic = "force-dynamic";

export const metadata = { title: "Ustawienia sklepu — Dostawa" };

export default async function SettingsDostawaPage() {
	const section = await buildShippingSection();
	return (
		<div className="flex flex-col gap-6">
			<PageHeader
				className="mb-0"
				title="Dostawa"
				description="Metody wysyłki z Medusa Admin API."
			/>
			<SettingsStatusView icon={Truck} section={section} />
		</div>
	);
}
