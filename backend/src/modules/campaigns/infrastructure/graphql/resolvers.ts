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

const repo = new SupabaseCampaignRepository();
const repoOsint = new SupabaseOsintRepository();
const aiProvider = new MistralAdapter();
const generarContenidoUseCase = new GenerarContenidoIaUseCase(aiProvider, repoOsint); 

export const campaignResolvers = {
  Query: {
    campaigns: async (_: any, { organizacionId }: any) => {
      const useCase = new ListarCampaignsUseCase(repo);
      return await useCase.execute(organizacionId);
    },
    campaign: async (_: any, { id }: any) => {
      const useCase = new ObtenerCampaignUseCase(repo);
      return await useCase.execute(id);
    },
  },
  Mutation: {
    crearCampaign: async (_: any, { input, organizacionId }: any) => {
      if (!input.creado_por) {
        throw new Error('El campo creado_por es obligatorio en el input.');
      }
      const useCase = new CrearCampaignUseCase(repo);
      return await useCase.execute({
        ...input,
        id_organizacion: organizacionId,
        creado_por: input.creado_por,
      });
    },
    actualizarCampaign: async (_: any, { id, input }: any) => {
      const useCase = new ActualizarCampaignUseCase(repo);
      return await useCase.execute(id, input);
    },
    eliminarCampaign: async (_: any, { id }: any) => {
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
    }) => {
      return await generarContenidoUseCase.execute(args);
    },

    crearEnvio: async (_: any, { input }: { input: any }) => {
      // Extraemos los datos que son para el UseCase pero NO van a la BD
      const { vector, contacto_destino, ...envioDataBD } = input;

      const repoEnvio = new SupabaseEnvioRepository();
      const emailProvider = new NodemailerAdapter();
      const smsProvider = new TwilioSmsAdapter();
      
      const useCase = new CrearEnvioUseCase(repoEnvio, emailProvider, smsProvider);
      
      return await useCase.execute(envioDataBD, vector, contacto_destino);
    },
  },
};