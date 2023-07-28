import { plugin } from "../plugin";
import { buildSchema } from "graphql/utilities";
import { parse } from "graphql";

const schema = /* GraphQL */ `
  enum Gender {
    MALE
    FEMALE
  }

  type Person {
    name: String
    age: String
    gender: Gender
  }
`;

const document = /* GraphQL */ `
  fragment person on Person {
    name
    age
    gender
  }
`;

describe("enums", () => {
  it("it should create a builder for a fragment that uses an enum field", () => {
    const response = plugin(
      buildSchema(schema),
      [{ document: parse(document) }],
      { buildersOnly: true },
    );
    expect(response).toMatchSnapshot();
    expect(response).toContain(
      'gender: faker.helpers.arrayElement(["MALE", "FEMALE"])',
    );
  });
});
