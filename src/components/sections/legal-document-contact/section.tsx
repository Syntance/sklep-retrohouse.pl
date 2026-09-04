import Link from "next/link";
import { ContactForm } from "@/app/kontakt/contact-form";
import { Container, Eyebrow, Section } from "@/components/primitives";
import { getContactFormsConfig, getContactTopicOptionsFromConfig } from "@/lib/admin/contact-forms";
import { EMAIL_CONTACT } from "@/lib/email/constants";
import type { LegalDocumentContactSectionProps } from "./presets";

function EmailFallbackLine({ email }: { email: string }) {
	return (
		<p className="text-foreground/70">
			Możesz też napisać na{" "}
			<Link
				href={`mailto:${email}`}
				className="font-semibold text-foreground underline underline-offset-4 hover:text-terracotta"
			>
				{email}
			</Link>
			.
		</p>
	);
}

/** Server Component — ładuje konfigurację formularzy z Medusa. */
export async function LegalDocumentContactSection({
	heading,
	topicPreset,
	email = EMAIL_CONTACT,
	noteBeforeEmail,
}: LegalDocumentContactSectionProps) {
	const config = await getContactFormsConfig();
	const topicOptions = getContactTopicOptionsFromConfig(config, topicPreset);
	const form = config.forms.find((f) => f.id === topicPreset);
	const displayEmail = form?.recipientEmail ?? email;

	return (
		<Section spacing="md" tone="muted">
			<Container size="md">
				<div className="space-y-6">
					<Eyebrow>{heading}</Eyebrow>
					<ContactForm variant="embedded" topicPreset={topicPreset} topicOptions={topicOptions} />
					<div className="space-y-2 text-sm">
						{noteBeforeEmail}
						<EmailFallbackLine email={displayEmail} />
					</div>
				</div>
			</Container>
		</Section>
	);
}
