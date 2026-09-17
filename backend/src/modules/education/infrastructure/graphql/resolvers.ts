import { Mistral } from '@mistralai/mistralai';
import { z } from 'zod';
import { GraphqlContext, requireAdmin, requireDb } from '../../../../shared/infrastructure/graphql/authContext';
import { defaultTrainingContent, normalizeGeneratedTrainingContent, trainingContentSchema } from '../../domain/trainingContent';
import { trainingTemplateInputSchema } from '../../domain/trainingTemplateInput';

const templateView = (row: any) => ({ ...row, contenidoJson: JSON.stringify(row.contenido_json) });
const contentFieldName = (path: PropertyKey[]) => {
  const [section, index, field] = path;
  if (section === 'questions') return `Pregunta ${typeof index === 'number' ? index + 1 : ''}${field === 'text' ? ' (enunciado)' : field === 'options' ? ' (opciones)' : field === 'correctValue' ? ' (respuesta correcta)' : ''}`.trim();
  if (section === 'signals') return `Señal ${typeof index === 'number' ? index + 1 : ''}`.trim();
  return ({ title: 'Título visible', introduction: 'Explicación', passScore: 'Puntaje mínimo' } as Record<string, string>)[String(section)] || 'Contenido';
};

export const educationResolvers = {
  Query: {
    trainingTemplates: async (_: unknown, { canal }: { canal?: string }, context: GraphqlContext) => {
      const admin = requireAdmin(context);
      let query = requireDb(context).from('plantillas_capacitacion').select('*').eq('id_organizacion', admin.id_organizacion).order('actualizado_en', { ascending: false });
      if (canal) query = query.eq('canal', canal);
      const { data, error } = await query;
      if (error) throw new Error(`No se pudieron cargar las plantillas: ${error.message}`);
      return (data || []).map(templateView);
    },
    defaultTrainingContent: (_: unknown, { canal }: { canal: string }, context: GraphqlContext) => {
      requireAdmin(context);
      if (!['Phishing', 'Smishing'].includes(canal)) throw new Error('Canal no válido.');
      return JSON.stringify(defaultTrainingContent(canal));
    },
  },
  Mutation: {
    saveTrainingTemplate: async (_: unknown, { input }: { input: unknown }, context: GraphqlContext) => {
      const admin = requireAdmin(context);
      const db = requireDb(context);
      const parsedInput = trainingTemplateInputSchema.safeParse(input);
      if (!parsedInput.success) throw new Error('Revisa el nombre interno y los datos de la plantilla antes de guardarla.');
      const values = parsedInput.data;
      let content: unknown;
      try { content = JSON.parse(values.contenidoJson); } catch { throw new Error('El contenido de la capacitación no es JSON válido.'); }
      const parsedContent = trainingContentSchema.safeParse(content);
      if (!parsedContent.success) throw new Error(`${contentFieldName(parsedContent.error.issues[0]?.path || [])}: completa este campo con un valor válido.`);
      const validated = parsedContent.data;
      const now = new Date().toISOString();
      let version = 1;
      if (values.id) {
        const { data: existing, error } = await db.from('plantillas_capacitacion').select('id,version').eq('id', values.id).eq('id_organizacion', admin.id_organizacion).maybeSingle();
        if (error || !existing) throw new Error('La plantilla no existe en tu organización.');
        version = existing.version + 1;
      }
      const payload = {
        ...(values.id ? { id: values.id } : {}), id_organizacion: admin.id_organizacion,
        titulo: values.titulo, canal: values.canal, contenido_json: validated,
        estado: values.estado, origen: values.origen, version,
        creado_por: admin.id, actualizado_en: now,
      };
      const { data, error } = await db.from('plantillas_capacitacion').upsert(payload).select().single();
      if (error) throw new Error(`No se pudo guardar la plantilla: ${error.message}`);
      const { error: auditError } = await db.from('auditoria_configuracion').insert({ id_organizacion: admin.id_organizacion, id_admin: admin.id, accion: values.estado === 'Publicada' ? 'Plantilla publicada' : 'Borrador guardado', detalle: { plantilla_id: data.id, version } });
      if (auditError) console.error('[Auditoría plantilla]', auditError.message);
      return templateView(data);
    },
    generateTrainingDraft: async (_: unknown, { canal, tema }: { canal: string; tema: string }, context: GraphqlContext) => {
      const admin = requireAdmin(context);
      if (!['Phishing', 'Smishing'].includes(canal)) throw new Error('Canal no válido.');
      const safeTopic = z.string().trim().min(5).max(120).refine(value => !/\S+@\S+|\+\d{8,}/.test(value), 'No incluyas datos personales en el tema.').parse(tema);
      const { data: config, error } = await requireDb(context).from('configuracion_organizacion').select('permitir_borradores_ia,nota_minima').eq('id_organizacion', admin.id_organizacion).maybeSingle();
      if (error) throw new Error(`No se pudo consultar la configuración: ${error.message}`);
      if (config?.permitir_borradores_ia === false) throw new Error('La generación con IA está desactivada en Configuración.');
      if (!process.env.MISTRAL_API_KEY) throw new Error('Mistral no está configurado.');
      const client = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });
      const response = await client.chat.complete({
        model: 'mistral-small-latest', temperature: 0.3, responseFormat: { type: 'json_object' },
        messages: [
          { role: 'system', content: 'Redacta una microlección de concientización de ciberseguridad en español. Devuelve SOLO JSON con title, introduction, signals (3 objetos title/description), questions (3 objetos id/text/options/correctValue, 3 opciones value/label cada uno) y passScore. Usa id de pregunta como texto (q1, q2, q3), y value y correctValue como textos idénticos para la opción correcta. Cada pregunta debe tener una sola respuesta correcta. No solicites contraseñas, códigos ni datos personales. El contenido es un borrador que revisará un humano.' },
          { role: 'user', content: `Canal: ${canal}. Tema general: ${safeTopic}. Nota mínima: ${config?.nota_minima ?? 67}. No incluyas nombres, teléfonos ni correos de empleados.` },
        ],
      });
      const raw = response.choices?.[0]?.message?.content;
      const text = typeof raw === 'string' ? raw : Array.isArray(raw) ? raw.map(part => typeof part === 'string' ? part : (part as any).text || '').join('') : '';
      let parsed: unknown;
      try { parsed = JSON.parse(text.replace(/^```json\s*|```$/g, '').trim()); } catch { throw new Error('La IA no produjo un borrador válido. Inténtalo de nuevo.'); }
      const validated = trainingContentSchema.safeParse(normalizeGeneratedTrainingContent(parsed));
      if (!validated.success) throw new Error('No se pudo preparar un cuestionario válido. Prueba con otro tema o crea la plantilla manualmente.');
      return JSON.stringify(validated.data);
    },
  },
};
