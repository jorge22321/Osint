// backend/src/modules/campaigns/application/useCases/GenerarContenidoIaUseCase.ts

import { IAiGenerator } from '../../domain/ports/IAiGenerator';
import { IOsintRepository } from '../../../osint/domain/ports/IOsintRepository';

export interface GenerarContenidoParams {
  osintLogId: string;
  departamento: string;
  tipoSimulacion: string;
  nombreObjetivo?: string;
  cargoObjetivo?: string;
}

export class GenerarContenidoIaUseCase {
  constructor(
    private aiGenerator: IAiGenerator,
    private osintRepo: IOsintRepository
  ) {}

  async execute(params: GenerarContenidoParams) {
    const { osintLogId, departamento, tipoSimulacion, nombreObjetivo, cargoObjetivo } = params;
    
    // 🛡️ Escudo de seguridad para evitar enviar valores nulos o "undefined" a Postgres
    if (!osintLogId || osintLogId === 'undefined' || osintLogId.trim() === '') {
      throw new Error("Se requiere un ID de log OSINT válido para generar la campaña.");
    }

    // 1. Buscamos la inteligencia (OSINT)
    const osintData = await this.osintRepo.obtenerLogPorId(osintLogId);
    
    if (!osintData) {
      throw new Error(`No se encontraron datos OSINT para el ID: ${osintLogId}`);
    }

    // 2. Lógica dinámica para el formato del ataque
    const esSmishing = tipoSimulacion?.toLowerCase() === 'smishing';
    const formato = esSmishing 
      ? 'un mensaje de texto (SMS) corto, muy urgente, de máximo 160 caracteres' 
      : 'un correo electrónico corporativo formal y persuasivo (incluyendo el Asunto)';

    // 3. Lógica dinámica para la víctima
    const targetInfo = nombreObjetivo 
      ? `Dirígete específicamente a ${nombreObjetivo}, quien ocupa el cargo de ${cargoObjetivo || 'empleado'} en el departamento de ${departamento}.`
      : `Dirígete de forma general al departamento de ${departamento}.`;

    // 4. Prompt para el motor de IA
    const contextoArmado = `
      Eres un Red Teamer experto creando simulaciones de ataques cibernéticos.
      Tu objetivo es redactar ${formato}.
      ${targetInfo}

      Utiliza la siguiente inteligencia (OSINT) descubierta sobre su infraestructura o credenciales como pretexto para el engaño:
      - Tipo de hallazgo: ${osintData.tipo_hallazgo}
      - Detalles técnicos (JSON): ${JSON.stringify(osintData.detalle_json)}

      Reglas estrictas:
      1. El mensaje debe ser hiperrealista, profesional y generar un fuerte sentido de urgencia o curiosidad.
      2. NUNCA menciones que esto es una simulación, una prueba o un ejercicio.
      3. Integra los detalles técnicos del JSON de forma natural para ganar autoridad y credibilidad.
      ${esSmishing ? '4. Al ser SMS, sé directo, omite saludos largos y pide hacer clic en un enlace urgente.' : ''}
    `;

    // 5. Generamos el contenido
    return await this.aiGenerator.generarEmailPhishing(contextoArmado);
  }
}