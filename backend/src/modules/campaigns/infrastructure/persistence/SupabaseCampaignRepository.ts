//backend/src/modules/campaigns/infrastructure/persistence/SupabaseCampaignRepository.ts
import { supabase } from '../../../../shared/infrastructure/database/supabase';
import { ICampaignRepository } from '../../domain/ports/ICampaignRepository';
import { Campaign } from '../../domain/entities/Campaign';

export class SupabaseCampaignRepository implements ICampaignRepository {
  async listar(organizacionId: string): Promise<Campaign[]> {
    const { data, error } = await supabase
      .from('campanas')
      .select('*')
      .eq('id_organizacion', organizacionId)
      .order('creado_en', { ascending: false });

    if (error) throw new Error(`Error al listar campañas: ${error.message}`);
    return data as Campaign[];
  }

  async crear(data: Omit<Campaign, 'id' | 'creado_en'>): Promise<Campaign> {
    const { data: created, error } = await supabase
      .from('campanas')
      .insert([{
        id_organizacion: data.id_organizacion,
        nombre: data.nombre,
        tipo: data.tipo,
        estado: data.estado || 'Borrador',
        fecha_programada: data.fecha_programada || null,
        creado_por: data.creado_por,
      }])
      .select()
      .single();

    if (error) throw new Error(`Error al crear campaña: ${error.message}`);
    return created as Campaign;
  }

  async actualizar(id: string, data: Partial<Campaign>): Promise<Campaign> {
    const { data: updated, error } = await supabase
      .from('campanas')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Error al actualizar campaña: ${error.message}`);
    return updated as Campaign;
  }

  async eliminar(id: string): Promise<void> {
    const { error } = await supabase
      .from('campanas')
      .delete()
      .eq('id', id);

    if (error) throw new Error(`Error al eliminar campaña: ${error.message}`);
  }

  async buscarPorId(id: string): Promise<Campaign | null> {
    const { data, error } = await supabase
      .from('campanas')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw new Error(`Error al buscar campaña: ${error.message}`);
    return data as Campaign | null;
  }
}