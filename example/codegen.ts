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
          Email: {
            _default: "faker.internet.email()",
            secondaryEmail: "faker.internet.exampleEmail()",
          },
          String: {
            _default: "faker.lorem.word()",
            firstName: "faker.person.firstName()",
            lastName: "faker.person.lastName()",
            phone: "faker.phone.number()",
          },
          Boolean: { married: "faker.helpers.arrayElement(['yes', 'no'])" },
          ID: {
            id: "faker.string.symbol()",
            ["Person.id"]: "faker.string.nanoid()",
          },
        },
      },
    },
  },
  hooks: {
    afterOneFileWrite: ["prettier --write"],
  },
};
export default config;
