// backend/test-ia.ts
import 'dotenv/config'; // Carga las variables de tu .env automáticamente
import { ClarifaiAdapter } from './src/modules/campaigns/infrastructure/providers/ClarifaiAdapter';
import { GenerarContenidoIaUseCase } from './src/modules/campaigns/application/useCases/GenerarContenidoIaUseCase';

async function probarIA() {
  console.log(" Iniciando conexión con Clarifai...");
  
  try {
    // 1. Instanciamos el adaptador (Infraestructura)
    const aiProvider = new ClarifaiAdapter();
    
    // 2. Instanciamos el caso de uso inyectando el adaptador (Aplicación)
    const generarContenidoUseCase = new GenerarContenidoIaUseCase(aiProvider);

    // 3. Definimos un contexto de prueba
    const contextoPrueba = "Urgente: Actualización obligatoria de políticas de vacaciones RRHH";
    console.log(`\n Pidiéndole a la IA que genere un correo para: "${contextoPrueba}"...\n`);

    // 4. Ejecutamos el caso de uso
    const resultado = await generarContenidoUseCase.execute(contextoPrueba);
    
    console.log(" ¡ÉXITO! Respuesta generada:\n");
    console.log(" ASUNTO:", resultado.asunto);
    console.log(" CONTENIDO HTML:\n", resultado.contenido);
    
  } catch (error) {
    console.error(" Falló la prueba:", error);
  }
}

// Ejecutamos la función
probarIA();