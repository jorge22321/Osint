//backend/src/modules/targets/application/useCases/EliminarUsuarioUseCase.ts
import { IUsuarioObjetivoRepository } from '../../domain/ports/IUsuarioObjetivoRepository';

export class EliminarUsuarioUseCase {
  constructor(private repo: IUsuarioObjetivoRepository) {}

  async execute(id: string): Promise<void> {
    if (!id) throw new Error('ID de usuario es obligatorio.');
    
    const existente = await this.repo.buscarPorId(id);
    if (!existente) throw new Error('Usuario no encontrado.');
    
    await this.repo.eliminar(id);
  }
}