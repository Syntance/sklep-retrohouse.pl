import { listEpochs } from "@/lib/admin/epochs";
import { loadAdmin } from "@/lib/admin/load";
import { EpochsManager } from "./epochs-manager";

export const dynamic = "force-dynamic";

export default async function EpochsPage() {
	const epochs = await loadAdmin(listEpochs);

	return (
		<div className="flex flex-col gap-6">
			<header>
				<h1 className="font-serif text-2xl text-foreground">Epoki</h1>
				<p className="mt-1 text-sm text-muted-foreground">
					Style i okresy — przypisujesz je przy edycji produktu, filtr w sklepie.
				</p>
			</header>

			<EpochsManager epochs={epochs} />
		</div>
	);
}
