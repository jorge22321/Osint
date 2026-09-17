import { z } from 'zod';

export const trainingTemplateInputSchema = z.object({
  id: z.string().uuid().nullish(),
  titulo: z.string().trim().min(5).max(150),
  canal: z.enum(['Phishing', 'Smishing']),
  contenidoJson: z.string().min(10).max(30000),
  estado: z.enum(['Borrador', 'Publicada']),
  origen: z.enum(['Manual', 'IA']),
});
