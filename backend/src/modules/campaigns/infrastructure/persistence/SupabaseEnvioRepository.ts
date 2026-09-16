//backend/src/modules/campaigns/infrastructure/persistence/SupabaseEnvioRepository.ts
import { supabase } from '../../../../shared/infrastructure/database/supabase';
import { IEnvioRepository, Envio, EnvioProgramado } from '../../domain/ports/IEnvioRepository';
import { SupabaseClient } from '@supabase/supabase-js';

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

  async actualizarEstado(id: string, estado: string, fechaEnvio: Date | null = null): Promise<Envio> {
    const update: Record<string, unknown> = { estado };
    if (fechaEnvio) update.fecha_envio = fechaEnvio.toISOString();

    const { data, error } = await this.db
      .from('envios_simulacion')
      .update(update)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`No se pudo actualizar el estado del envío: ${error.message}`);
    return data as Envio;
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
