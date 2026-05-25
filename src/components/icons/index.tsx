import type { SVGProps } from "react";

/**
 * RetroHouse — custom icon set (ręcznie rysowane line-icons).
 * Zasady (00-core.mdc / brandbook):
 * - stroke-width 1.5
 * - stroke-linecap / stroke-linejoin: round
 * - viewBox 24×24
 * - bez wypełnienia (currentColor jako stroke)
 * Komponowanie: <CartIcon className="size-5 text-brass" />
 */

type IconProps = SVGProps<SVGSVGElement> & {
	title?: string;
};

function Svg({ title, children, ...props }: IconProps) {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth={1.5}
			strokeLinecap="round"
			strokeLinejoin="round"
			role={title ? "img" : "presentation"}
			aria-hidden={title ? undefined : true}
			aria-label={title}
			focusable={false}
			{...props}
		>
			{title ? <title>{title}</title> : null}
			{children}
		</svg>
	);
}

export function ArrowRightIcon(props: IconProps) {
	return (
		<Svg {...props}>
			<path d="M5 12h14" />
			<path d="m13 6 6 6-6 6" />
		</Svg>
	);
}

export function ArrowUpRightIcon(props: IconProps) {
	return (
		<Svg {...props}>
			<path d="M7 17 17 7" />
			<path d="M8 7h9v9" />
		</Svg>
	);
}

export function CartIcon(props: IconProps) {
	return (
		<Svg {...props}>
			<path d="M4 5h2.2l2.1 11a2 2 0 0 0 2 1.6h7.4a2 2 0 0 0 2-1.5L21.5 9H7" />
			<circle cx="10" cy="20" r="1.2" />
			<circle cx="17" cy="20" r="1.2" />
		</Svg>
	);
}

export function SearchIcon(props: IconProps) {
	return (
		<Svg {...props}>
			<circle cx="11" cy="11" r="6.5" />
			<path d="m20 20-3.5-3.5" />
		</Svg>
	);
}

export function MenuIcon(props: IconProps) {
	return (
		<Svg {...props}>
			<path d="M4 7h16" />
			<path d="M4 12h16" />
			<path d="M4 17h10" />
		</Svg>
	);
}

export function CloseIcon(props: IconProps) {
	return (
		<Svg {...props}>
			<path d="m6 6 12 12" />
			<path d="M18 6 6 18" />
		</Svg>
	);
}

export function ChevronDownIcon(props: IconProps) {
	return (
		<Svg {...props}>
			<path d="m6 9 6 6 6-6" />
		</Svg>
	);
}

export function PinIcon(props: IconProps) {
	return (
		<Svg {...props}>
			<path d="M12 21s7-7.6 7-12a7 7 0 1 0-14 0c0 4.4 7 12 7 12Z" />
			<circle cx="12" cy="9" r="2.4" />
		</Svg>
	);
}

export function ClockIcon(props: IconProps) {
	return (
		<Svg {...props}>
			<circle cx="12" cy="12" r="8.5" />
			<path d="M12 7.5V12l3 1.8" />
		</Svg>
	);
}

export function MailIcon(props: IconProps) {
	return (
		<Svg {...props}>
			<rect x="3.5" y="5.5" width="17" height="13" rx="2.2" />
			<path d="m4 7 8 6 8-6" />
		</Svg>
	);
}

export function PhoneIcon(props: IconProps) {
	return (
		<Svg {...props}>
			<path d="M5 5.5C5 4.7 5.7 4 6.5 4h2.2c.7 0 1.3.5 1.5 1.2l.7 3a1.6 1.6 0 0 1-.5 1.7l-1.6 1.3a13 13 0 0 0 5 5l1.3-1.6a1.6 1.6 0 0 1 1.7-.5l3 .7c.7.2 1.2.8 1.2 1.5v2.2c0 .8-.7 1.5-1.5 1.5A14.5 14.5 0 0 1 5 5.5Z" />
		</Svg>
	);
}

export function InstagramIcon(props: IconProps) {
	return (
		<Svg {...props}>
			<rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
			<circle cx="12" cy="12" r="4" />
			<circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" />
		</Svg>
	);
}

export function FacebookIcon(props: IconProps) {
	return (
		<Svg {...props}>
			<path d="M14.5 8.5h2V5.5h-2.2c-2 0-3.3 1.4-3.3 3.4V11H9v3h2v6h3v-6h2.3l.5-3H14V9.4c0-.5.3-.9.5-.9Z" />
		</Svg>
	);
}

export function WhatsAppIcon(props: IconProps) {
	return (
		<Svg {...props}>
			<path d="M3.5 20.5 5 16a8 8 0 1 1 3 3l-4.5 1.5Z" />
			<path d="M9.5 9.5c.4 1.4 1.6 2.6 3 3l1.2-1 2.3 1c.2.8-.5 1.8-1.5 2-2.5.4-5.5-2.6-5-5 .2-1 1.2-1.7 2-1.5l1 2.3-1 1.2Z" />
		</Svg>
	);
}

