//backend/src/modules/osint/application/useCases/EjecutarEscaneoDominioUseCase.ts
import { IOsintProvider } from '../../domain/ports/IOsintProvider';
import { IOsintRepository } from '../../domain/ports/IOsintRepository';
import { OsintLog } from '../../domain/entities/OsintLog';

export class EjecutarEscaneoDominioUseCase {
  constructor(
    private osintProvider: IOsintProvider,
    private osintRepository: IOsintRepository,
  ) {}

  async execute(dominio: string, organizacionId: string): Promise<OsintLog[]> {
    if (!dominio || !organizacionId) {
      throw new Error('Dominio y organización son obligatorios.');
    }

    const hallazgos = await this.osintProvider.escanear(dominio, organizacionId);

    const logs: OsintLog[] = hallazgos.map(h => ({
      id_organizacion: organizacionId,
      id_usuario_objetivo: h.id_usuario_objetivo || null,
      fuente: h.fuente,
      tipo_hallazgo: h.tipo_hallazgo,
      detalle_json: h.detalle_json,
    }));

    // Guardar y obtener los registros con ID
    const savedLogs = await this.osintRepository.guardarHallazgos(logs);
    return savedLogs; // Ahora tienen ID
  }
}