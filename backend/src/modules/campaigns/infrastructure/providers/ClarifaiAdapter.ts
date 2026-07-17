import OpenAI from 'openai';
import { IAiGenerator } from '../../domain/ports/IAiGenerator';

export class ClarifaiAdapter implements IAiGenerator {
  private client: OpenAI;
  private modelId: string;

  constructor() {
    // Configuramos el cliente de OpenAI para que apunte a Clarifai
    this.client = new OpenAI({
      baseURL: process.env.CLARIFAI_BASE_URL,
      apiKey: process.env.CLARIFAI_PAT,
    });
    this.modelId = process.env.CLARIFAI_MODEL_ID || '';
  }

 async generarEmailPhishing(contexto: string): Promise<{ asunto: string; contenido: string }> {
    try {
      // 1. Limpiamos espacios invisibles o saltos de línea del .env
      const cleanModelId = this.modelId.trim();

      // 2. Hacemos la petición más básica posible (solo rol "user", sin temperature)
      const response = await this.client.chat.completions.create({
        model: cleanModelId,
        messages: [
          { 
            role: "user", 
            content: `Actúa como un experto en ciberseguridad. Genera un correo de phishing simulado para este contexto: "${contexto}".
            
            REGLA ESTRICTA: Tu respuesta debe ser ÚNICAMENTE un objeto JSON válido. No agregues texto antes ni después. No uses etiquetas markdown como \`\`\`json.
            El JSON debe tener exactamente dos propiedades: "asunto" (string) y "contenido" (string con el código HTML del correo).` 
          }
        ]
      });

      let aiResponse = response.choices[0]?.message?.content;
      
      if (!aiResponse) {
        throw new Error("La IA no devolvió ninguna respuesta.");
      }

      // Limpieza de seguridad por si acaso
      aiResponse = aiResponse.replace(/```json/gi, '').replace(/```/g, '').trim();

      // Parseamos la respuesta
      const parsedResponse = JSON.parse(aiResponse);
      
      return {
        asunto: parsedResponse.asunto,
        contenido: parsedResponse.contenido
      };

    } catch (error) {
      console.error("Error al generar contenido con Clarifai:", error);
      throw new Error("No se pudo generar el contenido de la simulación.");
    }
  }
}