import OpenAI from 'openai';
import { IAiGenerator } from '../../domain/ports/IAiGenerator';

export class OpenAIAdapter implements IAiGenerator {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async generarEmailPhishing(contexto: string): Promise<{ asunto: string; contenido: string }> {
    try {
      const response = await this.client.chat.completions.create({
        model: 'gpt-4o-mini', // o 'gpt-3.5-turbo' (más barato)
        messages: [
          {
            role: 'system',
            content: `Eres un experto en ciberseguridad. Genera un correo de phishing simulado realista. 
            Responde ÚNICAMENTE con un objeto JSON válido con las propiedades "asunto" y "contenido". 
            El contenido debe ser HTML con formato básico (párrafos, negritas).`
          },
          {
            role: 'user',
            content: `Contexto para la simulación: ${contexto}. 
            El correo debe parecer legítimo pero tener señales de alerta sutiles.`
          }
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0].message.content || '{}';
      const parsed = JSON.parse(content);

      return {
        asunto: parsed.asunto || 'Acción requerida: Verificación de seguridad',
        contenido: parsed.contenido || `<p>Estimado usuario,</p><p>Su cuenta requiere verificación.</p>`
      };
    } catch (error) {
      console.error('Error en OpenAI:', error);
      throw new Error('No se pudo generar el contenido con OpenAI.');
    }
  }
}