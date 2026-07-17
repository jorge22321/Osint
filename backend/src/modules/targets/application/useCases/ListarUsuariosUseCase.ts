//backend/src/modules/targets/application/useCases/ListarUsuariosUseCase.ts
import { IUsuarioObjetivoRepository } from '../../domain/ports/IUsuarioObjetivoRepository';
import { UsuarioObjetivo } from '../../domain/entities/UsuarioObjetivo';

export class ListarUsuariosUseCase {
  constructor(private repo: IUsuarioObjetivoRepository) {}

  async execute(organizacionId: string): Promise<UsuarioObjetivo[]> {
    if (!organizacionId) throw new Error('ID de organización es obligatorio.');
    return await this.repo.listar(organizacionId);
  }
}