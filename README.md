# graphql-codegen-faker-fixtures

This repository contains a GraphQL Codegen plugin that generates fixture builders of your fragments based on your GraphQL schema and populates them with [faker](https://github.com/faker-js/faker).

## Installation

Run either of the following commands to add the package, based on your package manager of choice:

```sh
# pnpm
pnpm i -D graphql-codegen-faker-fixtures

# npm
npm i --save-dev graphql-codegen-faker-fixtures

# yarn
yarn add -D graphql-codegen-faker-fixtures
```

## Usage

### Config file

Both `codegen.yml` and `codegen.ts` config files are permitted. It is recommended to use the typescript format which includes a config interface.

```typescript
import type { CodegenConfig } from "graphql-codegen-faker-fixtures";

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
```

<details>
    <summary>Example in <code>yml</code> format</summary>

    ### Example
    ```yml
    schema: example/schema.graphql
    documents: example/queries.ts
    verbose: true
    generates:
      example/fixture_builders.ts:
        plugins:
          - dist/index.js
        config:
          typeImport: "@types"
          fakerjsSeed: 98765
          scalars:
            String:
              _default: faker.lorem.word()
              firstName: faker.person.firstName()
              lastName: faker.person.lastName()
              phone: faker.phone.number()
            Boolean:
              married: faker.helpers.arrayElement(['yes', 'no'])
            ID:
              id: faker.string.symbol()
              Person.id: faker.string.nanoid()
    hooks:
      afterOneFileWrite:
        - prettier --write
    ```

</details>

The example above and a copy in `yml` format can be found in the /examle directory and can be run with `pnpm example:ts` and `pnpm example:yml` respectively.

### API

The config object includes the following fields:

#### `typeImport` (`string`)

Import types generated from your fragments based on your GraphQL schema. These types provide typing of the fixture builder functions.

#### `fakerjsSeed` (`number`)

default value: `12345654321`

Number used to seed faker.
[Reference](https://fakerjs.dev/guide/usage.html#reproducible-results)

#### `buildersOnly` (`boolean`)

When true the plugin will only return the fixture builder functions without the normal addition of a disclaimer, utility functions (`repeat`, `deepmerge` & `random`), utilty type (`DeepPartial`), and faker seed setup.

#### `skipFields` (`string[]`)

Skip the given fields while generating the fixture builders. The notation is as follows:

```typescript
skipFields: ['PersonFragment.email'],
```

#### `skipFragments` (`string[]`)

Skip the given fragments while generating the fixture builders. The notation is as follows:

```typescript
skipFragments: ['person'],
```

#### `scalars` (`ScalarConfig`)

Override default faker methods for a given scalar type. The default methods and configured scalar are:

| Scalar    | Default faker method       |
| --------- | -------------------------- |
| `Int`     | `faker.number.int()`       |
| `Float`   | `faker.number.float()`     |
| `Boolean` | `faker.datatype.boolean()` |
| `ID`      | `faker.string.uuid()`      |
| `String`  | `faker.lorem.words()`      |

Overriding a faker methods:

```typescript
scalars: {
    String: {
        // Override the default method for the String scalar
        _default: "faker.lorem.word()"
        // Override a specific field name for the String scalar
        firstName: "faker.person.firstName()"
    },
    ID: {
        // Override a specific field name and type for the ID scalar
        ["Person.id"]: "faker.string.nanoid()",
    }
}
```

## Development

Assuming you have `pnpm` installed with `node@18`, run:

```sh
pnpm install
pnpm start
```

## Publishing

Publishing is done automatically via merging a changesets release pull request to main.
