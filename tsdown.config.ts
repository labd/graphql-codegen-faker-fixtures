import { defineConfig } from "tsdown";

export default defineConfig({
	entry: ["src/index.ts"],
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
