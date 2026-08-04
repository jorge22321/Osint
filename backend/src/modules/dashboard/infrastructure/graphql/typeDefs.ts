//backend/src/modules/dashboard/infrastructure/graphql/typeDefs.ts
export const dashboardTypeDefs = `#graphql
  type DepartamentoRiesgo {
    name: String!
    rate: Float!
    color: String!
  }

  type OsintLogItem {
    id: ID!
    hora: String!
    fuente: String!
    tipo_hallazgo: String!
    detalle: String!
    estadoBadging: String!
  }

  type DashboardMetrics {
    totalUsuarios: Int!
    tasaClics: Float!
    tasaReportes: Float!
    nivelRiesgoPromedio: Float!
    falloPorDepartamento: [DepartamentoRiesgo!]!
    logsOsintRecientes: [OsintLogItem!]!
  }

  extend type Query {
    obtenerDashboardMetrics(organizacionId: ID!): DashboardMetrics!
  }
`;