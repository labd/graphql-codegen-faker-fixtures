import { plugin } from "../plugin";
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
    name
    age
  }
`;

describe("basic", () => {
  it("it should create a basic builder for the person fragment", () => {
    const response = plugin(
      buildSchema(schema),
      [{ document: parse(document) }],
      { buildersOnly: true },
    );
    expect(response).toMatchSnapshot();
  });
});
