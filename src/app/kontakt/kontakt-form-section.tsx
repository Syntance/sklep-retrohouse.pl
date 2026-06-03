import { getContactFormsConfig, getContactTopicOptionsFromConfig } from "@/lib/admin/contact-forms";
import { ContactForm } from "./contact-form";

export async function KontaktFormSection() {
	const config = await getContactFormsConfig();
	const topicOptions = getContactTopicOptionsFromConfig(config, "kontakt");

	return <ContactForm topicPreset="kontakt" topicOptions={topicOptions} />;
}
