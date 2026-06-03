import { LEGAL_DOCUMENT_CONTACT } from "@/components/sections/legal-document-contact/presets";
import { LegalDocumentContactSection } from "@/components/sections/legal-document-contact/section";
import { OdstapienieContent } from "./odstapienie-content";

export default function OdstapieniePage() {
	return (
		<main id="main" className="flex flex-col">
			<OdstapienieContent />
			<LegalDocumentContactSection {...LEGAL_DOCUMENT_CONTACT.withdrawal} />
		</main>
	);
}
