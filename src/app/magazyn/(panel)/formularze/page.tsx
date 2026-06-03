import { FileText } from "lucide-react";
import Link from "next/link";
import { getContactFormsConfig } from "@/lib/admin/contact-forms";
import { loadAdmin } from "@/lib/admin/load";
import { FormsSubnav } from "./forms-subnav";
import { FormsManager } from "./forms-manager";

export const dynamic = "force-dynamic";

export default async function FormularzePage() {
	const config = await loadAdmin(getContactFormsConfig);

	return (
		<div className="flex flex-col gap-6">
			<header className="flex flex-wrap items-start justify-between gap-4">
				<div>
					<h1 className="flex items-center gap-2 font-serif text-2xl text-foreground">
						<FileText className="size-6 text-terracotta" aria-hidden />
						Formularze
					</h1>
					<p className="mt-1 max-w-2xl text-sm text-muted-foreground">
						Formularze kontaktowe na podstronach sklepu: tematy, odbiorcy zespołu i mapowanie
						ścieżek. Potwierdzenie dla klienta — jeden szablon w{" "}
						<Link href="/magazyn/maile" className="text-terracotta underline underline-offset-4">
							E-maile → Formularze
						</Link>
						.
					</p>
				</div>
			</header>

			<FormsSubnav />

			<FormsManager initialConfig={config} />
		</div>
	);
}
