import type { KnipConfig } from "knip";

const config: KnipConfig = {
	entry: ["example/queries.ts"],
	project: ["src/**/*.ts", "tests/**/*.ts", "example/**/*.ts"],
	ignoreDependencies: [
		// Imported by the generated code (consumer's runtime), not by this plugin.
		"@faker-js/faker",
		"deepmerge-ts",
		// False positive: knip mis-parses `plugins: ["dist/index.js"]` in
		// example/codegen.{ts,yml}.
		"@graphql-codegen/dist",
	],
	// ScalarsConfig is part of the public API surface; consumers import it to
	// type their config.
	ignoreExportsUsedInFile: true,
	tags: ["-lintignore"],
};

export default config;
