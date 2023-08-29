import type { CodegenConfig } from "../dist/index.d.mts";

const config: CodegenConfig = {
  verbose: true,
  schema: "example/schema.graphql",
  documents: "example/queries.ts",
  generates: {
    "example/fixture_builders.ts": {
      plugins: ["dist/index.js"],
      config: {
        typeImport: "@types",
        fakerjsSeed: 98765,
        scalars: {
          String: [
            { lastName: "faker.person.lastName()" },
            { firstName: "faker.person.firstName()" },
            { phone: "faker.phone.number()" },
          ],
          Boolean: [{ married: "faker.helpers.arrayElement(['yes', 'no'])" }],
        },
      },
    },
  },
};
export default config;
