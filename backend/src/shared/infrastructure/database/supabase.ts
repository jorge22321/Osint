// src/shared/infrastructure/database/supabase.ts
import { createClient } from '@supabase/supabase-js';
import { env } from '../../../config/env';

// Creamos una única instancia del cliente de Supabase para todo el backend
export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY);

export const createAuthenticatedSupabase = (token: string) => createClient(
  env.SUPABASE_URL,
  env.SUPABASE_KEY,
  {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  }
);
