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

    const dominioNormalizado = this.normalizarDominio(dominio);
    const hallazgos = await this.osintProvider.escanear(dominioNormalizado, organizacionId);

    return this.guardar(hallazgos, organizacionId);
  }

  async guardar(hallazgos: Awaited<ReturnType<IOsintProvider['escanear']>>, organizacionId: string): Promise<OsintLog[]> {

    const logs: OsintLog[] = hallazgos.map(h => ({
      id_organizacion: organizacionId,
      id_usuario_objetivo: h.id_usuario_objetivo || null,
      fuente: h.fuente,
      tipo_hallazgo: h.tipo_hallazgo,
      detalle_json: h.detalle_json,
    }));

    // Guardar y obtener los registros con ID
    return await this.osintRepository.guardarHallazgos(logs);
  }

  normalizarDominio(dominio: string): string {
    const value = dominio.trim().toLowerCase();
    let hostname = value;
    try {
      hostname = new URL(value.includes('://') ? value : `https://${value}`).hostname;
    } catch {
      throw new Error('El dominio ingresado no es válido. Ejemplo: empresa.com');
    }
    hostname = hostname.replace(/^www\./, '').replace(/\.$/, '');
    if (!/^(?=.{4,253}$)(?!-)(?:[a-z0-9-]{1,63}\.)+[a-z]{2,63}$/i.test(hostname)) {
      throw new Error('El dominio ingresado no es válido. Ejemplo: empresa.com');
    }
    return hostname;
  }
}
