import Image from "next/image";
import { Breadcrumbs, Container, Lead, Section } from "@/components/primitives";
import { resolveCmsMediaPublicUrl } from "@/lib/content/cms-media-url";
import { cn } from "@/lib/utils";

type Props = {
	backgroundImageUrl?: string;
	backgroundImageAlt?: string;
};

export function ShopHero({ backgroundImageUrl, backgroundImageAlt }: Props) {
	const bgUrl = backgroundImageUrl
		? (resolveCmsMediaPublicUrl(backgroundImageUrl) ?? backgroundImageUrl)
		: undefined;
	const hasBackground = Boolean(bgUrl?.trim());

	return (
		<Section
			spacing="md"
			tone={hasBackground ? "default" : "muted"}
			className={cn(hasBackground && "relative min-h-[min(42vh,22rem)] overflow-hidden")}
		>
			{hasBackground && bgUrl ? (
				<>
					<Image
						src={bgUrl}
						alt=""
						fill
						priority
						sizes="100vw"
						className="object-cover object-center"
					/>
					<div
						className="absolute inset-0 bg-gradient-to-b from-ink/35 via-ink/20 to-ink/45"
						aria-hidden
					/>
				</>
			) : null}

			<Container size="xl" className={cn(hasBackground && "relative z-10")}>
				<Breadcrumbs
					items={[{ label: "Home", href: "/" }, { label: "Sklep" }]}
					className={
						hasBackground
							? "text-white/75 [&_a]:text-white/90 [&_a:hover]:text-white [&_span]:text-white"
							: undefined
					}
				/>
				<div className="mt-8 flex flex-col items-center text-center">
					<div
						className={cn(
							"flex max-w-2xl flex-col items-center",
							hasBackground &&
								"rounded-3xl border border-white/15 bg-background/50 px-8 py-10 shadow-[0_8px_32px_oklch(0_0_0/0.12)] backdrop-blur-md md:px-12 md:py-12",
						)}
					>
						<h1
							className={cn(
								"font-display text-5xl font-semibold leading-tight md:text-6xl",
								hasBackground && "text-foreground",
							)}
						>
							Nasza kolekcja
						</h1>
						<Lead className={cn("mt-4 max-w-xl", hasBackground && "text-foreground/85")}>
							Antyki, które już się nie powtórzą.
						</Lead>
						{hasBackground && backgroundImageAlt ? (
							<span className="sr-only">{backgroundImageAlt}</span>
						) : null}
					</div>
				</div>
			</Container>
		</Section>
	);
}
