export const osintTypeDefs = `#graphql
  type OsintLog {
    id: ID!
    id_organizacion: ID!
    id_usuario_objetivo: ID
    fuente: String!
    tipo_hallazgo: String!
    detalle_json: JSON!
    creado_en: String!
  }

  # Es necesario definir un scalar JSON para que GraphQL lo entienda
  scalar JSON

  type Query {
    osintLogs(organizacionId: ID!): [OsintLog!]!
  }

  type Mutation {
    osintScan(dominio: String!, organizacionId: ID!): [OsintLog!]!
  }
`;