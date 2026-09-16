import { SupabaseClient } from '@supabase/supabase-js';
import { createAuthenticatedSupabase, supabase } from '../database/supabase';

export interface AuthenticatedAdmin {
  id: string;
  id_organizacion: string;
  nombre: string;
  email: string;
  rol: string;
  dominio: string;
}

export interface GraphqlContext {
  admin: AuthenticatedAdmin | null;
  db: SupabaseClient | null;
}

export const buildGraphqlContext = async (req: { headers: { authorization?: string } }): Promise<GraphqlContext> => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
  if (!token) return { admin: null, db: null };

  const { data: authData, error: authError } = await supabase.auth.getUser(token);
  const email = authData.user?.email;
  if (authError || !email) return { admin: null, db: null };

  const db = createAuthenticatedSupabase(token);

  const { data: admin, error: profileError } = await db
    .from('administradores')
    .select('id,id_organizacion,nombre,email,rol,organizaciones(dominio)')
    .eq('email', email)
    .maybeSingle();

  if (profileError || !admin) return { admin: null, db: null };
  const organization = Array.isArray(admin.organizaciones) ? admin.organizaciones[0] : admin.organizaciones;
  return {
    admin: { ...admin, dominio: organization?.dominio || '' } as AuthenticatedAdmin,
    db,
  };
};

export const requireAdmin = (context: GraphqlContext): AuthenticatedAdmin => {
  if (!context?.admin) throw new Error('Sesión inválida o expirada. Inicia sesión nuevamente.');
  return context.admin;
};

export const requireOrganization = (context: GraphqlContext, requestedId?: string): AuthenticatedAdmin => {
  const admin = requireAdmin(context);
  if (requestedId && requestedId !== admin.id_organizacion) {
    throw new Error('No tienes acceso a la organización solicitada.');
  }
  return admin;
};

export const requireDb = (context: GraphqlContext): SupabaseClient => {
  requireAdmin(context);
  if (!context.db) throw new Error('No se pudo establecer una sesión segura con la base de datos.');
  return context.db;
};
