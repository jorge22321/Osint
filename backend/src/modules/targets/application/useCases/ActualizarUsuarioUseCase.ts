//backend/src/modules/targets/application/useCases/ActualizarUsuarioUseCase.ts
import { IUsuarioObjetivoRepository } from '../../domain/ports/IUsuarioObjetivoRepository';
import { UsuarioObjetivo } from '../../domain/entities/UsuarioObjetivo';

export class ActualizarUsuarioUseCase {
  constructor(private repo: IUsuarioObjetivoRepository) {}

  async execute(id: string, data: Partial<UsuarioObjetivo>): Promise<UsuarioObjetivo> {
    if (!id) throw new Error('ID de usuario es obligatorio.');
    if (Object.keys(data).length === 0) throw new Error('No hay datos para actualizar.');
    
    // Validar que el usuario existe
    const existente = await this.repo.buscarPorId(id);
    if (!existente) throw new Error('Usuario no encontrado.');
    
    // Si se está actualizando el email, validar que no esté duplicado en la misma organización
    if (data.email && data.email !== existente.email) {
      const duplicado = await this.repo.buscarPorEmail(data.email, existente.id_organizacion);
      if (duplicado) throw new Error('El correo ya está registrado en esta organización.');
    }
    
    return await this.repo.actualizar(id, data);
  }
}