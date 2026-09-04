import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/panel/chrome";
import { getAllEmailTemplates } from "@/lib/admin/email-templates";
import { loadAdmin } from "@/lib/admin/load";
import { EMAIL_TEMPLATE_TYPES, type EmailTemplateType } from "@/lib/email/template-types";
import { EmailEditorWrapper } from "../email-editor-wrapper";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ type: string }> };

export function generateStaticParams() {
	return EMAIL_TEMPLATE_TYPES.map(({ type }) => ({ type }));
}

export async function generateMetadata({ params }: Props) {
	const { type } = await params;
	const meta = EMAIL_TEMPLATE_TYPES.find((entry) => entry.type === type);
	return { title: meta ? `E-mail — ${meta.label}` : "E-mail" };
}

export default async function EmailEditorPage({ params }: Props) {
	const { type } = await params;
	const isValid = EMAIL_TEMPLATE_TYPES.some((entry) => entry.type === type);
	if (!isValid) notFound();

	const templateType = type as EmailTemplateType;
	const templates = await loadAdmin(getAllEmailTemplates);
	const meta = EMAIL_TEMPLATE_TYPES.find((entry) => entry.type === templateType);

	return (
		<div className="flex flex-col gap-6">
			<Link
				href="/magazyn/maile"
				className="inline-flex w-fit items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
			>
				<ChevronLeft className="size-4" aria-hidden />
				Wróć do e-maili
			</Link>

			<PageHeader
				className="mb-0"
				title={meta?.label ?? "E-mail"}
				description={<span className="font-mono">{templateType}</span>}
			/>

			<EmailEditorWrapper
				initialTemplates={templates}
				initialType={templateType}
				hideTemplatePicker
			/>
		</div>
	);
}
