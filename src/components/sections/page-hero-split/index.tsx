import type { ReactNode } from "react";

type PageHeroSplitProps = {
	breadcrumbs?: ReactNode;
	eyebrow?: ReactNode;
	title: ReactNode;
	lead?: ReactNode;
	actions?: ReactNode;
	image?: ReactNode;
};

/**
 * Hero dwukolumnowy (tekst + zdjęcie) — ten sam układ co na /prezent.
 * Nagłówek wyśrodkowany względem wysokości obrazu na desktopie.
 */
export function PageHeroSplit({
	breadcrumbs,
	eyebrow,
	title,
	lead,
	actions,
	image,
}: PageHeroSplitProps) {
	return (
		<div className="flex flex-col">
			{breadcrumbs ? <div className="mb-8">{breadcrumbs}</div> : null}
			<div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-stretch">
				<div className="flex flex-col justify-center">
					{eyebrow}
					{title}
					{lead ? <div className="mt-6">{lead}</div> : null}
					{actions ? <div className="mt-8 flex flex-wrap items-center gap-3">{actions}</div> : null}
				</div>
				{image ? <div className="min-h-0">{image}</div> : null}
			</div>
		</div>
	);
}
