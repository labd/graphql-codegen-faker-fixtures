import { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: "example/schema.graphql",
  documents: "example/queries.ts",
  generates: {
    "example/fixture_builders.ts": {
      plugins: ["dist/index.js"],
      config: {
        typeImport: "@types",
      },
    },
  },
};
export default config;
