import { parse } from "graphql";
import { buildSchema } from "graphql/utilities";

import { plugin } from "../plugin";

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
  it("it should create a builder using aliased fields", () => {
    const response = plugin(
      buildSchema(schema),
      [{ document: parse(document) }],
      { buildersOnly: true },
    );
    expect(response).toMatchSnapshot();
    expect(response).toContain(
      'faker.commerce.productAdjective() + " " + faker.commerce.product(),',
    );
  });
});
