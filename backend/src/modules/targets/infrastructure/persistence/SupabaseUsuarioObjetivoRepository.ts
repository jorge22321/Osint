//backend/src/modules/targets/infrastructure/persistence/SupabaseUsuarioObjetivoRepository.ts
import { supabase } from '../../../../shared/infrastructure/database/supabase';
import { IUsuarioObjetivoRepository } from '../../domain/ports/IUsuarioObjetivoRepository';
import { UsuarioObjetivo } from '../../domain/entities/UsuarioObjetivo';
import { SupabaseClient } from '@supabase/supabase-js';

export class SupabaseUsuarioObjetivoRepository implements IUsuarioObjetivoRepository {
  constructor(private db: SupabaseClient = supabase) {}

  async listar(organizacionId: string): Promise<UsuarioObjetivo[]> {
    const { data, error } = await this.db
      .from('usuarios_objetivo')
      .select('*')
      .eq('id_organizacion', organizacionId)
      .order('nombre');

    if (error) throw new Error(`Error al listar usuarios: ${error.message}`);
    return data as UsuarioObjetivo[];
  }

  async crear(usuario: Omit<UsuarioObjetivo, 'id' | 'creado_en'>): Promise<UsuarioObjetivo> {
    // Validar email duplicado en la misma organización
    const existente = await this.buscarPorEmail(usuario.email, usuario.id_organizacion);
    if (existente) {
      throw new Error('El correo ya está registrado en esta organización.');
    }

    const { data, error } = await this.db
      .from('usuarios_objetivo')
      .insert([{
        id_organizacion: usuario.id_organizacion,
        nombre: usuario.nombre,
        email: usuario.email,
        telefono: usuario.telefono || null,
        departamento: usuario.departamento || null,
        cargo: usuario.cargo || null,
        risk_score: usuario.risk_score ?? 100,
        estado: usuario.estado ?? 'Activo',
      }])
      .select()
      .single();

    if (error) throw new Error(`Error al crear usuario: ${error.message}`);
    return data as UsuarioObjetivo;
  }

  async actualizar(id: string, data: Partial<UsuarioObjetivo>): Promise<UsuarioObjetivo> {
    const { data: updated, error } = await this.db
      .from('usuarios_objetivo')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Error al actualizar usuario: ${error.message}`);
    return updated as UsuarioObjetivo;
  }

  async eliminar(id: string): Promise<void> {
    const { error } = await this.db
      .from('usuarios_objetivo')
      .delete()
      .eq('id', id);

    if (error) throw new Error(`Error al eliminar usuario: ${error.message}`);
  }

  async buscarPorEmail(email: string, organizacionId: string): Promise<UsuarioObjetivo | null> {
    const { data, error } = await this.db
      .from('usuarios_objetivo')
      .select('*')
      .eq('email', email)
      .eq('id_organizacion', organizacionId)
      .maybeSingle();

    if (error) throw new Error(`Error al buscar por email: ${error.message}`);
    return data as UsuarioObjetivo | null;
  }

  async buscarPorId(id: string): Promise<UsuarioObjetivo | null> {
    const { data, error } = await this.db
      .from('usuarios_objetivo')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw new Error(`Error al buscar por ID: ${error.message}`);
    return data as UsuarioObjetivo | null;
  }
}
