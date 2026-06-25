import Link from "next/link";
import { InstagramIcon } from "@/components/icons";
import { instagramDisplayLabel } from "@/lib/content/social-links";
import { cn } from "@/lib/utils";

type CmsInstagramLinkProps = {
	href: string;
	className?: string;
	label?: string;
	showIcon?: boolean;
	children?: React.ReactNode;
};

/** Link do Instagrama — renderuj tylko gdy href z CMS jest ustawiony. */
export function CmsInstagramLink({
	href,
	className,
	label,
	showIcon = true,
	children,
}: CmsInstagramLinkProps) {
	return (
		<Link
			href={href}
			target="_blank"
			rel="noreferrer"
			className={cn(
				"inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-foreground/70 transition-colors hover:text-terracotta",
				className,
			)}
		>
			{showIcon ? <InstagramIcon className="size-4" /> : null}
			{children ?? label ?? instagramDisplayLabel(href)}
		</Link>
	);
}
