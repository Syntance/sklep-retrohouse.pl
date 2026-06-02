import bundleAnalyzer from "@next/bundle-analyzer";
import type { NextConfig } from "next";

type RemotePattern = NonNullable<NonNullable<NextConfig["images"]>["remotePatterns"]>[number];

const MEDIA_CDN_HOSTNAME = "assets.sklep-retrohouse.pl";

function medusaImagePatterns(): RemotePattern[] {
	const patterns: RemotePattern[] = [
		{ protocol: "http", hostname: "localhost", port: "9000", pathname: "/static/**" },
		{ protocol: "http", hostname: "127.0.0.1", port: "9000", pathname: "/static/**" },
		// Cloudflare R2 — obrazy z Medusa po migracji storage (dev + prod bez wymogu ENV).
		{ protocol: "https", hostname: MEDIA_CDN_HOSTNAME, pathname: "/**" },
	];

	const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL;
	if (backendUrl) {
		try {
			const url = new URL(backendUrl);
			patterns.push({
				protocol: url.protocol.replace(":", "") as "http" | "https",
				hostname: url.hostname,
				...(url.port ? { port: url.port } : {}),
				pathname: "/static/**",
			});
		} catch {
			// ignore invalid env at build time
		}
	}

	// Trwały storage mediów (Cloudflare R2 / S3) — po migracji backendu z dysku Railway.
	// Patrz docs/runbook/railway-disaster-recovery.md.
	const cdnUrl = process.env.NEXT_PUBLIC_MEDIA_CDN_URL;
	if (cdnUrl) {
		try {
			const url = new URL(cdnUrl);
			if (url.hostname !== MEDIA_CDN_HOSTNAME) {
				patterns.push({
					protocol: url.protocol.replace(":", "") as "http" | "https",
					hostname: url.hostname,
					...(url.port ? { port: url.port } : {}),
					pathname: "/**",
				});
			}
		} catch {
			// ignore invalid env at build time
		}
	}

	return patterns;
}

const securityHeaders = [
	{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
	{ key: "X-Content-Type-Options", value: "nosniff" },
	{ key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
	{ key: "X-DNS-Prefetch-Control", value: "on" },
	{ key: "X-Frame-Options", value: "SAMEORIGIN" },
	{
		key: "Permissions-Policy",
		value: [
			"camera=()",
			"microphone=()",
			"geolocation=()",
			"interest-cohort=()",
			"payment=(self)",
			"fullscreen=(self)",
		].join(", "),
	},
	{ key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];

const nextConfig: NextConfig = {
	reactStrictMode: true,
	poweredByHeader: false,
	compress: true,
	productionBrowserSourceMaps: false,
	images: {
		formats: ["image/avif", "image/webp"],
		remotePatterns: [
			{ protocol: "https", hostname: "res.cloudinary.com" },
			{ protocol: "https", hostname: "cdn.sanity.io" },
			{ protocol: "https", hostname: "medusa-public-images.s3.eu-west-1.amazonaws.com" },
			...medusaImagePatterns(),
		],
	},
	experimental: {
		optimizePackageImports: [
			"lucide-react",
			"@react-three/drei",
			"@react-three/fiber",
			"motion",
			"gsap",
		],
	},
	async headers() {
		return [
			{
				source: "/:path*",
				headers: securityHeaders,
			},
			{
				source: "/(.*)\\.(woff2|woff|ttf|otf)",
				headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
			},
			{
				source: "/.well-known/security.txt",
				headers: [
					{ key: "Content-Type", value: "text/plain; charset=utf-8" },
					{ key: "Cache-Control", value: "public, max-age=86400" },
				],
			},
		];
	},
};

const withBundleAnalyzer = bundleAnalyzer({
	enabled: process.env.ANALYZE === "true",
});

export default withBundleAnalyzer(nextConfig);
