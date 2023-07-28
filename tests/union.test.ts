import { plugin } from "../dist";
import { buildSchema } from "graphql/utilities";
import { parse } from "graphql";

const schema = /* GraphQL */ `
  type Cat {
    name: String
    color: String
  }

  type Dog {
    name: String
    isGoodBoy: Boolean
  }

  union Pet = Cat | Dog
`;

const document = /* GraphQL */ `
  fragment cat on Cat {
    name
    color
  }

  fragment dog on Dog {
    name
    isGoodBoy
  }

  fragment pet on Pet {
    ...cat
    ...dog
  }
`;

describe("union", () => {
  it("should create a builder for a fragment that uses a union type", () => {
    const response = plugin(
      buildSchema(schema),
      [{ document: parse(document) }],
      { buildersOnly: true },
    );
    expect(response).toMatchSnapshot();

    expect(response).toContain(
      `faker.helpers.arrayElement([
          fakeCat(),fakeDog()
        ])`,
    );
  });
});
