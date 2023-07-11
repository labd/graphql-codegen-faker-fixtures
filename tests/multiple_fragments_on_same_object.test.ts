import { plugin } from '../plugin'
import { buildSchema } from 'graphql/utilities'
import { parse } from 'graphql'

const schema = /* GraphQL */ `
  type Person {
    name: String
    age: String
    gender: String
  }

  type HouseHold {
    foo: String
    person: Person
  }
`

const document = /* GraphQL */ `
  fragment HouseHoldA on HouseHold {
    foo
    person {
      name
      age
    }
  }

  fragment HouseHoldB on HouseHold {
    foo
    person {
      age
      gender
    }
  }
`

describe('multi fragments on same object', () => {
  it('it be able to deal with multiple fragments on same object', () => {
    const response = plugin(
      buildSchema(schema),
      [{ document: parse(document) }],
      { buildersOnly: true },
    )
    expect(response).toMatchSnapshot()
  })
})
