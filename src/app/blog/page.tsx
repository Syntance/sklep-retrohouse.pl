import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRightIcon } from "@/components/icons";
import { Breadcrumbs, Container, CtaLink, Eyebrow, Lead, Section } from "@/components/primitives";
import { formatDate } from "@/lib/format";
import { POST_CATEGORIES, POSTS, type Post, type PostCategory } from "@/lib/mock/posts";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
	title: "Blog — wiedeński vintage, historie i inspiracje",
	description:
		"Edukacja, inspiracje, realizacje i poradniki — wszystko, co warto wiedzieć o vintage z Wiednia.",
};

type SearchParams = Promise<{ kategoria?: string }>;

export default async function BlogPage({ searchParams }: { searchParams: SearchParams }) {
	const { kategoria } = await searchParams;
	const activeCategory = (POST_CATEGORIES.find((category) => category.value === kategoria)?.value ??
		null) as PostCategory | null;

	const filtered = activeCategory
		? POSTS.filter((post) => post.category === activeCategory)
		: POSTS;
	const [featured, ...rest] = filtered;

	return (
		<main id="main" className="flex flex-col">
			<Section spacing="sm">
				<Container size="xl">
					<Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Blog" }]} />
				</Container>
			</Section>

			<Section spacing="md">
				<Container size="xl">
					<div className="max-w-3xl">
						<Eyebrow>Blog RetroHouse</Eyebrow>
						<h1 className="mt-3 font-display text-[clamp(2.4rem,5vw,4rem)] font-semibold leading-[1.05]">
							Wiedeński vintage — historie i inspiracje
						</h1>
						<Lead className="mt-4">
							Behind-the-scenes z wiedeńskich kamienic, edukacja w niszy antyków, inspiracje
							wnętrzarskie i case studies dla projektantów.
						</Lead>
					</div>

					<nav aria-label="Kategorie bloga" className="mt-10 flex flex-wrap gap-2">
						<CategoryPill label="Wszystkie" href="/blog" active={!activeCategory} />
						{POST_CATEGORIES.map((category) => (
							<CategoryPill
								key={category.value}
								label={category.label}
								href={`/blog?kategoria=${category.value}`}
								active={activeCategory === category.value}
							/>
						))}
					</nav>
				</Container>
			</Section>

			{featured ? (
				<Section spacing="md">
					<Container size="xl">
						<FeaturedPost post={featured} />
					</Container>
				</Section>
			) : null}

			{rest.length > 0 ? (
				<Section spacing="md" tone="muted">
					<Container size="xl">
						<header className="mb-8 flex items-end justify-between gap-3">
							<div>
								<Eyebrow>Wszystkie wpisy</Eyebrow>
								<h2 className="mt-3 font-display text-3xl font-semibold leading-tight md:text-4xl">
									Najnowsze
								</h2>
							</div>
						</header>
						<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
							{rest.map((post) => (
								<PostCard key={post.slug} post={post} />
							))}
						</div>
					</Container>
				</Section>
			) : null}

			<Section spacing="md">
				<Container size="md">
					<div className="grid gap-4 rounded-3xl border border-border bg-card p-8 md:grid-cols-[1.4fr_1fr] md:items-center md:p-12">
						<div>
							<Eyebrow>Newsletter</Eyebrow>
							<h2 className="mt-3 font-display text-3xl font-semibold leading-tight">
								Co 2 tygodnie nowy artykuł i nowa dostawa
							</h2>
							<p className="mt-2 text-foreground/70">
								Bez spamu — dzielimy się tylko nowymi tekstami i świeżymi przedmiotami z Wiednia.
							</p>
						</div>
						<form
							action="/api/newsletter"
							method="post"
							className="flex flex-col gap-2 sm:flex-row"
						>
							<label htmlFor="blog-news" className="sr-only">
								E-mail
							</label>
							<input
								id="blog-news"
								name="email"
								type="email"
								required
								autoComplete="email"
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
				</Container>
			</Section>
		</main>
	);
}

function CategoryPill({ label, href, active }: { label: string; href: string; active: boolean }) {
	return (
		<Link
			href={href}
			aria-current={active ? "true" : undefined}
			className={cn(
				"inline-flex items-center rounded-full border px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] transition-colors",
				active
					? "border-foreground bg-foreground text-background"
					: "border-border bg-card text-foreground/70 hover:border-foreground hover:text-foreground",
			)}
		>
			{label}
		</Link>
	);
}

function FeaturedPost({ post }: { post: Post }) {
	return (
		<article className="group/featured grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
			<Link
				href={`/blog/${post.slug}`}
				className="relative aspect-[16/10] overflow-hidden rounded-3xl border border-border bg-card"
			>
				<div
					aria-hidden
					className="absolute inset-0 transition-transform duration-700 group-hover/featured:scale-[1.02]"
					style={{
						backgroundImage: `radial-gradient(70% 60% at 30% 20%, ${post.heroHue}, transparent 60%), linear-gradient(160deg, oklch(0.55 0.08 60), oklch(0.27 0.005 280))`,
					}}
				/>
				<span className="absolute left-4 top-4 rounded-full bg-background/85 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-foreground backdrop-blur">
					Wyróżniony · {post.categoryLabel}
				</span>
			</Link>
			<div>
				<p className="font-sans text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-brass">
					{post.categoryLabel}
				</p>
				<h2 className="mt-3 font-display text-4xl font-semibold leading-tight md:text-5xl">
					<Link href={`/blog/${post.slug}`} className="hover:text-brass">
						{post.title}
					</Link>
				</h2>
				<p className="mt-4 text-foreground/80 md:text-lg">{post.excerpt}</p>
				<div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-foreground/60">
					<span>{formatDate(post.publishedAt)}</span>
					<span aria-hidden>·</span>
					<span>{post.readingTime} min czytania</span>
					<span aria-hidden>·</span>
					<span>{post.author}</span>
				</div>
				<CtaLink href={`/blog/${post.slug}`} className="mt-8">
					Przeczytaj artykuł
				</CtaLink>
			</div>
		</article>
	);
}

function PostCard({ post }: { post: Post }) {
	return (
		<article className="group/card flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-0.5 hover:shadow-lg">
			<Link href={`/blog/${post.slug}`} className="relative block aspect-[5/3] overflow-hidden">
				<div
					aria-hidden
					className="absolute inset-0 transition-transform duration-700 group-hover/card:scale-[1.04]"
					style={{
						backgroundImage: `radial-gradient(80% 60% at 40% 20%, ${post.heroHue}, transparent 60%), linear-gradient(160deg, oklch(0.74 0.06 50), oklch(0.27 0.005 280))`,
					}}
				/>
				<span className="absolute left-3 top-3 rounded-full bg-background/85 px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-foreground backdrop-blur">
					{post.categoryLabel}
				</span>
			</Link>
			<div className="flex flex-1 flex-col gap-3 p-5">
				<p className="text-xs text-foreground/60">
					{formatDate(post.publishedAt)} · {post.readingTime} min
				</p>
				<h3 className="font-display text-xl leading-tight">
					<Link href={`/blog/${post.slug}`} className="hover:text-brass">
						{post.title}
					</Link>
				</h3>
				<p className="line-clamp-3 text-sm text-foreground/70">{post.excerpt}</p>
				<Link
					href={`/blog/${post.slug}`}
					className="mt-auto inline-flex items-center gap-1 text-sm font-semibold text-foreground hover:text-brass"
				>
					Czytaj dalej
					<ArrowRightIcon className="size-4 transition-transform group-hover/card:translate-x-0.5" />
				</Link>
			</div>
		</article>
	);
}
