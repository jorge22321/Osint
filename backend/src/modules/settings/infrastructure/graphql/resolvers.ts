import nodemailer from 'nodemailer';
import twilio from 'twilio';
import { z } from 'zod';
import { env } from '../../../../config/env';
import { hasServiceRole } from '../../../../shared/infrastructure/database/supabase';
import { GraphqlContext, requireAdmin, requireDb } from '../../../../shared/infrastructure/graphql/authContext';

const defaultSettings = {
  nombre_mostrado: '', zona_horaria: 'America/Lima', hora_inicio: '08:00', hora_fin: '18:00',
  limite_destinatarios: 100, nota_minima: 67, permitir_borradores_ia: true,
};

const settingsSchema = z.object({
  nombre_mostrado: z.string().trim().max(120),
  zona_horaria: z.string().min(1).max(80).refine(value => {
    try { new Intl.DateTimeFormat('es-PE', { timeZone: value }); return true; } catch { return false; }
  }, 'Zona horaria inválida.'),
  hora_inicio: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  hora_fin: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  limite_destinatarios: z.number().int().min(1).max(10000),
  nota_minima: z.number().int().min(0).max(100),
  permitir_borradores_ia: z.boolean(),
}).refine(value => value.hora_inicio < value.hora_fin, 'La hora de inicio debe ser anterior a la hora de fin.');

const safeErrorCode = (error: any) => String(error?.code || error?.status || 'UNKNOWN').slice(0, 30);
const audit = async (context: GraphqlContext, accion: string, detalle: Record<string, unknown>) => {
  const admin = requireAdmin(context);
  const { error } = await requireDb(context).from('auditoria_configuracion').insert({
    id_organizacion: admin.id_organizacion, id_admin: admin.id, accion, detalle,
  });
  if (error) console.error('[Auditoría configuración]', error.message);
};

