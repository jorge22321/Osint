import { supabase } from '../../../../shared/infrastructure/database/supabase';
import { IEnvioRepository, Envio } from '../../domain/ports/IEnvioRepository';

export class SupabaseEnvioRepository implements IEnvioRepository {
  async crear(envio: Omit<Envio, 'id'>): Promise<Envio> {
    const { data, error } = await supabase
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
}