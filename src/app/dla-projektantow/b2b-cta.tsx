"use client";

import Link from "next/link";
import { useEffect } from "react";
import { ArrowRightIcon, MailIcon, WhatsAppIcon } from "@/components/icons";
import { CtaLink } from "@/components/primitives";
import { track } from "@/lib/analytics/posthog";
import { useSearchParams } from "next/navigation";

type B2BHeroCtaProps = {
	whatsappHref: string;
	callMailto: string;
};

/**
 * Hero CTA panel B2B — 3 wejścia w lejek:
 *  - "Wyślij brief" (anchor #brief), bez eventu (już jesteśmy na landing).
 *  - "Umów call (15 min)" (mailto z subject) → b2b_call_scheduled.
 *  - "WhatsApp" → b2b_whatsapp_clicked.
 *
 * Dodatkowo: useEffect emituje b2b_landing_clicked z UTM source raz
 * po wejściu, żeby strategia Notion miała dane o tym, skąd
 * wpływa ruch B2B (organic / blog / IG / etc.).
 */
export function B2BHeroCta({ whatsappHref, callMailto }: B2BHeroCtaProps) {
	const params = useSearchParams();

	useEffect(() => {
		const utm = params.get("utm_source");
		const refSource = pickSource(utm);
		track({
			name: "b2b_landing_clicked",
			properties: { source: refSource },
		});
	}, [params]);

	return (
		<div className="flex flex-wrap items-center gap-3">
			<CtaLink href="#brief" variant="primary">
				Wyślij brief
			</CtaLink>
			<Link
				href={callMailto}
				onClick={() => track({ name: "b2b_call_scheduled", properties: {} })}
				className="cta-text inline-flex items-center gap-2 rounded-full border border-walnut/25 bg-background px-5 py-3 text-xs text-foreground transition-colors hover:border-terracotta hover:text-terracotta focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-terracotta"
			>
				<MailIcon className="size-4" />
				Umów call (15 min)
			</Link>
			<Link
				href={whatsappHref}
				target="_blank"
				rel="noreferrer"
				onClick={() => track({ name: "b2b_whatsapp_clicked", properties: {} })}
				className="cta-text inline-flex items-center gap-2 rounded-full border border-walnut/25 bg-background px-5 py-3 text-xs text-foreground transition-colors hover:border-terracotta hover:text-terracotta focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-terracotta"
			>
				<WhatsAppIcon className="size-4" />
				WhatsApp
			</Link>
		</div>
	);
}

function pickSource(utm: string | null): "/o-nas" | "footer" | "/blog" | "header" {
	if (utm === "blog") return "/blog";
	if (utm === "onas") return "/o-nas";
	if (utm === "footer") return "footer";
	return "header";
}

type B2BWhatsAppLinkProps = {
	href: string;
	className?: string;
	children: React.ReactNode;
};

export function B2BWhatsAppLink({ href, className, children }: B2BWhatsAppLinkProps) {
	return (
		<Link
			href={href}
			target="_blank"
			rel="noreferrer"
			onClick={() => track({ name: "b2b_whatsapp_clicked", properties: {} })}
			className={className}
		>
			{children}
		</Link>
	);
}

type B2BFinalCtaProps = {
	whatsappHref: string;
	emailHref: string;
};

/**
 * Końcowy CTA na dole strony — z widocznym e-mailem B2B
 * (Notion: "końcowy CTA z email B2B widocznym").
 */
export function B2BFinalCta({ whatsappHref, emailHref }: B2BFinalCtaProps) {
	const email = emailHref.replace("mailto:", "");
	return (
		<div className="flex flex-col items-center gap-3">
			<div className="flex flex-wrap items-center justify-center gap-3">
				<CtaLink href="#brief" variant="primary">
					Wypełnij brief
				</CtaLink>
				<B2BWhatsAppLink
					href={whatsappHref}
					className="cta-text inline-flex items-center gap-2 rounded-full border border-walnut/25 bg-background px-5 py-3 text-xs text-foreground hover:border-terracotta hover:text-terracotta"
				>
					<WhatsAppIcon className="size-4" />
					WhatsApp
				</B2BWhatsAppLink>
			</div>
			<a
				href={emailHref}
				className="inline-flex items-center gap-2 text-sm text-foreground/70 hover:text-terracotta"
			>
				<MailIcon className="size-4" />
				{email}
				<ArrowRightIcon className="size-3.5" />
			</a>
		</div>
	);
}
