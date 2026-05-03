// biome-ignore-all lint/security/noDangerouslySetInnerHtml: structured data zgodnie z rekomendacją Google (Schema.org JSON-LD).

type JsonLdProps = {
	data: Record<string, unknown>;
	id?: string;
};

/**
 * Wrapper na Schema.org JSON-LD dla SEO.
 * `replace(/</g, "\\u003c")` zapobiega XSS przy stringach zawierających `</script>`.
 */
export function JsonLd({ data, id }: JsonLdProps) {
	return (
		<script
			type="application/ld+json"
			id={id}
			dangerouslySetInnerHTML={{
				__html: JSON.stringify(data).replace(/</g, "\\u003c"),
			}}
		/>
	);
}
