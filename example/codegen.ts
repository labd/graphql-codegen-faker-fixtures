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
          String: {
            firstName: {
              default: "faker.internet.email()",
              field: "faker.person.firstName()",
              object: {
                Person: "faker.animal.type()",
              },
            },
            lastName: "faker.person.lastName()",
            phone: "faker.phone.number()",
          },
          Boolean: { married: "faker.helpers.arrayElement(['yes', 'no'])" },
        },
      },
    },
  },
};
export default config;
