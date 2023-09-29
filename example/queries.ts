import { gql } from "graphql-tag";

export const person = gql`
  fragment person on Person {
    id
    phone
    mobile
    email
    secondaryEmail
    fax
    title
    salutation
    firstName
    lastName
    married
  }
`;

export const GET_PERSON = gql`
  query getPerson {
    getPerson {
      ...person
    }
  }
  ${person}
`;

export const address = gql`
  fragment address on Address {
    id
    streetName
    streetNumber
    additionalStreetInfo
    postalCode
    city
    region
    state
    country
    company
    department
    building
    apartment
    pOBox
    additionalAddressInfo
    externalId
    key
    person {
      id
      email
    }
  }
  ${person}
`;

export const GET_ADDRESS = gql`
  query getAddress {
    getAddress {
      ...address
    }
  }
  ${address}
`;
