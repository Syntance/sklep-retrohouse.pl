import { resolve } from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
	resolve: {
		alias: {
			"@": resolve(__dirname, "./src"),
		},
	},
	test: {
		environment: "jsdom",
		globals: true,
		setupFiles: ["./tests/setup.ts"],
		include: ["src/**/*.{test,spec}.{ts,tsx}", "tests/**/*.{test,spec}.{ts,tsx}"],
		exclude: ["node_modules", ".next", "dist", "tests/e2e/**"],
		coverage: {
			provider: "v8",
			reporter: ["text", "html"],
			exclude: [
				"**/*.config.*",
				"**/.next/**",
				"**/dist/**",
				"src/components/ui/**",
				"src/env.ts",
			],
		},
	},
});
