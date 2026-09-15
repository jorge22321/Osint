// backend/src/modules/campaigns/infrastructure/graphql/typeDefs.ts
export const campaignTypeDefs = `#graphql
  type Campaign {
    id: ID!
    id_organizacion: ID!
    nombre: String!
    tipo: String!
    estado: String!
    fecha_programada: String
    creado_por: ID!
    creado_en: String!
  }

  input CrearCampaignInput {
    nombre: String!
    tipo: String!
    estado: String
    fecha_programada: String
    creado_por: ID! 
  }

  input CrearEnvioInput {
    id_campana: ID!
    id_usuario_objetivo: ID!
    asunto_generado: String!
    contenido_generado: String!
    tracking_code: String!
    vector: String!             
    contacto_destino: String!
  }

  type GenerarContenidoResponse {
    asunto: String!
    contenido: String!
  }

  type Envio {
    id: ID!
    id_campana: ID!
    id_usuario_objetivo: ID!
    tracking_code: String!
    estado: String!
    asunto_generado: String!
    contenido_generado: String!
    fecha_envio: String
    fecha_click: String
    fecha_reporte: String
  }

  type Query {
    campaigns(organizacionId: ID!): [Campaign!]!
    campaign(id: ID!): Campaign
  }

  type Mutation {
    crearCampaign(input: CrearCampaignInput!, organizacionId: ID!): Campaign!
    actualizarCampaign(id: ID!, input: CrearCampaignInput!): Campaign!
    eliminarCampaign(id: ID!): Boolean!
    
    generarContenidoCampaign(
      osintLogId: ID!
      departamento: String!
      tipoSimulacion: String!
      nombreObjetivo: String
      cargoObjetivo: String
    ): GenerarContenidoResponse!

    crearEnvio(input: CrearEnvioInput!): Envio! 
  }
`;