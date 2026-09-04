import { Globe } from "lucide-react";
import { PageHeader } from "@/components/panel/chrome";
import { buildGeneralSection, buildSetupChecklist } from "@/lib/admin/settings-snapshot";
import { SettingsStatusView } from "../components/settings-status-view";
import { SetupChecklist } from "../components/setup-checklist";

export const dynamic = "force-dynamic";

export const metadata = { title: "Ustawienia sklepu — Ogólne" };

export default async function SettingsOgolnePage() {
	const [checklist, section] = await Promise.all([buildSetupChecklist(), buildGeneralSection()]);

	return (
		<div className="flex flex-col gap-6">
			<PageHeader
				className="mb-0"
				title="Ustawienia sklepu"
				description="Status integracji i dane instancji — podłącz ENV, potem sprawdź checklistę."
			/>
			<SetupChecklist items={checklist} />
			<SettingsStatusView icon={Globe} section={section} />
		</div>
	);
}
