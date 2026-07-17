//backend/src/modules/campaigns/application/useCases/GenerarContenidoIaUseCase.ts
import { IAiGenerator } from '../../domain/ports/IAiGenerator';

export class GenerarContenidoIaUseCase {
  constructor(private aiGenerator: IAiGenerator) {}

  async execute(contexto: string) {
    if (!contexto || contexto.trim().length === 0) {
      throw new Error("El contexto para la campaña no puede estar vacío.");
    }

    // Llamamos a la IA
    const resultado = await this.aiGenerator.generarEmailPhishing(contexto);
    
    return resultado;
  }
}