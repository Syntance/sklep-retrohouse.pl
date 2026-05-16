"use client";

import Link from "next/link";
import { Container, Eyebrow, Section } from "@/components/primitives";
import { track } from "@/lib/analytics/posthog";

type Category = {
	label: string;
	href: string;
	tagline: string;
	hue: string;
	slug: string;
};

const CATEGORIES: Category[] = [
	{
		label: "Porcelana",
		slug: "porcelana",
		href: "/sklep?kategoria=porcelana",
		tagline: "Augarten, Rosenthal, Wiener Werkstätte",
		hue: "oklch(0.92 0.02 80)",
	},
	{
		label: "Szkło",
		slug: "szklo",
		href: "/sklep?kategoria=szklo",
		tagline: "Lobmeyr, Riedel, art déco",
		hue: "oklch(0.86 0.03 75)",
	},
	{
		label: "Meble",
		slug: "meble",
		href: "/sklep?kategoria=meble",
		tagline: "Thonet, gęte i biedermeier",
		hue: "oklch(0.68 0.07 50)",
	},
	{
		label: "Dekoracje",
		slug: "dekoracje",
		href: "/sklep?kategoria=dekoracje",
		tagline: "Lustra, świeczniki, drobne unikaty",
		hue: "oklch(0.78 0.06 60)",
	},
	{
		label: "Obrazy",
		slug: "obrazy",
		href: "/sklep?kategoria=obrazy",
		tagline: "Sygnowane oleje i grafika XX w.",
		hue: "oklch(0.84 0.04 90)",
	},
	{
		label: "Prezenty",
		slug: "prezent",
		href: "/prezent",
		tagline: "Z duszą — pakujemy i wysyłamy",
		hue: "oklch(0.74 0.10 80)",
	},
];

/**
 * Sześć kafli kategorii — drugi entry point po hero.
 * Każde kliknięcie loguje `category_tile_clicked` z czystą nazwą.
 */
export function CategoriesSection() {
	return (
		<Section spacing="lg" tone="default" id="home-kategorie" className="scroll-mt-24">
			<Container size="lg">
				<header className="mb-8 max-w-xl">
					<Eyebrow>Kategorie</Eyebrow>
					<h2 className="mt-3 font-display text-3xl font-medium leading-tight md:text-4xl">
						Co cię dziś interesuje?
					</h2>
				</header>

				<ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{CATEGORIES.map((category) => (
						<li key={category.slug}>
							<Link
								href={category.href}
								onClick={() =>
									track({
										name: "category_tile_clicked",
										properties: { category: category.slug },
									})
								}
								className="group/cat relative block overflow-hidden rounded-2xl border border-walnut/15 bg-card p-6 shadow-card transition-all hover:-translate-y-1 hover:border-walnut/30 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-terracotta"
							>
								<div
									aria-hidden="true"
									className="absolute inset-0 -z-10 opacity-60 transition-opacity group-hover/cat:opacity-90"
									style={{
										backgroundImage: `radial-gradient(120% 80% at 80% 0%, ${category.hue}, transparent 60%)`,
									}}
								/>
								<p className="cta-text text-[0.65rem] text-walnut/80">{category.tagline}</p>
								<h3 className="mt-2 font-display text-2xl font-medium leading-snug text-foreground">
									{category.label}
								</h3>
								<span className="mt-4 inline-flex cta-text text-xs text-foreground/60 transition-colors group-hover/cat:text-terracotta">
									Zobacz kategorię →
								</span>
							</Link>
						</li>
					))}
				</ul>
			</Container>
		</Section>
	);
}