export const settingsResolvers = {
  Query: {
    settingsOverview: async (_: unknown, _args: unknown, context: GraphqlContext) => {
      const admin = requireAdmin(context);
      const db = requireDb(context);
      const [configResult, adminsResult, auditResult] = await Promise.all([
        db.from('configuracion_organizacion').select('*').eq('id_organizacion', admin.id_organizacion).maybeSingle(),
        db.from('administradores').select('id,nombre,email,rol').eq('id_organizacion', admin.id_organizacion).order('nombre'),
        db.from('auditoria_configuracion').select('id,id_admin,accion,detalle,creado_en').eq('id_organizacion', admin.id_organizacion).order('creado_en', { ascending: false }).limit(30),
      ]);
      if (configResult.error) throw new Error(`No se pudo cargar configuración: ${configResult.error.message}`);
      if (adminsResult.error) throw new Error(`No se pudieron cargar administradores: ${adminsResult.error.message}`);
      if (auditResult.error) throw new Error(`No se pudo cargar auditoría: ${auditResult.error.message}`);
      const names = new Map((adminsResult.data || []).map((row: any) => [row.id, row.nombre]));
      return {
        settings: { ...defaultSettings, ...(configResult.data || {}) },
        publicUrl: env.PUBLIC_BASE_URL,
        publicUrlLocal: ['localhost', '127.0.0.1', '::1'].includes(new URL(env.PUBLIC_BASE_URL).hostname),
        emailConfigured: Boolean(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD),
        smsConfigured: Boolean(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER),
        backendAutomationReady: hasServiceRole,
        admins: adminsResult.data || [],
        audit: (auditResult.data || []).map((row: any) => ({
          id: row.id, accion: row.accion, detalle: JSON.stringify(row.detalle || {}),
          admin_nombre: names.get(row.id_admin) || 'Administrador', creado_en: row.creado_en,
        })),
      };
    },
  },
  Mutation: {
    saveOrganizationSettings: async (_: unknown, { input }: { input: unknown }, context: GraphqlContext) => {
      const admin = requireAdmin(context);
      const validated = settingsSchema.parse(input);
      const { data, error } = await requireDb(context).from('configuracion_organizacion')
        .upsert({ ...validated, id_organizacion: admin.id_organizacion, actualizado_en: new Date().toISOString() })
        .select().single();
      if (error) throw new Error(`No se pudo guardar configuración: ${error.message}`);
      await audit(context, 'Configuración actualizada', { campos: Object.keys(validated) });
      return data;
    },
    checkDeliveryProvider: async (_: unknown, { provider }: { provider: string }, context: GraphqlContext) => {
      requireAdmin(context);
      if (provider === 'email') {
        if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) return { provider, state: 'Sin configurar', detail: 'Faltan las credenciales de correo.' };
        try {
          const transport = nodemailer.createTransport({ service: 'gmail', auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD } });
          await transport.verify();
          return { provider, state: 'Conectado', detail: 'Autenticación SMTP verificada. Esto no confirma la entrega de correos.' };
        } catch (error) { return { provider, state: 'Error', detail: `No se pudo autenticar SMTP (${safeErrorCode(error)}).` }; }
      }
      if (provider === 'sms') {
        if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
          return { provider, state: 'Sin configurar', detail: 'Faltan credenciales o número remitente de Twilio.' };
        }
        try {
          const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
          const account = await client.api.accounts(process.env.TWILIO_ACCOUNT_SID).fetch();
          const trial = String(account.type).toLowerCase() === 'trial';
          return {
            provider, state: trial ? 'Cuenta de prueba' : account.status === 'active' ? 'Conectado' : 'Error',
            detail: trial ? 'Twilio autentica, pero la prueba no permite mensajes personalizados con enlaces.' : `Cuenta ${account.status}. La entrega requiere un envío y confirmación posterior.`,
          };
        } catch (error) { return { provider, state: 'Error', detail: `Twilio rechazó la comprobación (${safeErrorCode(error)}).` }; }
      }
      throw new Error('Proveedor no soportado.');
    },
    sendAuthorizedTest: async (_: unknown, { provider, targetId }: { provider: string; targetId?: string }, context: GraphqlContext) => {
      const admin = requireAdmin(context);
      const db = requireDb(context);
      if (provider === 'email') {
        if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) throw new Error('Correo no configurado.');
        const transport = nodemailer.createTransport({ service: 'gmail', auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD } });
        try {
          await transport.sendMail({ from: process.env.GMAIL_USER, to: admin.email, subject: 'Prueba de configuración - CISO Analytics', text: 'Este es un correo de prueba autorizado por el administrador. No contiene enlaces de simulación.' });
          await audit(context, 'Prueba de correo', { destino: 'correo del administrador' });
          return { accepted: true, state: 'Aceptado', detail: 'El proveedor aceptó el correo de prueba. Revisa tu bandeja.' };
        } catch (error) { return { accepted: false, state: 'Fallido', detail: `El proveedor rechazó el correo (${safeErrorCode(error)}).` }; }
      }
      if (provider === 'sms') {
        if (!targetId) throw new Error('Selecciona un empleado registrado para la prueba SMS.');
        const { data: target, error } = await db.from('usuarios_objetivo').select('id,telefono,id_organizacion').eq('id', targetId).maybeSingle();
        if (error || !target || target.id_organizacion !== admin.id_organizacion || !target.telefono) throw new Error('Empleado o teléfono no disponible.');
        if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) throw new Error('Twilio no configurado.');
        try {
          const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
          const account = await client.api.accounts(process.env.TWILIO_ACCOUNT_SID).fetch();
          const trial = String(account.type).toLowerCase() === 'trial';
          const body = trial ? 'sms_internal_alerts' : 'Prueba autorizada de CISO Analytics. No se requiere ninguna acción.';
          const message = await client.messages.create({ from: process.env.TWILIO_PHONE_NUMBER, to: target.telefono, body });
          await audit(context, 'Prueba SMS', { empleado_id: target.id, provider_message_id: message.sid });
          return { accepted: true, state: 'Aceptado', detail: trial ? 'Twilio aceptó una plantilla de prueba; la cuenta trial no enviará el contenido personalizado de campañas.' : 'Twilio aceptó el SMS; espera la confirmación de entrega.' };
        } catch (error) { return { accepted: false, state: 'Fallido', detail: `Twilio rechazó la prueba (${safeErrorCode(error)}).` }; }
      }
      throw new Error('Proveedor no soportado.');
    },
  },
};
