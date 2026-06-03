import { getAllEmailTemplates } from "@/lib/admin/email-templates";
import { loadAdmin } from "@/lib/admin/load";
import { EmailEditor } from "./email-editor";

export const dynamic = "force-dynamic";

export default async function EmailePage() {
	const templates = await loadAdmin(getAllEmailTemplates);

	return (
		<div className="flex flex-col gap-6">
			<header>
				<h1 className="font-serif text-2xl text-foreground">E-maile</h1>
				<p className="mt-1 text-sm text-muted-foreground">
					Wizualny edytor e-maili transakcyjnych: statusy zamówień oraz reklamacje i odstąpienia.
					Suwak przy szablonie włącza lub wyłącza automatyczną wysyłkę danego etapu. Zapisana
					treść nadpisuje domyślny e-mail z kodu. W sprawach używaj zmiennej{" "}
					<code className="rounded bg-muted px-1 font-mono text-xs">{"{{linkKonto}}"}</code> w
					przycisku do panelu klienta.
				</p>
			</header>

			<EmailEditor initialTemplates={templates} />
		</div>
	);
}
