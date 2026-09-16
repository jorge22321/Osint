//backend/src/modules/osint/infrastructure/persistence/SupabaseOsintRepository.ts
import { supabase } from '../../../../shared/infrastructure/database/supabase';
import { IOsintRepository } from '../../domain/ports/IOsintRepository';
import { OsintLog } from '../../domain/entities/OsintLog';
import { osintFingerprint } from '../../domain/osintFingerprint';
import { SupabaseClient } from '@supabase/supabase-js';

export class SupabaseOsintRepository implements IOsintRepository {
  constructor(private db: SupabaseClient = supabase) {}

  async guardarHallazgos(hallazgos: OsintLog[]): Promise<OsintLog[]> {
    if (hallazgos.length === 0) return [];

    const organizacionId = hallazgos[0].id_organizacion;
    const fuentes = [...new Set(hallazgos.map(h => h.fuente))];
    const { data: existentes, error: existingError } = await this.db
      .from('osint_logs')
      .select('fuente,tipo_hallazgo,detalle_json')
      .eq('id_organizacion', organizacionId)
      .in('fuente', fuentes);

    if (existingError) throw new Error(`No se pudieron verificar hallazgos existentes: ${existingError.message}`);

    const fingerprints = new Set((existentes || []).map(item => osintFingerprint(item as OsintLog)));
    const nuevos = hallazgos.filter(hallazgo => {
      const fingerprint = osintFingerprint(hallazgo);
      if (fingerprints.has(fingerprint)) return false;
      fingerprints.add(fingerprint);
      return true;
    });
    if (nuevos.length === 0) return [];

    const { data, error } = await this.db
      .from('osint_logs')
      .insert(
        nuevos.map(h => ({
          id_organizacion: h.id_organizacion,
          id_usuario_objetivo: h.id_usuario_objetivo || null,
          fuente: h.fuente,
          tipo_hallazgo: h.tipo_hallazgo,
          detalle_json: h.detalle_json,
        }))
      )
      .select();

    if (error) {
      console.error('Error guardando hallazgos OSINT:', error);
      throw new Error('No se pudieron guardar los hallazgos en la base de datos.');
    }

    return data as OsintLog[];
  }

  async obtenerPorOrganizacion(organizacionId: string): Promise<OsintLog[]> {
    const { data, error } = await this.db
      .from('osint_logs')
      .select('*')
      .eq('id_organizacion', organizacionId)
      .order('creado_en', { ascending: false });

    if (error) {
      console.error('Error obteniendo logs OSINT:', error);
      throw new Error(`No se pudieron obtener los logs OSINT: ${error.message}`);
    }
    return data as OsintLog[];
  }

  async obtenerPagina(organizacionId: string, limit: number, offset: number): Promise<{ items: OsintLog[]; total: number }> {
    const safeLimit = Math.min(Math.max(limit, 1), 100);
    const safeOffset = Math.max(offset, 0);
    const { data, error } = await this.db
      .from('osint_logs')
      .select('*')
      .eq('id_organizacion', organizacionId)
      .order('creado_en', { ascending: false });

    if (error) throw new Error(`No se pudieron obtener los logs OSINT: ${error.message}`);
    const fingerprints = new Set<string>();
    const unique = (data as OsintLog[]).filter(item => {
      const fingerprint = osintFingerprint(item);
      if (fingerprints.has(fingerprint)) return false;
      fingerprints.add(fingerprint);
      return true;
    });
    return { items: unique.slice(safeOffset, safeOffset + safeLimit), total: unique.length };
  }

  async obtenerLogPorId(id: string): Promise<OsintLog | null> {
    const { data, error } = await this.db
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
