//backend/src/modules/campaigns/infrastructure/persistence/SupabaseEnvioRepository.ts
import { supabase } from '../../../../shared/infrastructure/database/supabase';
import { IEnvioRepository, Envio, EnvioProgramado } from '../../domain/ports/IEnvioRepository';
import { SupabaseClient } from '@supabase/supabase-js';
import { DeliveryResult } from '../../domain/ports/DeliveryResult';

export class SupabaseEnvioRepository implements IEnvioRepository {
  constructor(private db: SupabaseClient = supabase) {}

  async crear(envio: Omit<Envio, 'id'>): Promise<Envio> {
    const { data, error } = await this.db
      .from('envios_simulacion')
      .insert([{
        id_campana: envio.id_campana,
        id_usuario_objetivo: envio.id_usuario_objetivo,
        tracking_code: envio.tracking_code,
        estado: envio.estado || 'En Cola',
        asunto_generado: envio.asunto_generado,
        contenido_generado: envio.contenido_generado,
        fecha_envio: envio.fecha_envio || null,
        fecha_click: envio.fecha_click || null,
        fecha_reporte: envio.fecha_reporte || null,
      }])
      .select()
      .single();

    if (error) {
      console.error('Error al crear envío:', error);
      throw new Error('No se pudo crear el envío en la base de datos.');
    }

    return data as Envio;
  }

  async actualizarEstado(id: string, estado: string, fechaEnvio: Date | null = null, result?: DeliveryResult): Promise<Envio> {
    const update: Record<string, unknown> = { estado, fecha_estado_proveedor: new Date().toISOString() };
    if (fechaEnvio) update.fecha_envio = fechaEnvio.toISOString();
    if (result) {
      update.provider_message_id = result.providerId || null;
      update.provider_status = result.providerStatus || null;
      update.provider_error_code = result.errorCode || null;
      update.provider_error_message = result.errorMessage || null;
    }
    const { data: existing, error: readError } = await this.db.from('envios_simulacion').select('intentos').eq('id', id).single();
    if (readError) throw new Error(`No se pudo consultar el envío: ${readError.message}`);
    update.intentos = Number(existing.intentos || 0) + 1;

    const { data, error } = await this.db
      .from('envios_simulacion')
      .update(update)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`No se pudo actualizar el estado del envío: ${error.message}`);
    return data as Envio;
  }

  async listarSmsEnSeguimiento(): Promise<Array<{ id: string; provider_message_id: string }>> {
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const nextCheck = new Date(Date.now() - 60 * 1000).toISOString();
    const { data, error } = await this.db.from('envios_simulacion')
      .select('id,provider_message_id')
      .in('provider_status', ['accepted', 'queued', 'sending', 'sent'])
      .not('provider_message_id', 'is', null)
      .gte('fecha_envio', since)
      .lte('fecha_estado_proveedor', nextCheck)
      .order('fecha_estado_proveedor', { ascending: true }).limit(20);
    if (error) throw new Error(`No se pudo consultar el seguimiento SMS: ${error.message}`);
    return data as Array<{ id: string; provider_message_id: string }>;
  }

  async actualizarEstadoProveedor(id: string, result: DeliveryResult): Promise<void> {
    if (!result.providerStatus) return;
    const { data: current, error: readError } = await this.db.from('envios_simulacion').select('estado').eq('id', id).single();
    if (readError) throw new Error(`No se pudo consultar el estado del envío: ${readError.message}`);
    const update: Record<string, unknown> = {
      provider_status: result.providerStatus,
      provider_error_code: result.errorCode || null,
      provider_error_message: result.errorMessage || null,
      fecha_estado_proveedor: new Date().toISOString(),
    };
    if (!['Abierto', 'Clickeado'].includes(current.estado)) {
      if (result.providerStatus === 'delivered') update.estado = 'Entregado';
      if (['failed', 'undelivered', 'canceled'].includes(result.providerStatus)) update.estado = 'Fallido';
      if (result.providerStatus === 'sent') update.estado = 'Enviado';
    }
    const { error } = await this.db.from('envios_simulacion').update(update).eq('id', id);
    if (error) throw new Error(`No se pudo actualizar entrega SMS: ${error.message}`);
  }

  async listarPendientesProgramados(hasta: Date): Promise<EnvioProgramado[]> {
    const { data, error } = await this.db
      .from('envios_simulacion')
      .select(`
        id,
        id_campana,
        id_usuario_objetivo,
        tracking_code,
        estado,
        asunto_generado,
        contenido_generado,
        fecha_envio,
        fecha_click,
        fecha_reporte,
        campanas!inner(tipo, fecha_programada),
        usuarios_objetivo!inner(email, telefono)
      `)
      .eq('estado', 'En Cola')
      .not('campanas.fecha_programada', 'is', null)
      .lte('campanas.fecha_programada', hasta.toISOString())
      .limit(100);

    if (error) throw new Error(`No se pudieron consultar los envíos programados: ${error.message}`);

    return (data || []).map((row: any) => {
      const campaign = Array.isArray(row.campanas) ? row.campanas[0] : row.campanas;
      const target = Array.isArray(row.usuarios_objetivo) ? row.usuarios_objetivo[0] : row.usuarios_objetivo;
      const vector = campaign?.tipo === 'Smishing' ? 'sms' : 'email';
      return {
        id: row.id,
        id_campana: row.id_campana,
        id_usuario_objetivo: row.id_usuario_objetivo,
        tracking_code: row.tracking_code,
        estado: row.estado,
        asunto_generado: row.asunto_generado,
        contenido_generado: row.contenido_generado,
        fecha_envio: row.fecha_envio,
        fecha_click: row.fecha_click,
        fecha_reporte: row.fecha_reporte,
        vector,
        contacto_destino: vector === 'sms' ? target?.telefono || '' : target?.email || '',
      } as EnvioProgramado;
    });
  }
}
