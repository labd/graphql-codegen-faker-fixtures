import { plugin } from "../dist";
import { buildSchema } from "graphql/utilities";
import { parse } from "graphql";

const schema = /* GraphQL */ `
  scalar Image

  type Address {
    streetName: String
    streetNumber: Int
    zipCode: String
    images: [Image!]
  }

  type Person {
    id: ID!
    name: String
    age: Int
    address: Address
  }

  type Animal {
    id: ID!
    name: String
    age: Int
    address: Address
  }
`;

const document = /* GraphQL */ `
  fragment person on Person {
    id
    name
    age
    address {
      streetName
      zipCode
    }
  }

  fragment animal on Animal {
    id
    name
    age
    address {
      streetNumber
      images
    }
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
    expect(response).toContain("streetName: myCustomStringFakerMethod()");
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
    expect(response).toContain("streetName: faker.lorem.words()");
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

  it("should be able to override faker methods for custom scalars", () => {
    const response = plugin(
      buildSchema(schema),
      [{ document: parse(document) }],
      {
        buildersOnly: true,
        scalars: { Image: { _default: "myCustomImageScalarFakerMethod()" } },
      },
    );
    expect(response).toMatchSnapshot();

    expect(response).toContain(
      "images: repeat(random(1 , 5), () => (myCustomImageScalarFakerMethod()))",
    );
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
            ["Address.zipCode"]: "myCustomAddressZipCodeFakerMethod()",
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
    expect(response).toContain(
      "streetName: myCustomDefaultStringFakerMethod()",
    );
    expect(response).toContain("zipCode: myCustomAddressZipCodeFakerMethod()");
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
