export const settingsTypeDefs = `#graphql
  type OrganizationSettings {
    nombre_mostrado: String!
    zona_horaria: String!
    hora_inicio: String!
    hora_fin: String!
    limite_destinatarios: Int!
    nota_minima: Int!
    permitir_borradores_ia: Boolean!
  }
  input OrganizationSettingsInput {
    nombre_mostrado: String!
    zona_horaria: String!
    hora_inicio: String!
    hora_fin: String!
    limite_destinatarios: Int!
    nota_minima: Int!
    permitir_borradores_ia: Boolean!
  }
  type ProviderCheck { provider: String!, state: String!, detail: String! }
  type AdminSummary { id: ID!, nombre: String!, email: String!, rol: String! }
  type SettingsAudit { id: ID!, accion: String!, detalle: String!, admin_nombre: String!, creado_en: String! }
  type SettingsOverview {
    settings: OrganizationSettings!
    publicUrl: String!
    publicUrlLocal: Boolean!
    emailConfigured: Boolean!
    smsConfigured: Boolean!
    backendAutomationReady: Boolean!
    admins: [AdminSummary!]!
    audit: [SettingsAudit!]!
  }
  type SendTestResult { accepted: Boolean!, state: String!, detail: String! }

  extend type Query { settingsOverview: SettingsOverview! }
  extend type Mutation {
    saveOrganizationSettings(input: OrganizationSettingsInput!): OrganizationSettings!
    checkDeliveryProvider(provider: String!): ProviderCheck!
    sendAuthorizedTest(provider: String!, targetId: ID): SendTestResult!
  }
`;
