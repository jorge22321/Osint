// src/modules/iam/infrastructure/graphql/typeDefs.ts

export const iamTypeDefs = `#graphql
  type Admin {
    id: ID!
    id_organizacion: ID!
    nombre: String!
    email: String!
    rol: String!
    dominio: String!
  }

  type AuthPayload {
    token: String!
    admin: Admin!
  }

  type Query {
    me: Admin
  }

  type Mutation {
    loginAdmin(email: String!, contrasena: String!): AuthPayload!
  }
`;