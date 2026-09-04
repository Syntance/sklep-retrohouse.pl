import Link from "next/link";
import { PageHeader } from "@/components/panel/chrome";
import { getContactFormsConfig } from "@/lib/admin/contact-forms";
import { loadAdmin } from "@/lib/admin/load";
import { FormsManager } from "./forms-manager";
import { FormsSubnav } from "./forms-subnav";

export const dynamic = "force-dynamic";

export default async function FormularzePage() {
	const config = await loadAdmin(getContactFormsConfig);

	return (
		<div className="flex flex-col gap-6">
			<PageHeader
				className="mb-0"
				title="Formularze"
				description={
					<>
						Formularze kontaktowe na podstronach sklepu: tematy, odbiorcy zespołu i mapowanie
						ścieżek. Potwierdzenie dla klienta — jeden szablon w{" "}
						<Link href="/magazyn/maile" className="text-primary underline underline-offset-4">
							E-maile → Formularze
						</Link>
						.
					</>
				}
			/>

			<FormsSubnav />

			<FormsManager initialConfig={config} />
		</div>
	);
}
