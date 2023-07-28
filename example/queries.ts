import { gql } from "graphql-tag";

export const address = gql`
  fragment address on Address {
    id
    firstName
    lastName
    streetName
    streetNumber
    additionalStreetInfo
    additionalAddressInfo
    building
    city
    region
    postalCode
    country
    phone
  }
`;

export const GET_ADDRESS = gql`
  query getAddress {
    getAddress {
      ...address
    }
  }
  ${address}
`;
