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
import { trainingRoutes } from './modules/education/infrastructure/http/trainingRoutes';
import { SupabaseEnvioRepository } from './modules/campaigns/infrastructure/persistence/SupabaseEnvioRepository';
import { SupabaseCampaignRepository } from './modules/campaigns/infrastructure/persistence/SupabaseCampaignRepository';
import { NodemailerAdapter } from './modules/campaigns/infrastructure/providers/NodemailerAdapter';
import { TwilioSmsAdapter } from './modules/campaigns/infrastructure/providers/TwilioSmsAdapter';
import { CrearEnvioUseCase } from './modules/campaigns/application/useCases/CrearEnvioUseCase';
import { buildGraphqlContext } from './shared/infrastructure/graphql/authContext';
async function startServer() {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(trainingRoutes);

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
 app.use('/graphql', expressMiddleware(server, {
   context: async ({ req }) => buildGraphqlContext(req),
 }) as any);

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

  const scheduledDispatch = new CrearEnvioUseCase(
    new SupabaseEnvioRepository(),
    new NodemailerAdapter(),
    new TwilioSmsAdapter(),
    new SupabaseCampaignRepository()
  );
  let schedulerRunning = false;
  const processScheduledCampaigns = async () => {
    if (schedulerRunning) return;
    schedulerRunning = true;
    try {
      const processed = await scheduledDispatch.procesarPendientes();
      if (processed > 0) console.log(`[Campañas]: ${processed} envío(s) programado(s) procesado(s).`);
    } catch (error) {
      console.error('[Campañas programadas]', error);
    } finally {
      schedulerRunning = false;
    }
  };
  void processScheduledCampaigns();
  setInterval(processScheduledCampaigns, 30_000);
}

startServer();
