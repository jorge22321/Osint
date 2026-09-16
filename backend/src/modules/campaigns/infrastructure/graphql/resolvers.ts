// backend/src/modules/campaigns/infrastructure/graphql/resolvers.ts

import { SupabaseCampaignRepository } from '../persistence/SupabaseCampaignRepository';
import { SupabaseOsintRepository } from '../../../osint/infrastructure/persistence/SupabaseOsintRepository';
import { CrearCampaignUseCase } from '../../application/useCases/CrearCampaignUseCase';
import { ListarCampaignsUseCase } from '../../application/useCases/ListarCampaignsUseCase';
import { ObtenerCampaignUseCase } from '../../application/useCases/ObtenerCampaignUseCase';
import { ActualizarCampaignUseCase } from '../../application/useCases/ActualizarCampaignUseCase';
import { EliminarCampaignUseCase } from '../../application/useCases/EliminarCampaignUseCase';
import { GenerarContenidoIaUseCase } from '../../application/useCases/GenerarContenidoIaUseCase';
import { MistralAdapter } from '../providers/MistralAdapter';
import { SupabaseEnvioRepository } from '../persistence/SupabaseEnvioRepository';
import { CrearEnvioUseCase } from '../../application/useCases/CrearEnvioUseCase';
import { NodemailerAdapter } from '../providers/NodemailerAdapter';
import { TwilioSmsAdapter } from '../providers/TwilioSmsAdapter';
import { GraphqlContext, requireAdmin, requireDb, requireOrganization } from '../../../../shared/infrastructure/graphql/authContext';
import { SupabaseUsuarioObjetivoRepository } from '../../../targets/infrastructure/persistence/SupabaseUsuarioObjetivoRepository';

const aiProvider = new MistralAdapter();

export const campaignResolvers = {
  Query: {
    campaigns: async (_: any, { organizacionId }: any, context: GraphqlContext) => {
      const admin = requireOrganization(context, organizacionId);
      const repo = new SupabaseCampaignRepository(requireDb(context));
      const useCase = new ListarCampaignsUseCase(repo);
      return await useCase.execute(admin.id_organizacion);
    },
    campaign: async (_: any, { id }: any, context: GraphqlContext) => {
      const admin = requireAdmin(context);
      const repo = new SupabaseCampaignRepository(requireDb(context));
      const useCase = new ObtenerCampaignUseCase(repo);
      const campaign = await useCase.execute(id);
      if (campaign && campaign.id_organizacion !== admin.id_organizacion) throw new Error('No tienes acceso a esta campaña.');
      return campaign;
    },
  },
  Mutation: {
    crearCampaign: async (_: any, { input, organizacionId }: any, context: GraphqlContext) => {
      const admin = requireOrganization(context, organizacionId);
      const repo = new SupabaseCampaignRepository(requireDb(context));
      if (!input.creado_por) {
        throw new Error('El campo creado_por es obligatorio en el input.');
      }
      const useCase = new CrearCampaignUseCase(repo);
      return await useCase.execute({
        ...input,
        id_organizacion: admin.id_organizacion,
        creado_por: admin.id,
      });
    },
    actualizarCampaign: async (_: any, { id, input }: any, context: GraphqlContext) => {
      const admin = requireAdmin(context);
      const repo = new SupabaseCampaignRepository(requireDb(context));
      const campaign = await repo.buscarPorId(id);
      if (!campaign || campaign.id_organizacion !== admin.id_organizacion) throw new Error('No tienes acceso a esta campaña.');
      const useCase = new ActualizarCampaignUseCase(repo);
      return await useCase.execute(id, { ...input, creado_por: admin.id });
    },
    eliminarCampaign: async (_: any, { id }: any, context: GraphqlContext) => {
      const admin = requireAdmin(context);
      const repo = new SupabaseCampaignRepository(requireDb(context));
      const campaign = await repo.buscarPorId(id);
      if (!campaign || campaign.id_organizacion !== admin.id_organizacion) throw new Error('No tienes acceso a esta campaña.');
      const useCase = new EliminarCampaignUseCase(repo);
      await useCase.execute(id);
      return true;
    },

    // ✅ CORREGIDO: Pasamos todos los parámetros como un único objeto al caso de uso
    generarContenidoCampaign: async (_: any, args: {
      osintLogId: string;
      departamento: string;
      tipoSimulacion: string;
      nombreObjetivo?: string;
      cargoObjetivo?: string;
    }, context: GraphqlContext) => {
      const admin = requireAdmin(context);
      const repoOsint = new SupabaseOsintRepository(requireDb(context));
      const generarContenidoUseCase = new GenerarContenidoIaUseCase(aiProvider, repoOsint);
      const osintLog = await repoOsint.obtenerLogPorId(args.osintLogId);
      if (!osintLog || osintLog.id_organizacion !== admin.id_organizacion) throw new Error('No tienes acceso a este registro OSINT.');
      return await generarContenidoUseCase.execute(args);
    },

    crearEnvio: async (_: any, { input }: { input: any }, context: GraphqlContext) => {
      const admin = requireAdmin(context);
      const db = requireDb(context);
      const repo = new SupabaseCampaignRepository(db);
      const targetRepo = new SupabaseUsuarioObjetivoRepository(db);
      const [campaign, target] = await Promise.all([
        repo.buscarPorId(input.id_campana),
        targetRepo.buscarPorId(input.id_usuario_objetivo),
      ]);
      if (!campaign || campaign.id_organizacion !== admin.id_organizacion) throw new Error('No tienes acceso a esta campaña.');
      if (!target || target.id_organizacion !== admin.id_organizacion) throw new Error('No tienes acceso a este empleado.');
      // Extraemos los datos que son para el UseCase pero NO van a la BD
      const { vector, contacto_destino, ...envioDataBD } = input;

      const repoEnvio = new SupabaseEnvioRepository(db);
      const emailProvider = new NodemailerAdapter();
      const smsProvider = new TwilioSmsAdapter();
      
      const useCase = new CrearEnvioUseCase(repoEnvio, emailProvider, smsProvider, repo);
      
      return await useCase.execute(envioDataBD, vector, contacto_destino);
    },
  },
};
