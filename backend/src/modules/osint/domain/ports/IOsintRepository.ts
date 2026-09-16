//backend/src/modules/osint/domain/ports/IOsintRepository.ts
import { OsintLog } from '../entities/OsintLog';

export interface IOsintRepository {
  guardarHallazgos(hallazgos: OsintLog[]): Promise<OsintLog[]>;
  obtenerPorOrganizacion(organizacionId: string): Promise<OsintLog[]>;
  obtenerPagina(organizacionId: string, limit: number, offset: number): Promise<{ items: OsintLog[]; total: number }>;
  obtenerLogPorId(id: string): Promise<OsintLog | null>;
}
