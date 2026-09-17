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
import { defaultTrainingContent, trainingContentSchema } from '../../../education/domain/trainingContent';

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
    campaignHistory: async (_: unknown, { campaignId, limit = 50, offset = 0 }: { campaignId: string; limit?: number; offset?: number }, context: GraphqlContext) => {
      const admin = requireAdmin(context);
      const db = requireDb(context);
      const repo = new SupabaseCampaignRepository(db);
      const campaign = await repo.buscarPorId(campaignId);
      if (!campaign || campaign.id_organizacion !== admin.id_organizacion) throw new Error('No tienes acceso a esta campaña.');
      const pageSize = Math.min(100, Math.max(1, limit));
      const start = Math.max(0, offset);
      const { data: sends, count, error } = await db.from('envios_simulacion')
        .select('id,id_usuario_objetivo,estado,fecha_envio,fecha_click,provider_status,provider_error_code,provider_error_message,intentos,asunto_generado,contenido_generado', { count: 'exact' })
        .eq('id_campana', campaignId).order('id', { ascending: false }).range(start, start + pageSize - 1);
      if (error) throw new Error(`No se pudo consultar historial: ${error.message}`);
      const sendRows = sends || [];
      if (!sendRows.length) return { items: [], total: count || 0 };
      const targetIds = [...new Set(sendRows.map((row: any) => row.id_usuario_objetivo))];
      const sendIds = sendRows.map((row: any) => row.id);
      const [targetsResult, modulesResult] = await Promise.all([
        db.from('usuarios_objetivo').select('id,nombre,email,telefono').eq('id_organizacion', admin.id_organizacion).in('id', targetIds),
        db.from('modulo_educativo').select('id_envio,estado,puntaje_quiz,fecha_completado,respuestas_json').in('id_envio', sendIds),
      ]);
      if (targetsResult.error) throw new Error(`No se pudieron consultar empleados: ${targetsResult.error.message}`);
      if (modulesResult.error) throw new Error(`No se pudo consultar capacitación: ${modulesResult.error.message}`);
      const targets = new Map((targetsResult.data || []).map((row: any) => [row.id, row]));
      const modules = new Map((modulesResult.data || []).map((row: any) => [row.id_envio, row]));
      const training = campaign.training_snapshot
        ? trainingContentSchema.parse(campaign.training_snapshot)
        : defaultTrainingContent(campaign.tipo);
      return {
        total: count || 0,
        items: sendRows.map((row: any) => {
          const target: any = targets.get(row.id_usuario_objetivo);
          const module: any = modules.get(row.id);
          return {
            id: row.id, empleado: target?.nombre || 'Empleado no disponible',
            destino: campaign.tipo === 'Smishing' ? target?.telefono || '' : target?.email || '',
            canal: campaign.tipo, estado: row.estado, fecha_envio: row.fecha_envio, fecha_click: row.fecha_click,
            provider_status: row.provider_status, provider_error_code: row.provider_error_code,
            provider_error_message: row.provider_error_message, intentos: row.intentos || 0,
            asunto: row.asunto_generado || '', contenido: row.contenido_generado || '',
            capacitacion_estado: module?.estado || null, puntaje: module?.puntaje_quiz ?? null,
            fecha_completado: module?.fecha_completado || null,
            respuestas: training.questions.map((question, index) => {
              const value = Array.isArray(module?.respuestas_json) ? module.respuestas_json[index] : null;
              return {
                pregunta: question.text,
                respuesta: question.options.find(option => option.value === value)?.label || null,
                correcta: value ? value === question.correctValue : null,
              };
            }),
          };
        }),
      };
    },
  },
  Mutation: {
    crearCampaign: async (_: any, { input, organizacionId }: any, context: GraphqlContext) => {
      const admin = requireOrganization(context, organizacionId);
      const db = requireDb(context);
      const repo = new SupabaseCampaignRepository(db);
      if (!input.creado_por) {
        throw new Error('El campo creado_por es obligatorio en el input.');
      }
      const { data: config, error: configError } = await db.from('configuracion_organizacion')
        .select('zona_horaria,hora_inicio,hora_fin,nota_minima').eq('id_organizacion', admin.id_organizacion).maybeSingle();
      if (configError) throw new Error(`No se pudo consultar configuración: ${configError.message}`);
      if (input.fecha_programada) {
        const scheduled = new Date(input.fecha_programada);
        if (!Number.isFinite(scheduled.getTime())) throw new Error('Fecha de envío inválida.');
        const time = new Intl.DateTimeFormat('en-GB', { timeZone: config?.zona_horaria || 'America/Lima', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(scheduled);
        const begin = String(config?.hora_inicio || '08:00').slice(0, 5);
        const end = String(config?.hora_fin || '18:00').slice(0, 5);
        if (time < begin || time > end) throw new Error(`La hora programada debe estar entre ${begin} y ${end} (${config?.zona_horaria || 'America/Lima'}).`);
      }
      let snapshot = defaultTrainingContent(input.tipo, config?.nota_minima ?? 67);
      let templateId: string | null = null;
      let templateVersion: number | null = null;
      if (input.trainingTemplateId) {
        const { data: template, error } = await db.from('plantillas_capacitacion').select('id,canal,estado,contenido_json,version')
          .eq('id', input.trainingTemplateId).eq('id_organizacion', admin.id_organizacion).maybeSingle();
        if (error || !template || template.estado !== 'Publicada' || template.canal !== input.tipo) throw new Error('Selecciona una plantilla publicada del mismo canal.');
        snapshot = trainingContentSchema.parse(template.contenido_json);
        templateId = template.id;
        templateVersion = template.version;
      }
      const useCase = new CrearCampaignUseCase(repo);
      const { trainingTemplateId: _unused, ...campaignInput } = input;
      return await useCase.execute({
        ...campaignInput,
        id_organizacion: admin.id_organizacion,
        creado_por: admin.id,
        training_snapshot: snapshot,
        training_template_id: templateId,
        training_template_version: templateVersion,
      });
    },
    actualizarCampaign: async (_: any, { id, input }: any, context: GraphqlContext) => {
      const admin = requireAdmin(context);
      const repo = new SupabaseCampaignRepository(requireDb(context));
      const campaign = await repo.buscarPorId(id);
      if (!campaign || campaign.id_organizacion !== admin.id_organizacion) throw new Error('No tienes acceso a esta campaña.');
      const useCase = new ActualizarCampaignUseCase(repo);
      const { trainingTemplateId: _unused, ...campaignInput } = input;
      return await useCase.execute(id, { ...campaignInput, creado_por: admin.id });
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
      const generarContenidoUseCase = new GenerarContenidoIaUseCase(new MistralAdapter(), repoOsint);
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
      const { data: config, error: configError } = await db.from('configuracion_organizacion').select('limite_destinatarios').eq('id_organizacion', admin.id_organizacion).maybeSingle();
      if (configError) throw new Error(`No se pudo consultar límite de destinatarios: ${configError.message}`);
      const { count, error: countError } = await db.from('envios_simulacion').select('id', { count: 'exact', head: true }).eq('id_campana', campaign.id);
      if (countError) throw new Error(`No se pudo contar destinatarios: ${countError.message}`);
      if ((count || 0) >= (config?.limite_destinatarios ?? 100)) throw new Error('La campaña alcanzó el límite de destinatarios configurado.');
      const { data: duplicate, error: duplicateError } = await db.from('envios_simulacion').select('id').eq('id_campana', campaign.id).eq('id_usuario_objetivo', target.id).maybeSingle();
      if (duplicateError) throw new Error(`No se pudo validar duplicados: ${duplicateError.message}`);
      if (duplicate) throw new Error('Este empleado ya está incluido en la campaña.');
      const { vector: _vector, contacto_destino: _destino, ...envioDataBD } = input;
      const vector = campaign.tipo === 'Smishing' ? 'sms' : 'email';
      const contactoDestino = vector === 'sms' ? target.telefono : target.email;
      if (!contactoDestino) throw new Error('El empleado no tiene un dato de contacto para este canal.');

      const repoEnvio = new SupabaseEnvioRepository(db);
      const emailProvider = new NodemailerAdapter();
      const smsProvider = new TwilioSmsAdapter();
      
      const useCase = new CrearEnvioUseCase(repoEnvio, emailProvider, smsProvider, repo);
      
      return await useCase.execute(envioDataBD, vector, contactoDestino);
    },
  },
};
