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
  fragment cat on Cat {
    name
    color
  }

  fragment dog on Dog {
    name
    isGoodBoy
  }

  fragment houseHold on HouseHold {
    person {
      name
      age
    }
    pet {
      ...cat
      ...dog
    }
  }
`

describe('fragment_spread', () => {
  it('it should create a builder for a fragment that uses fragment spreads', () => {
    const response = plugin(
      buildSchema(schema),
      [{ document: parse(document) }],
      { buildersOnly: true },
    )
    expect(response).toMatchSnapshot()
  })
})
