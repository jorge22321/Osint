//backend/src/modules/osint/domain/ports/IOsintRepository.ts
import { OsintLog } from '../entities/OsintLog';

export interface IOsintRepository {
  guardarHallazgos(hallazgos: OsintLog[]): Promise<OsintLog[]>; // cambia void → OsintLog[]
  obtenerPorOrganizacion(organizacionId: string): Promise<OsintLog[]>;
}