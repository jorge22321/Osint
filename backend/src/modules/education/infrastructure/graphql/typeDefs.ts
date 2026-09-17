export const educationTypeDefs = `#graphql
  type TrainingTemplate {
    id: ID!
    titulo: String!
    canal: String!
    contenidoJson: String!
    origen: String!
    estado: String!
    version: Int!
    creado_en: String!
    actualizado_en: String!
  }
  input TrainingTemplateInput {
    id: ID
    titulo: String!
    canal: String!
    contenidoJson: String!
    estado: String!
    origen: String!
  }
  extend type Query {
    trainingTemplates(canal: String): [TrainingTemplate!]!
    defaultTrainingContent(canal: String!): String!
  }
  extend type Mutation {
    saveTrainingTemplate(input: TrainingTemplateInput!): TrainingTemplate!
    generateTrainingDraft(canal: String!, tema: String!): String!
  }
`;
