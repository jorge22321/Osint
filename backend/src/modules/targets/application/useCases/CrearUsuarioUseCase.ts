//backend/src/modules/targets/application/useCases/CrearUsuarioUseCase.ts
import { IUsuarioObjetivoRepository } from '../../domain/ports/IUsuarioObjetivoRepository';
import { UsuarioObjetivo } from '../../domain/entities/UsuarioObjetivo';

export class CrearUsuarioUseCase {
  constructor(private repo: IUsuarioObjetivoRepository) {}

  async execute(data: Omit<UsuarioObjetivo, 'id' | 'creado_en'>): Promise<UsuarioObjetivo> {
    // Validaciones básicas
    if (!data.nombre || !data.email || !data.id_organizacion) {
      throw new Error('Nombre, email y organización son obligatorios.');
    }
    // Asignar risk_score inicial
    data.risk_score = data.risk_score ?? 100;
    data.estado = data.estado ?? 'Activo';
    return await this.repo.crear(data);
  }
}