// src/server.ts
import express from 'express';
import cors from 'cors';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { env } from './config/env';
import { supabase } from './shared/infrastructure/database/supabase';
import { osintTypeDefs } from './modules/osint/infrastructure/graphql/typeDefs';
import { osintResolvers } from './modules/osint/infrastructure/graphql/resolvers';
// Importamos el módulo de autenticación (GraphQL)
import { iamTypeDefs } from './modules/iam/infrastructure/graphql/typeDefs';
import { iamResolvers } from './modules/iam/infrastructure/graphql/resolvers';
import { targetsTypeDefs } from './modules/targets/infrastructure/graphql/typeDefs';
import { targetsResolvers } from './modules/targets/infrastructure/graphql/resolvers';
import { campaignTypeDefs } from './modules/campaigns/infrastructure/graphql/typeDefs';
import { campaignResolvers } from './modules/campaigns/infrastructure/graphql/resolvers';
import { dashboardTypeDefs } from './modules/dashboard/infrastructure/graphql/typeDefs';
import { dashboardResolvers } from './modules/dashboard/infrastructure/graphql/resolvers';
async function startServer() {
  const app = express();

  app.use(cors());
  app.use(express.json());

    app.use((req, res, next) => {
    if (!req.body) {
      req.body = {}; // Asignamos un objeto vacío para Apollo Server
    }
    next();
  });

  // 1. Inicializar Apollo Server con nuestro esquema de Login
  const server = new ApolloServer({
  typeDefs: [iamTypeDefs, osintTypeDefs, targetsTypeDefs, campaignTypeDefs,dashboardTypeDefs],
  resolvers: [iamResolvers, osintResolvers, targetsResolvers, campaignResolvers, dashboardResolvers],
});

  // Es obligatorio arrancar el servidor de Apollo antes de pasarlo a Express
  await server.start();

  // 2. Conectar GraphQL al middleware de Express en la ruta /graphql
 app.use('/graphql', expressMiddleware(server) as any);

  app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Servidor Hexagonal listo 🚀' });
  });

  // Verificar conexión rápida a Supabase
  try {
    const { error } = await supabase.from('organizaciones').select('id').limit(1);
    if (error) throw error;
    console.log(' [Supabase]: Conexión de datos verificada con éxito.');
  } catch (err: any) {
    console.error(' [Supabase Error]:', err.message);
  }

  app.listen(env.PORT, () => {
    console.log(`  Backend ejecutándose en http://localhost:${env.PORT}`);
    console.log(` Endpoint GraphQL listo en http://localhost:${env.PORT}/graphql`);
  });
}

startServer();