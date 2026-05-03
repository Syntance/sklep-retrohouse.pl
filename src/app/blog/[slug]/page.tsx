import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRightIcon, InstagramIcon } from "@/components/icons";
import { JsonLd } from "@/components/json-ld";
import { Breadcrumbs, Container, CtaLink, Eyebrow, Section } from "@/components/primitives";
import { ProductCard } from "@/components/product-card";
import { formatDate } from "@/lib/format";
import { getPostBySlug, getRelatedPosts, POSTS } from "@/lib/mock/posts";
import { PRODUCTS } from "@/lib/mock/products";

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
	const recommendedProducts = PRODUCTS.slice(0, 3);

	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "Article",
		headline: post.title,
		description: post.excerpt,
		datePublished: post.publishedAt,
		author: { "@type": "Organization", name: "RetroHouse" },
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
						<figcaption className="absolute bottom-4 left-4 text-xs font-semibold uppercase tracking-[0.16em] text-background drop-shadow">
							Hero · {post.title}
						</figcaption>
					</figure>
				</Container>
			</Section>

			<Section spacing="md">
				<Container size="md">
					<article className="prose prose-lg max-w-none [&_h2]:font-display [&_h2]:text-3xl [&_h2]:mt-12 [&_h2]:mb-4 [&_p]:leading-relaxed [&_p]:text-foreground/80 [&_a]:text-foreground [&_a]:underline-offset-4 [&_a]:underline [&_a:hover]:text-brass">
						<p>
							To jest zarys artykułu wygenerowany na podstawie schematu z Notion. Treść finalną
							dostarczy redakcja — tu jest miejsce na 600–1200 słów z H2 i H3, śródtytułami,
							cytatami i CTA mid-article.
						</p>
						<h2>Wstęp</h2>
						<p>
							{post.excerpt} Pełna wersja zostanie dostarczona przez Sanity (CMS) — tu jest miejsce
							na komponent <code>PortableText</code> z custom rendererami pod nagłówki, cytaty,
							listy i embed produktów.
						</p>

						<aside className="not-prose my-10 grid gap-3 rounded-2xl border border-brass/40 bg-brass/15 p-6 md:grid-cols-[1fr_auto] md:items-center">
							<div>
								<p className="font-display text-xl">Polecane do tego artykułu</p>
								<p className="text-sm text-foreground/70">
									3 przedmioty z naszego sklepu pasujące do tematu wpisu.
								</p>
							</div>
							<CtaLink href="/sklep" variant="secondary">
								Zobacz w sklepie
							</CtaLink>
						</aside>

						<h2>Główna teza</h2>
						<p>
							Tu redakcja rozwinie tezę główną z eyebrowa. Każdy artykuł powinien mieć min. 1 CTA
							mid-article do produktu/kategorii i 1 CTA end do newslettera lub /sklep.
						</p>

						<h2>Podsumowanie</h2>
						<p>Zamknięcie z odwołaniem do CTA — newsletter, sklep, IG.</p>
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
						{recommendedProducts.map((product) => (
							<ProductCard key={product.slug} product={product} source="/blog" />
						))}
					</div>
				</Container>
			</Section>

			<Section spacing="md">
				<Container size="md">
					<div className="grid gap-6 rounded-3xl border border-border bg-card p-8 md:grid-cols-[1.4fr_1fr] md:items-center md:p-12">
						<div>
							<Eyebrow>Newsletter RetroHouse</Eyebrow>
							<h2 className="mt-3 font-display text-3xl font-semibold leading-tight md:text-4xl">
								Spodobało się? Daj znać przy następnym tekście
							</h2>
							<p className="mt-2 text-foreground/70">
								Co 2 tygodnie nowy artykuł i lista nowych przedmiotów z Wiednia.
							</p>
						</div>
						<form
							action="/api/newsletter"
							method="post"
							className="flex flex-col gap-2 sm:flex-row"
						>
							<label htmlFor="post-news" className="sr-only">
								E-mail
							</label>
							<input
								id="post-news"
								name="email"
								type="email"
								required
								placeholder="twój e-mail"
								className="h-11 w-full rounded-full border border-border bg-background px-4 text-sm focus-visible:border-brass focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass"
							/>
							<button
								type="submit"
								className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-foreground px-5 text-sm font-semibold uppercase tracking-[0.16em] text-background"
							>
								Zapisz mnie
								<ArrowRightIcon className="size-4" />
							</button>
						</form>
					</div>
					<div className="mt-4 flex justify-end">
						<Link
							href="https://instagram.com/retrohouse"
							target="_blank"
							rel="noreferrer"
							className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-foreground/70 hover:text-brass"
						>
							<InstagramIcon className="size-4" />
							Obserwuj @retrohouse
						</Link>
					</div>
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
								<Link
									key={item.slug}
									href={`/blog/${item.slug}`}
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
								</Link>
							))}
						</div>
					</Container>
				</Section>
			) : null}

			<JsonLd data={jsonLd} id="article-jsonld" />
		</main>
	);
}
