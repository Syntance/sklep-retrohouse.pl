import { defineCliConfig } from "sanity/cli";

/** Używane przez `pnpm exec sanity …` (projekt „Sklep Retro House”). */
export default defineCliConfig({
	api: {
		projectId: "hg2rnmra",
		dataset: "production",
	},
	deployment: {
		appId: "qz1wn6guvd662ysclh87lmsu",
	},
});
