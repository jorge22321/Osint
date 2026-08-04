//backend/src/modules/campaigns/infrastructure/providers/MistralAdapter.ts
import { Mistral } from '@mistralai/mistralai';
import { IAiGenerator } from '../../domain/ports/IAiGenerator';

export class MistralAdapter implements IAiGenerator {
  private client: Mistral;

  constructor() {
    const apiKey = process.env.MISTRAL_API_KEY;
    if (!apiKey) {
      throw new Error('MISTRAL_API_KEY no está configurada en el .env');
    }
    this.client = new Mistral({
      apiKey: apiKey,
    });
  }

  async generarEmailPhishing(contexto: string): Promise<{ asunto: string; contenido: string }> {
    try {
      // 1. Llamar a la API de Mistral
      const response = await this.client.chat.complete({
        model: 'mistral-small-latest',
        messages: [
          {
  role: 'system',
  content: `Eres un experto en ciberseguridad. Genera un correo de phishing simulado.
  Responde ÚNICAMENTE con un objeto JSON válido con las propiedades "asunto" y "contenido".
  El contenido debe ser texto plano con saltos de línea (usando \n). Sin etiquetas HTML.
  Ejemplo: {"asunto": "Actualización de seguridad", "contenido": "Estimado usuario,\n\nSu cuenta requiere verificación."}`
},
          {
            role: 'user',
            content: `Contexto para la simulación: ${contexto}. 
            El correo debe parecer legítimo pero tener señales de alerta sutiles.`
          } 
        ],
        temperature: 0.7,
        //  Si esta línea da error, coméntala o elimínala
        responseFormat: { type: 'json_object' },
      });

      // 2. Extraer el contenido de la respuesta de forma segura
      const rawContent = response?.choices?.[0]?.message?.content;
      
      // Log para depuración
      console.log(' Respuesta cruda de Mistral:', rawContent);

      let contentText: string;

      if (typeof rawContent === 'string') {
        contentText = rawContent;
      } else if (Array.isArray(rawContent)) {
        contentText = rawContent.map(chunk => 
          typeof chunk === 'string' ? chunk : (chunk as any).text || ''
        ).join('');
      } else {
        // Si es undefined o null, usamos fallback
        contentText = '{}';
      }

      // 3. Limpiar markdown y texto extra
      contentText = contentText
        .replace(/```json\s*/gi, '')
        .replace(/```\s*/g, '')
        .trim();

      // 4. Intentar parsear JSON
      let parsed: any;
      try {
        parsed = JSON.parse(contentText);
      } catch (parseError) {
        // Si falla, intentar extraer JSON del texto
        const jsonMatch = contentText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No se pudo extraer JSON de la respuesta de Mistral.');
        }
      }

      // 5. Asegurar que las propiedades existan
      const asunto = parsed?.asunto || 'Acción requerida: Verificación de seguridad';
      const contenido = parsed?.contenido || `<p>Estimado usuario,</p><p>Su cuenta requiere verificación.</p>`;

      return { asunto, contenido };

    } catch (error) {
      console.error(' Error en MistralAdapter:', error);
      // Fallback: devolver un correo genérico para no romper la experiencia
      return {
        asunto: 'Aviso de seguridad: verificación requerida',
        contenido: `<p>Estimado usuario,</p>
        <p>Hemos detectado actividad inusual en su cuenta. Por favor, verifique su identidad.</p>
        <p><strong>Atentamente,</strong><br>Departamento de Seguridad</p>`
      };
    }
  }
}