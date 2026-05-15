"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRightIcon } from "@/components/icons";
import { track } from "@/lib/analytics/posthog";
import type { AnalyticsEvent } from "@/lib/analytics/events";

type CtaType = Extract<AnalyticsEvent, { name: "article_cta_clicked" }>["properties"]["cta_type"];

/**
 * Mid-CTA do produktu w środku artykułu — emituje
 * `article_cta_clicked` z `cta_type` i `article_slug`.
 */
export function ArticleProductCta({
	href,
	articleSlug,
	eyebrow,
	title,
	description,
	buttonLabel,
}: {
	href: string;
	articleSlug: string;
	eyebrow: string;
	title: string;
	description: string;
	buttonLabel: string;
}) {
	return (
		<aside className="not-prose my-10 grid gap-3 rounded-2xl border border-brass/40 bg-terracotta/15 p-6 md:grid-cols-[1fr_auto] md:items-center">
			<div>
				<p className="font-sans text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-brass">
					{eyebrow}
				</p>
				<p className="mt-2 font-display text-xl">{title}</p>
				<p className="mt-1 text-sm text-foreground/75">{description}</p>
			</div>
			<Link
				href={href}
				onClick={() =>
					track({
						name: "article_cta_clicked",
						properties: { cta_type: "product", article_slug: articleSlug },
					})
				}
				className="inline-flex h-11 items-center gap-2 self-start rounded-full bg-terracotta px-5 text-sm font-semibold uppercase tracking-[0.08em] text-terracotta-foreground transition-transform hover:-translate-y-0.5"
			>
				{buttonLabel}
				<ArrowRightIcon className="size-4" />
			</Link>
		</aside>
	);
}

/**
 * Wrapper na kafel pokrewnego artykułu — tracking `related_article_clicked`.
 */
export function RelatedArticleLink({
	href,
	articleSlug,
	className,
	children,
}: {
	href: string;
	articleSlug: string;
	className?: string;
	children: ReactNode;
}) {
	return (
		<Link
			href={href}
			onClick={() =>
				track({ name: "related_article_clicked", properties: { article_slug: articleSlug } })
			}
			className={className}
		>
			{children}
		</Link>
	);
}

/**
 * Generyczny CTA "do sklepu / kategorii / B2B / newsletter" w treści artykułu.
 */
export function ArticleGenericCta({
	href,
	articleSlug,
	ctaType,
	className,
	children,
}: {
	href: string;
	articleSlug: string;
	ctaType: CtaType;
	className?: string;
	children: ReactNode;
}) {
	return (
		<Link
			href={href}
			onClick={() =>
				track({
					name: "article_cta_clicked",
					properties: { cta_type: ctaType, article_slug: articleSlug },
				})
			}
			className={className}
		>
			{children}
		</Link>
	);
}
