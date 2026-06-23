import { listEpochs } from "@/lib/admin/epochs";
import { loadAdmin } from "@/lib/admin/load";
import { PageHeader } from "@/components/panel/chrome";
import { EpochsManager } from "./epochs-manager";

export const dynamic = "force-dynamic";

export default async function EpochsPage() {
	const epochs = await loadAdmin(listEpochs);

	return (
		<div className="flex flex-col gap-6">
			<PageHeader
				className="mb-0"
				title="Epoki"
				description="Style i okresy — przypisujesz je przy edycji produktu, filtr w sklepie."
			/>
			<EpochsManager epochs={epochs} />
		</div>
	);
}
