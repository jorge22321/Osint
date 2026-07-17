//backend/src/modules/targets/domain/ports/IUsuarioObjetivoRepository.ts
import { UsuarioObjetivo } from '../entities/UsuarioObjetivo';

export interface IUsuarioObjetivoRepository {
  listar(organizacionId: string): Promise<UsuarioObjetivo[]>;
  crear(usuario: Omit<UsuarioObjetivo, 'id' | 'creado_en'>): Promise<UsuarioObjetivo>;
  actualizar(id: string, data: Partial<UsuarioObjetivo>): Promise<UsuarioObjetivo>;
  eliminar(id: string): Promise<void>;
  buscarPorEmail(email: string, organizacionId: string): Promise<UsuarioObjetivo | null>;
  buscarPorId(id: string): Promise<UsuarioObjetivo | null>;
}