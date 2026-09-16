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

  type OsintLogsPage {
    items: [OsintLog!]!
    total: Int!
    hasMore: Boolean!
  }

  type OsintProviderStatus {
    nombre: String!
    estado: String!
    hallazgos: Int!
    mensaje: String
  }

  type OsintScanResult {
    logs: [OsintLog!]!
    proveedores: [OsintProviderStatus!]!
    hallazgosEncontrados: Int!
    nuevosGuardados: Int!
    duplicadosOmitidos: Int!
  }

  # Es necesario definir un scalar JSON para que GraphQL lo entienda
  scalar JSON

  type Query {
    osintLogs(organizacionId: ID!): [OsintLog!]!
    osintLogsPage(organizacionId: ID!, limit: Int = 50, offset: Int = 0): OsintLogsPage!
  }

  type Mutation {
    osintScan(dominio: String!, organizacionId: ID!): [OsintLog!]!
    osintScanDetailed(dominio: String!, organizacionId: ID!): OsintScanResult!
  }
`;
