// src/config/env.ts
import { z } from 'zod';
import dotenv from 'dotenv';
dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('4000'),
  PUBLIC_BASE_URL: z.string().url().default('http://localhost:8080').transform(url => url.replace(/\/$/, '')),
  SUPABASE_URL: z.string().url(),
  SUPABASE_KEY: z.string().min(1),
  HUNTER_API_KEY: z.string().optional(),   
  HIBP_API_KEY: z.string().optional(),     
  CLARIFAI_PAT: z.string().optional(),
  BREACH_DIRECTORY_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().min(1),
  MISTRAL_API_KEY: z.string().min(1),
});

export const env = envSchema.parse(process.env);
