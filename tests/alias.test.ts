import { parse } from "graphql";
import { buildSchema } from "graphql/utilities";

import { plugin } from "../dist/index";

const schema = /* GraphQL */ `
  type Person {
    name: String
    age: String
    address: String
  }
`;

const document = /* GraphQL */ `
  fragment person on Person {
    aliasedName: name
    age
  }
`;

describe("alias", () => {
  it("should create a builder using aliased fields", () => {
    const response = plugin(
      buildSchema(schema),
      [{ document: parse(document) }],
      { buildersOnly: true },
    );
    expect(response).toMatchSnapshot();
    expect(response).toContain(
      "aliasedName: faker.lorem.words(),age: faker.lorem.words()",
    );
  });
});
