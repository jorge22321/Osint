// src/shared/infrastructure/database/supabase.ts
import { createClient } from '@supabase/supabase-js';
import { env } from '../../../config/env';

// Creamos una única instancia del cliente de Supabase para todo el backend
export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY);

// Solo para trabajo de servidor sin sesión de usuario: programador y enlaces de capacitación.
// Nunca se expone por GraphQL ni se envía al frontend.
const backendSecretKey = env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY;
export const hasServiceRole = Boolean(backendSecretKey);
export const serviceSupabase = backendSecretKey
  ? createClient(env.SUPABASE_URL, backendSecretKey, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    })
  : null;

export const requireServiceSupabase = () => {
  if (!serviceSupabase) throw new Error('El backend necesita una clave secreta de Supabase para procesar envíos programados y enlaces de capacitación.');
  return serviceSupabase;
};

export const createAuthenticatedSupabase = (token: string) => createClient(
  env.SUPABASE_URL,
  env.SUPABASE_KEY,
  {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  }
);
