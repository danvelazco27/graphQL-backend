export const typeDefs = `#graphql
  type User {
    id: ID!
    email: String!
    createdAt: String!
  }

  type Contact {
    id: ID!
    name: String!
    email: String!
    phone: String!
    createdAt: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Query {
    me: User
    contacts: [Contact!]!
    contact(id: ID!): Contact
  }

  type Mutation {
    register(email: String!, password: String!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
    createContact(name: String!, email: String!, phone: String!): Contact!
    updateContact(id: ID!, name: String, email: String, phone: String): Contact!
    deleteContact(id: ID!): Boolean!
  }
`;
