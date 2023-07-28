import { plugin } from "../dist";
import { buildSchema } from "graphql/utilities";
import { parse } from "graphql";

const schema = /* GraphQL */ `
  type Person {
    name: String
    age: String
    address: String
  }
`;

const document = /* GraphQL */ `
  fragment person on Person {
    __typename
    name
    age
  }
`;

describe("typename", () => {
  it("should create a basic builder which includes a hardcoded __typename", () => {
    const response = plugin(
      buildSchema(schema),
      [{ document: parse(document) }],
      { buildersOnly: true },
    );
    expect(response).toMatchSnapshot();
    expect(response).toContain("__typename: 'Person'");
  });
});
