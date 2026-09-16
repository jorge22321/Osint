//backend/src/modules/targets/infrastructure/graphql/typeDefs.ts
export const targetsTypeDefs = `#graphql
  type UsuarioObjetivo {
    id: ID!
    id_organizacion: ID!
    nombre: String!
    email: String!
    telefono: String
    departamento: String
    cargo: String
    risk_score: Float!
    estado: String!
    creado_en: String!
  }

  input CrearUsuarioInput {
    nombre: String!
    email: String!
    telefono: String
    departamento: String
    cargo: String
    risk_score: Float
    estado: String
  }

  type Query {
    usuarios(organizacionId: ID!): [UsuarioObjetivo!]!
    usuario(id: ID!): UsuarioObjetivo
  }

  type Mutation {
    crearUsuario(input: CrearUsuarioInput!, organizacionId: ID!): UsuarioObjetivo!
    actualizarUsuario(id: ID!, input: CrearUsuarioInput!): UsuarioObjetivo!
    eliminarUsuario(id: ID!): Boolean!
  }
`;
