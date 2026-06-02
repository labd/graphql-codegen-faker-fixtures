---
"graphql-codegen-faker-fixtures": minor
---

Maintenance pass. Breaking changes:

- Requires Node.js >= 24 (was >= 18)
- Requires `@graphql-codegen/cli` and `@graphql-codegen/plugin-helpers` >= 7
  (older versions had unresolved transitive security advisories)
- Bumps `@faker-js/faker` to v10 (was v8)

No behavioral changes to generated fixture builders.
