import { getCustomerKontoUrl } from "@/lib/email/customer-case-email";
import { formatContactTopicLabel, type ContactData } from "@/lib/validation/contact";

export type ContactEmailRenderVars = {
	imie: string;
	email: string;
	temat: string;
	numerSprawy: string;
	numerFormularza: string;
	linkKonto: string;
	wiadomosc: string;
};

const MESSAGE_PREVIEW_MAX = 400;

function truncateMessage(message: string): string {
	const trimmed = message.trim();
	if (trimmed.length <= MESSAGE_PREVIEW_MAX) return trimmed;
	return `${trimmed.slice(0, MESSAGE_PREVIEW_MAX)}…`;
}

export function buildContactEmailRenderVars(
	data: ContactData,
	caseNumber: string,
): ContactEmailRenderVars {
	const temat = formatContactTopicLabel(data);
	const linkKonto = getCustomerKontoUrl();
	return {
		imie: data.name,
		email: data.email,
		temat,
		numerSprawy: caseNumber,
		numerFormularza: caseNumber,
		linkKonto,
		wiadomosc: truncateMessage(data.message),
	};
}
