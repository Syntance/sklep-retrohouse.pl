import { getAllEmailTemplates } from "@/lib/admin/email-templates";
import { loadAdmin } from "@/lib/admin/load";
import { EmailsList } from "./emails-list";

export const dynamic = "force-dynamic";

export default async function MailePage() {
	const templates = await loadAdmin(getAllEmailTemplates);
	return <EmailsList templates={templates} />;
}
