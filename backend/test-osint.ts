// backend/test-osint.ts
import 'dotenv/config'; // Carga de variables de entorno
import { OsintAggregateAdapter } from './src/modules/osint/infrastructure/providers/OsintAggregateAdapter';
import { EjecutarEscaneoDominioUseCase } from './src/modules/osint/application/useCases/EjecutarEscaneoDominioUseCase';
import { IOsintRepository } from './src/modules/osint/domain/ports/IOsintRepository';

// 1. Creamos un repositorio simulado en memoria
// Esto evita que la prueba falle si Supabase no está conectado aún.
const mockOsintRepository: IOsintRepository = {
  async guardarLog(log) {
    console.log("\n [Mock Repositorio] Simulando guardado en la tabla 'osint_logs'...");
    console.log(` Datos a guardar: ${log.total_correos} correos, ${log.puertos.length} puertos.`);
    return { id: "simulated-log-uuid-12345" };
  }
};

async function probarOSINT() {
  console.log(" Inicializando componentes de Arquitectura Hexagonal...");
  
  // 2. Instanciamos el adaptador de infraestructura
  const osintProvider = new OsintAggregateAdapter();
  
  // 3. Instanciamos el Caso de Uso inyectando sus dependencias (Puerto -> Adaptador)
  const escaneoUseCase = new EjecutarEscaneoDominioUseCase(osintProvider, mockOsintRepository);

  // 4. Configuración del objetivo de prueba
  // Tip profesional: Usa un dominio conocido o público para verificar la respuesta de Hunter
  const dominioPrueba = "adobe.com"; 
  const organizacionIdDummy = "d6fe1c85-f52c-4a4e-8177-92653e3f4478"; // El UUID de CyberCorp

  console.log(`\n Iniciando recolección OSINT pasiva para: "${dominioPrueba}"...`);

  try {
    // 5. Ejecución del flujo lógico de la aplicación
    const resultado = await escaneoUseCase.execute(dominioPrueba, organizacionIdDummy);
    
    console.log("\n ¡ESCANEO FINALIZADO CON ÉXITO!");
    console.log("--------------------------------------------------");
    console.log(` Correos indexados encontrados: ${resultado.data.correosEncontrados.length}`);
    
   if (resultado.data.correosEncontrados.length > 0) {
      console.log(" Muestra de credenciales expuestas encontradas:");
      
      // Creamos una versión limpia y resumida solo para la tabla visual
      const tablaLimpia = resultado.data.correosEncontrados.slice(0, 3).map(correo => ({
        'Correo Electrónico': correo.email,
        'Nombre': correo.nombre || 'Desconocido',
        // Si el cargo es muy largo, lo cortamos a 30 caracteres
        'Cargo': correo.cargo ? (correo.cargo.length > 30 ? correo.cargo.substring(0, 30) + '...' : correo.cargo) : 'N/A',
        '¿Filtrado (Brecha)?': correo.filtrado ? ' SÍ COMPROMETIDO' : ' Seguro'
      }));

      console.table(tablaLimpia);
    }
    console.log(`\n Puertos abiertos mapeados (Shodan):`, resultado.data.puertosAbiertos);
    console.log(` Vulnerabilidades asociadas:`, resultado.data.vulnerabilidadesDetectadas);
    console.log("--------------------------------------------------");
    console.log(` ID de registro generado: ${resultado.logId}`);

  } catch (error) {
    console.error("\n Error durante la ejecución de la prueba OSINT:", error);
  }
}

// Ejecutar prueba
probarOSINT();