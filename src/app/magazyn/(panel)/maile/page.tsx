import { getAllEmailTemplates } from "@/lib/admin/email-templates";
import { loadAdmin } from "@/lib/admin/load";
import { EmailEditor } from "./email-editor";

export const dynamic = "force-dynamic";

export default async function MailePage() {
	const templates = await loadAdmin(getAllEmailTemplates);

	return (
		<div className="flex flex-col gap-6">
			<header>
				<h1 className="font-serif text-2xl text-foreground">Maile</h1>
				<p className="mt-1 text-sm text-muted-foreground">
					Wizualny edytor maili transakcyjnych. Zapisany szablon nadpisuje wysyłkę danego etapu;
					bez zapisu działa domyślny mail z kodu.
				</p>
			</header>

			<EmailEditor initialTemplates={templates} />
		</div>
	);
}
