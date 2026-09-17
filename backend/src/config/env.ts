// src/config/env.ts
import { z } from 'zod';
import dotenv from 'dotenv';
dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('4000'),
  PUBLIC_BASE_URL: z.string().url().default('http://localhost:8080').transform(url => url.replace(/\/$/, '')),
  SUPABASE_URL: z.string().url(),
  SUPABASE_KEY: z.string().min(1),
  SUPABASE_SECRET_KEY: z.preprocess(value => value === '' ? undefined : value, z.string().min(1).optional()),
  SUPABASE_SERVICE_ROLE_KEY: z.preprocess(value => value === '' ? undefined : value, z.string().min(1).optional()),
  HUNTER_API_KEY: z.string().optional(),   
  HIBP_API_KEY: z.string().optional(),     
  CLARIFAI_PAT: z.string().optional(),
  BREACH_DIRECTORY_KEY: z.string().optional(),
  OPENAI_API_KEY: z.preprocess(value => value === '' ? undefined : value, z.string().min(1).optional()),
  MISTRAL_API_KEY: z.preprocess(value => value === '' ? undefined : value, z.string().min(1).optional()),
});

export const env = envSchema.parse(process.env);
