//bakcend/src/modules/campaigns/domain/ports/IAiGenerator.ts
export interface IAiGenerator {
  /**
   * Genera el asunto y el contenido de un correo de phishing simulado.
   * @param contexto Descripción del tipo de campaña (ej. "Reinicio de contraseña de RRHH")
   */
  generarEmailPhishing(contexto: string): Promise<{ asunto: string; contenido: string }>;
}