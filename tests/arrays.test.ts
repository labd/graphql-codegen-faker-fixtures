import { plugin } from '../plugin'
import { buildSchema } from 'graphql/utilities'
import { parse } from 'graphql'

const schema = /* GraphQL */ `
  type Person {
    name: String
    age: String
    children: [Person]
  }
`

const document = /* GraphQL */ `
  fragment person on Person {
    name
    age
    children {
      name
    }
  }
`

describe('arrays', () => {
  it('it should create a builder for the person fragment that creates an array for its children field', () => {
    const response = plugin(
      buildSchema(schema),
      [{ document: parse(document) }],
      { buildersOnly: true },
    )
    expect(response).toMatchSnapshot()
  })
})
