import { plugin } from "../dist";
import { buildSchema } from "graphql/utilities";
import { parse } from "graphql";

const schema = /* GraphQL */ `
  type Person {
    id: ID!
    name: String
    age: Int
    address: String
  }

  type Animal {
    id: ID!
    name: String
    age: Int
    address: String
  }
`;

const document = /* GraphQL */ `
  fragment person on Person {
    id
    name
    age
    address
  }

  fragment animal on Animal {
    id
    name
    age
    address
  }
`;

describe("configuration", () => {
  it("should be able to override the default faker method for String scalar", () => {
    const response = plugin(
      buildSchema(schema),
      [{ document: parse(document) }],
      {
        buildersOnly: true,
        scalars: { String: { _default: "myCustomStringFakerMethod()" } },
      },
    );
    expect(response).toMatchSnapshot();

    expect(response).toContain("name: myCustomStringFakerMethod()");
    expect(response).toContain("address: myCustomStringFakerMethod()");
  });

  it("should be able to override faker methods for specific field for String scalar", () => {
    const response = plugin(
      buildSchema(schema),
      [{ document: parse(document) }],
      {
        buildersOnly: true,
        scalars: { String: { name: "myCustomNameFakerMethod()" } },
      },
    );
    expect(response).toMatchSnapshot();

    expect(response).toContain("name: myCustomNameFakerMethod()");
    expect(response).toContain("address: faker.lorem.words()");
  });

  it("should be able to override faker methods for specific field on specific object for String scalar", () => {
    const response = plugin(
      buildSchema(schema),
      [{ document: parse(document) }],
      {
        buildersOnly: true,
        scalars: { String: { ["Person.name"]: "myCustomNameFakerMethod()" } },
      },
    );
    expect(response).toMatchSnapshot();

    expect(response).toContain("name: myCustomNameFakerMethod()");
    expect(response).toContain("name: faker.lorem.words()");
  });

  it("should be able to override faker methods according to specific configurations", () => {
    const response = plugin(
      buildSchema(schema),
      [{ document: parse(document) }],
      {
        buildersOnly: true,
        scalars: {
          String: {
            _default: "myCustomDefaultStringFakerMethod()",
            name: "myCustomNameFakerMethod()",
            ["Person.name"]: "myCustomPersonNameFakerMethod()",
          },
          ID: {
            _default: "myCustomDefaultIdStringFakerMethod()",
          },
        },
      },
    );
    expect(response).toMatchSnapshot();

    expect(response).toContain("name: myCustomPersonNameFakerMethod()");
    expect(response).toContain("name: myCustomNameFakerMethod()");
    expect(response).toContain("address: myCustomDefaultStringFakerMethod()");
    expect(response).toContain("id: myCustomDefaultIdStringFakerMethod()");
  });

  it("should be able to override faker seed", () => {
    const response = plugin(
      buildSchema(schema),
      [{ document: parse(document) }],
      {
        fakerjsSeed: 56765,
      },
    );
    expect(response).toMatchSnapshot();

    expect(response).toContain("faker.seed(56765)");
  });

  it("should be able to set location of the type import", () => {
    const response = plugin(
      buildSchema(schema),
      [{ document: parse(document) }],
      {
        typeImport: "@types",
      },
    );
    expect(response).toMatchSnapshot();

    expect(response).toContain("import * as types from '@types';");
  });

  it("should be able to skip fields", () => {
    const response = plugin(
      buildSchema(schema),
      [{ document: parse(document) }],
      {
        skipFields: ["PersonFragment.name", "AnimalFragment.name"],
      },
    );
    expect(response).toMatchSnapshot();

    expect(response).not.toContain("name: ");
  });

  it("should be able to skip fragments", () => {
    const response = plugin(
      buildSchema(schema),
      [{ document: parse(document) }],
      {
        skipFragments: ["person"],
      },
    );
    expect(response).toMatchSnapshot();

    expect(response).not.toContain("export const fakePerson");
  });
});
