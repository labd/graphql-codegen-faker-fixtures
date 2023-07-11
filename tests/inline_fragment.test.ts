import { plugin } from '../plugin'
import { buildSchema } from 'graphql/utilities'
import { parse } from 'graphql'

const schema = /* GraphQL */ `
  type Person {
    name: String
    age: Int
  }

  type Cat {
    name: String
    color: String
  }

  type Dog {
    name: String
    isGoodBoy: Boolean
  }

  type HouseHold {
    person: Person
    pet: Pet
  }

  union Pet = Cat | Dog
`

const document = /* GraphQL */ `
  fragment houseHold on HouseHold {
    person {
      name
      age
    }
    pet {
      # Pet has a 'oneOf' on Cat or Dog. Meaning it could either be a Cat or a Dog
      ... on Cat {
        name
        color
      }
      ... on Dog {
        name
        isGoodBoy
      }
    }
  }
`

describe('inline_fragment', () => {
  it('it should create a builder for a fragment that uses inline fragments', () => {
    const response = plugin(
      buildSchema(schema),
      [{ document: parse(document) }],
      { buildersOnly: true },
    )
    expect(response).toMatchSnapshot()
  })
})
