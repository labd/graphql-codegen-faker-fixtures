import { plugin } from "../plugin";
import { buildSchema } from "graphql/utilities";
import { parse } from "graphql";

const schema = /* GraphQL */ `
  type Address {
    street: String
    city: String
  }

  type Person {
    name: String
    age: String
    address: Address
  }
`;

const document = /* GraphQL */ `
  fragment person on Person {
    name
    age
    address {
      street
      city
    }
  }
`;

describe("nested", () => {
  it("it should create a builder for a fragment that uses nested fields", () => {
    const response = plugin(
      buildSchema(schema),
      [{ document: parse(document) }],
      { buildersOnly: true },
    );
    expect(response).toMatchSnapshot();
  });
});
