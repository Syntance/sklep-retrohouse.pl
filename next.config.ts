import bundleAnalyzer from "@next/bundle-analyzer";
import type { NextConfig } from "next";

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
