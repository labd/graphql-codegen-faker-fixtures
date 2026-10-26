import { defineConfig } from "tsdown";

export default defineConfig({
	entry: ["src/index.ts"],
	publint: true,
	failOnWarn: true,
	// TypeScript 7 is used on purpose; its "experimental API" notice is not actionable.
	// The IIFE build has never had a global name or globals (same as with tsup);
	// silence those rolldown notices so failOnWarn only trips on new warnings.
	suppressWarnings: [
		"TypeScript 7.0 does not yet have a stable API",
		"you may not be able to access the exports of an IIFE bundle",
		"output.globals",
	],
	clean: true,
	dts: true,
	sourcemap: true,
	format: ["cjs", "esm", "iife"],
	outDir: "dist",
	// Keep tsup-compatible file names: index.js (cjs), index.mjs (esm),
	// index.global.js (iife), index.d.ts / index.d.mts
	outExtensions: ({ format }) => {
		if (format === "es") return { js: ".mjs", dts: ".d.mts" };
		return { js: ".js", dts: ".d.ts" };
	},
	// tsdown names IIFE output `[name].iife.js`; keep tsup's `[name].global.js`
	outputOptions: (options, format) =>
		format === "iife"
			? { ...options, entryFileNames: "[name].global.js" }
			: options,
});
