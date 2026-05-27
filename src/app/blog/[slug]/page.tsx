import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/json-ld";
import { NewsletterForm } from "@/components/newsletter-form";
import { Breadcrumbs, Container, Eyebrow, Section } from "@/components/primitives";
import { ProductCard } from "@/components/product-card";
import { formatDate } from "@/lib/format";
import { getPostBySlug, getRelatedPosts, POSTS } from "@/lib/mock/posts";
import { getProductBySlug, listProducts } from "@/lib/products/queries";
import {
	ArticleGenericCta,
	ArticleProductCta,
	RelatedArticleLink,
} from "./article-tracking";

export function generateStaticParams() {
	return POSTS.map((post) => ({ slug: post.slug }));
}

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
	const { slug } = await params;
	const post = getPostBySlug(slug);
	if (!post) return {};
	return {
		title: post.title,
		description: post.excerpt,
		alternates: { canonical: `/blog/${post.slug}` },
		openGraph: {
			type: "article",
			title: post.title,
			description: post.excerpt,
			publishedTime: post.publishedAt,
			authors: [post.author],
		},
	};
}

export default async function BlogPostPage({ params }: { params: Params }) {
	const { slug } = await params;
	const post = getPostBySlug(slug);
	if (!post) notFound();

	const related = getRelatedPosts(slug, 3);
	const relatedProduct = post.relatedProductSlug
		? await getProductBySlug(post.relatedProductSlug)
		: undefined;
	const allProducts = await listProducts();
	const recommendedProducts = allProducts.slice(0, 3);

	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "Article",
		headline: post.title,
		description: post.excerpt,
		datePublished: post.publishedAt,
		dateModified: post.publishedAt,
		author: { "@type": "Organization", name: "RetroHouse", url: "https://sklep-retrohouse.pl/" },
		publisher: {
			"@type": "Organization",
			name: "RetroHouse",
			logo: {
				"@type": "ImageObject",
				url: "https://sklep-retrohouse.pl/og-image.png",
			},
		},
		image: ["https://sklep-retrohouse.pl/og-image.png"],
		mainEntityOfPage: {
			"@type": "WebPage",
			"@id": `https://sklep-retrohouse.pl/blog/${post.slug}`,
		},
	};

	return (
		<main id="main" className="flex flex-col">
			<Section spacing="sm">
				<Container size="md">
					<Breadcrumbs
						items={[
							{ label: "Home", href: "/" },
							{ label: "Blog", href: "/blog" },
							{ label: post.title },
						]}
					/>
				</Container>
			</Section>

			<Section spacing="md">
				<Container size="md">
					<div>
						<p className="font-sans text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-brass">
							{post.categoryLabel}
						</p>
						<h1 className="mt-3 font-display text-[clamp(2.2rem,5vw,3.6rem)] font-semibold leading-[1.05]">
							{post.title}
						</h1>
						<p className="mt-4 text-pretty text-lg text-foreground/80">{post.excerpt}</p>
						<div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-foreground/60">
							<span>{formatDate(post.publishedAt)}</span>
							<span aria-hidden>·</span>
							<span>{post.readingTime} min czytania</span>
							<span aria-hidden>·</span>
							<span>{post.author}</span>
						</div>
					</div>

					<figure className="relative mt-10 aspect-[16/9] overflow-hidden rounded-3xl border border-border bg-card">
						<div
							aria-hidden
							className="absolute inset-0"
							style={{
								backgroundImage: `radial-gradient(70% 60% at 30% 20%, ${post.heroHue}, transparent 60%), linear-gradient(160deg, oklch(0.55 0.08 60), oklch(0.27 0.005 280))`,
							}}
						/>
						<figcaption className="absolute bottom-4 left-4 text-xs font-semibold uppercase tracking-[0.16em] text-ink-foreground drop-shadow">
							Hero · {post.title}
						</figcaption>
					</figure>
				</Container>
			</Section>

			<Section spacing="md">
				<Container size="md">
					<article className="prose prose-lg max-w-none [&_h2]:font-display [&_h2]:text-3xl [&_h2]:mt-12 [&_h2]:mb-4 [&_p]:leading-relaxed [&_p]:text-foreground/80 [&_a]:text-foreground [&_a]:underline-offset-4 [&_a]:underline [&_a:hover]:text-brass">
						{post.bodyExtended ? (
							<>
								<p>{post.bodyExtended.intro}</p>

								{post.bodyExtended.sections.slice(0, 2).map((section) => (
									<section key={section.heading}>
										<h2>{section.heading}</h2>
										{section.paragraphs.map((paragraph) => (
											<p key={paragraph.slice(0, 40)}>{paragraph}</p>
										))}
									</section>
								))}

								{relatedProduct ? (
									<ArticleProductCta
										href={`/sklep/${relatedProduct.slug}?source=%2Fblog`}
										articleSlug={post.slug}
										eyebrow={post.bodyExtended.cta.eyebrow}
										title={post.bodyExtended.cta.title}
										description={post.bodyExtended.cta.description}
										buttonLabel={post.bodyExtended.cta.buttonLabel}
									/>
								) : null}

								{post.bodyExtended.sections.slice(2).map((section) => (
									<section key={section.heading}>
										<h2>{section.heading}</h2>
										{section.paragraphs.map((paragraph) => (
											<p key={paragraph.slice(0, 40)}>{paragraph}</p>
										))}
									</section>
								))}

								<h2>Podsumowanie</h2>
								<p>{post.bodyExtended.conclusion}</p>

								<aside className="not-prose my-10 grid gap-3 rounded-2xl border border-border bg-cream p-6 md:grid-cols-[1fr_auto] md:items-center">
									<div>
										<p className="font-sans text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-brass">
											Następny krok
										</p>
										<p className="mt-2 font-display text-xl">
											Wszystkie skarby z wiedeńskich kamienic
										</p>
										<p className="mt-1 text-sm text-foreground/75">
											Zobacz pełną kolekcję — porcelana, szkło, lampy, krzesła, obrazy.
										</p>
									</div>
									<ArticleGenericCta
										href="/sklep"
										articleSlug={post.slug}
										ctaType="category"
										className="inline-flex h-11 items-center gap-2 self-start rounded-full border border-border bg-background px-5 text-sm font-semibold uppercase tracking-[0.08em] text-foreground transition-colors hover:border-terracotta hover:text-terracotta"
									>
										Otwórz sklep
									</ArticleGenericCta>
								</aside>
							</>
						) : (
							<>
								<p>
									To jest zarys artykułu wygenerowany na podstawie schematu z Notion. Treść finalną
									dostarczy redakcja — tu jest miejsce na 600–1200 słów z H2 i H3, śródtytułami,
									cytatami i CTA mid-article.
								</p>
								<h2>Wstęp</h2>
								<p>
									{post.excerpt} Pełna wersja zostanie dostarczona przez Sanity (CMS) — tu jest
									miejsce na komponent <code>PortableText</code> z custom rendererami pod nagłówki,
									cytaty, listy i embed produktów.
								</p>

								<aside className="not-prose my-10 grid gap-3 rounded-2xl border border-brass/40 bg-terracotta/15 p-6 md:grid-cols-[1fr_auto] md:items-center">
									<div>
										<p className="font-display text-xl">Polecane do tego artykułu</p>
										<p className="text-sm text-foreground/70">
											Zobacz aktualną kolekcję pasującą do tematu wpisu.
										</p>
									</div>
									<ArticleGenericCta
										href="/sklep"
										articleSlug={post.slug}
										ctaType="category"
										className="inline-flex h-11 items-center gap-2 self-start rounded-full bg-terracotta px-5 text-sm font-semibold uppercase tracking-[0.08em] text-terracotta-foreground"
									>
										Zobacz w sklepie
									</ArticleGenericCta>
								</aside>

								<h2>Podsumowanie</h2>
								<p>Zamknięcie z odwołaniem do CTA — newsletter, sklep, IG.</p>
							</>
						)}
					</article>
				</Container>
			</Section>

			<Section spacing="md" tone="muted">
				<Container size="md">
					<header className="mb-6">
						<Eyebrow>Polecane produkty</Eyebrow>
						<h2 className="mt-3 font-display text-3xl font-semibold leading-tight md:text-4xl">
							Przedmioty pasujące do tego tekstu
						</h2>
					</header>
					<div className="grid gap-6 sm:grid-cols-3">
						{recommendedProducts.map((product, index) => (
							<ProductCard
								key={product.slug}
								product={product}
								source="/blog"
								position={index + 1}
							/>
						))}
					</div>
				</Container>
			</Section>

			<Section spacing="md">
				<Container size="md">
					<NewsletterForm
						source="blog"
						heading="Spodobało się? Daj znać przy następnym tekście"
						description="Co 2 tygodnie nowy artykuł i lista nowych przedmiotów z Wiednia."
					/>
				</Container>
			</Section>

			{related.length > 0 ? (
				<Section spacing="md" tone="muted">
					<Container size="xl">
						<header className="mb-6">
							<Eyebrow>Powiązane artykuły</Eyebrow>
							<h2 className="mt-3 font-display text-3xl font-semibold leading-tight md:text-4xl">
								Czytaj dalej
							</h2>
						</header>
						<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
							{related.map((item) => (
								<RelatedArticleLink
									key={item.slug}
									href={`/blog/${item.slug}`}
									articleSlug={item.slug}
									className="group/related flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-0.5 hover:shadow-lg"
								>
									<div className="relative aspect-[5/3] overflow-hidden">
										<div
											aria-hidden
											className="absolute inset-0 transition-transform duration-700 group-hover/related:scale-[1.04]"
											style={{
												backgroundImage: `radial-gradient(70% 60% at 30% 20%, ${item.heroHue}, transparent 60%), linear-gradient(160deg, oklch(0.74 0.06 50), oklch(0.27 0.005 280))`,
											}}
										/>
									</div>
									<div className="flex flex-1 flex-col gap-2 p-5">
										<p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-brass">
											{item.categoryLabel}
										</p>
										<h3 className="font-display text-lg leading-snug">{item.title}</h3>
										<p className="text-xs text-foreground/60">
											{formatDate(item.publishedAt)} · {item.readingTime} min
										</p>
									</div>
								</RelatedArticleLink>
							))}
						</div>
					</Container>
				</Section>
			) : null}

			<JsonLd data={jsonLd} id="article-jsonld" />
		</main>
	);
}
