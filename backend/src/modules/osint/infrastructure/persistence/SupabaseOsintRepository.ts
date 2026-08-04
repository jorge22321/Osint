//backend/src/modules/osint/infrastructure/persistence/SupabaseOsintRepository.ts
import { supabase } from '../../../../shared/infrastructure/database/supabase';
import { IOsintRepository } from '../../domain/ports/IOsintRepository';
import { OsintLog } from '../../domain/entities/OsintLog';

export class SupabaseOsintRepository implements IOsintRepository {
  // Cambia el tipo de retorno a Promise<OsintLog[]>
  async guardarHallazgos(hallazgos: OsintLog[]): Promise<OsintLog[]> {
    if (hallazgos.length === 0) return [];

    const { data, error } = await supabase
      .from('osint_logs')
      .insert(
        hallazgos.map(h => ({
          id_organizacion: h.id_organizacion,
          id_usuario_objetivo: h.id_usuario_objetivo || null,
          fuente: h.fuente,
          tipo_hallazgo: h.tipo_hallazgo,
          detalle_json: h.detalle_json,
        }))
      )
      .select(); // 👈 Esto devuelve los registros con ID y timestamps

    if (error) {
      console.error('Error guardando hallazgos OSINT:', error);
      throw new Error('No se pudieron guardar los hallazgos en la base de datos.');
    }

    // data es un array de OsintLog con id, creado_en, etc.
    return data as OsintLog[];
  }

  async obtenerPorOrganizacion(organizacionId: string): Promise<OsintLog[]> {
    const { data, error } = await supabase
      .from('osint_logs')
      .select('*')
      .eq('id_organizacion', organizacionId)
      .order('creado_en', { ascending: false });

    if (error) {
      console.error('Error obteniendo logs OSINT:', error);
      return [];
    }
    return data as OsintLog[];
  }

  async obtenerLogPorId(id: string): Promise<OsintLog | null> {
    const { data, error } = await supabase
      .from('osint_logs')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Error obteniendo log OSINT por ID:', error);
      return null;
    }
    return data as OsintLog | null;
  }
}