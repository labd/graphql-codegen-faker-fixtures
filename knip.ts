import type { KnipConfig } from "knip";

const config: KnipConfig = {
	entry: ["src/index.ts", "example/codegen.ts", "example/codegen.yml"],
	project: ["src/**/*.ts", "tests/**/*.ts", "example/**/*.ts"],
	ignoreDependencies: [],
	tags: ["-lintignore"],
};

export default config;
