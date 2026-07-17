// src/modules/iam/infrastructure/persistence/SupabaseAdminRepository.ts
import { IAdminRepository, AuthResponse } from '../../domain/ports/IAdminRepository';
import { supabase } from '../../../../shared/infrastructure/database/supabase';

export class SupabaseAdminRepository implements IAdminRepository {
  async autenticar(email: string, contrasena: string): Promise<AuthResponse> {
    
    // 1. Autenticar las credenciales en Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password: contrasena,
    });

    if (authError) {
      throw new Error(`Credenciales inválidas: ${authError.message}`);
    }

    // 2. Buscar el perfil completo del Administrador en tu tabla personalizada de la BD
    const { data: adminProfile, error: profileError } = await supabase
      .from('administradores')
      .select(`
    *,
    organizaciones ( dominio )
  `)
      .eq('email', email)
      .single();

    if (profileError || !adminProfile) {
      // Agrega este console.log para ver el error real en tu terminal del backend
      console.error("Error real de Supabase:", profileError); 
      throw new Error('Usuario autenticado, pero no tiene un perfil en la tabla de administradores.');
    }

    // 3. Retornar el token JWT generado por Supabase y el perfil estructurado
    return {
      token: authData.session?.access_token || '',
      admin: {
        id: adminProfile.id,
        id_organizacion: adminProfile.id_organizacion,
        nombre: adminProfile.nombre,
        email: adminProfile.email,
        rol: adminProfile.rol,
        dominio: adminProfile.organizaciones?.dominio || '',
      },
    };
  }
}