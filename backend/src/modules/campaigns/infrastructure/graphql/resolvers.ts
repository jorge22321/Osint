    import { SupabaseCampaignRepository } from '../persistence/SupabaseCampaignRepository';
    import { CrearCampaignUseCase } from '../../application/useCases/CrearCampaignUseCase';
    import { ListarCampaignsUseCase } from '../../application/useCases/ListarCampaignsUseCase';
    import { ObtenerCampaignUseCase } from '../../application/useCases/ObtenerCampaignUseCase';
    import { ActualizarCampaignUseCase } from '../../application/useCases/ActualizarCampaignUseCase';
    import { EliminarCampaignUseCase } from '../../application/useCases/EliminarCampaignUseCase';
    import { GenerarContenidoIaUseCase } from '../../application/useCases/GenerarContenidoIaUseCase';
    import { MistralAdapter } from '../providers/MistralAdapter';
    import { SupabaseEnvioRepository } from '../persistence/SupabaseEnvioRepository';
    import { CrearEnvioUseCase } from '../../application/useCases/CrearEnvioUseCase';


    const repo = new SupabaseCampaignRepository();
    const aiProvider = new MistralAdapter();
    const generarContenidoUseCase = new GenerarContenidoIaUseCase(aiProvider);

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
        crearCampaign: async (_: any, { input, organizacionId }: any, context: any) => {
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
        generarContenidoCampaign: async (_: any, { contexto }: any) => {
        return await generarContenidoUseCase.execute(contexto);

        
        
        },
        crearEnvio: async (_: any, { input }: { input: any }) => {
        const repo = new SupabaseEnvioRepository();
        const useCase = new CrearEnvioUseCase(repo);
        return await useCase.execute(input);
        },
    },
    };
    