import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";

import { schemaTypes } from "./sanity/schemaTypes";

/**
 * `sanity deploy` buduje bundle bez zmiennych Next.js — wtedy env jest puste i potrzebny
 * jest stały projectId (ten sam co w `sanity.cli.ts`).
 */
const SANITY_PROJECT_ID_DEFAULT = "hg2rnmra";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID?.trim() || SANITY_PROJECT_ID_DEFAULT;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET?.trim() || "production";

export default defineConfig({
	name: "retrohouse-storefront",
	title: "RetroHouse — treść",
	basePath: "/studio",
	projectId,
	dataset,
	plugins: [structureTool()],
	schema: {
		types: schemaTypes,
	},
});