export function HeartIcon(props: IconProps) {
	return (
		<Svg {...props}>
			<path d="M12 20s-7-4.4-7-9.5a4 4 0 0 1 7-2.6 4 4 0 0 1 7 2.6c0 5-7 9.5-7 9.5Z" />
		</Svg>
	);
}

export function ShieldIcon(props: IconProps) {
	return (
		<Svg {...props}>
			<path d="M12 3 4 5.5v6c0 5 3.5 7.8 8 9.5 4.5-1.7 8-4.5 8-9.5v-6L12 3Z" />
			<path d="m9 12 2 2 4-4" />
		</Svg>
	);
}

export function PackageIcon(props: IconProps) {
	return (
		<Svg {...props}>
			<path d="M12 3 4 7v10l8 4 8-4V7l-8-4Z" />
			<path d="m4 7 8 4 8-4" />
			<path d="M12 11v10" />
			<path d="M8 5v4" />
		</Svg>
	);
}

export function GiftIcon(props: IconProps) {
	return (
		<Svg {...props}>
			<rect x="3.5" y="9" width="17" height="11" rx="1.5" />
			<path d="M2.5 9h19" />
			<path d="M12 9v11" />
			<path d="M12 9c-2.5 0-4.5-1.5-4.5-3.2 0-1 .8-1.8 1.8-1.8 1.8 0 2.7 2.5 2.7 5Z" />
			<path d="M12 9c2.5 0 4.5-1.5 4.5-3.2 0-1-.8-1.8-1.8-1.8C12.9 4 12 6.5 12 9Z" />
		</Svg>
	);
}

export function CompassIcon(props: IconProps) {
	return (
		<Svg {...props}>
			<circle cx="12" cy="12" r="8.5" />
			<path d="m9 15 1.5-4.5L15 9l-1.5 4.5L9 15Z" />
		</Svg>
	);
}

export function PaletteIcon(props: IconProps) {
	return (
		<Svg {...props}>
			<path d="M12 3.5a8.5 8.5 0 0 0 0 17c1 0 1.6-.7 1.6-1.5 0-.8-.6-1.4-.6-2 0-.7.6-1.2 1.4-1.2H16a4.5 4.5 0 0 0 4.5-4.5C20.5 6.7 16.6 3.5 12 3.5Z" />
			<circle cx="7.5" cy="11" r="1" fill="currentColor" />
			<circle cx="10.5" cy="7.5" r="1" fill="currentColor" />
			<circle cx="14.5" cy="7" r="1" fill="currentColor" />
			<circle cx="17.5" cy="10.5" r="1" fill="currentColor" />
		</Svg>
	);
}

export function CheckIcon(props: IconProps) {
	return (
		<Svg {...props}>
			<path d="m5 12 5 5 9-9" />
		</Svg>
	);
}

export function PlusIcon(props: IconProps) {
	return (
		<Svg {...props}>
			<path d="M12 5v14" />
			<path d="M5 12h14" />
		</Svg>
	);
}

export function MinusIcon(props: IconProps) {
	return (
		<Svg {...props}>
			<path d="M5 12h14" />
		</Svg>
	);
}

export function ZoomIcon(props: IconProps) {
	return (
		<Svg {...props}>
			<circle cx="11" cy="11" r="6.5" />
			<path d="m20 20-3.5-3.5" />
			<path d="M11 8.5v5" />
			<path d="M8.5 11h5" />
		</Svg>
	);
}

export function ScrollIcon(props: IconProps) {
	return (
		<Svg {...props}>
			<path d="M5 7v10a3 3 0 0 0 3 3h11" />
			<path d="M5 7a2 2 0 1 1 4 0v10c0 1.7 1.3 3 3 3" />
			<path d="M19 4H8a2 2 0 0 0-2 2v3h13V6a2 2 0 0 1 2-2Z" />
		</Svg>
	);
}

export function HouseIcon(props: IconProps) {
	return (
		<Svg {...props}>
			<path d="M4 10.5 12 4l8 6.5" />
			<path d="M6 10v10h12V10" />
			<path d="M10 20v-4h4v4" />
		</Svg>
	);
}

export function CalendarIcon(props: IconProps) {
	return (
		<Svg {...props}>
			<rect x="3" y="5" width="18" height="16" rx="2" />
			<path d="M3 10h18" />
			<path d="M8 3v4M16 3v4" />
		</Svg>
	);
}

export function StarIcon(props: IconProps) {
	return (
		<Svg {...props}>
			<path d="M12 3.5l2.5 5.4 5.9.6-4.4 4 1.3 5.8L12 16.6l-5.3 2.7 1.3-5.8-4.4-4 5.9-.6L12 3.5Z" />
		</Svg>
	);
}

export function QuoteIcon(props: IconProps) {
	return (
		<Svg {...props}>
			<path d="M7 8c-2 0-3 1.6-3 4 0 2.2 1.4 3.5 3 3.5L5 19" />
			<path d="M17 8c-2 0-3 1.6-3 4 0 2.2 1.4 3.5 3 3.5L15 19" />
		</Svg>
	);
}
