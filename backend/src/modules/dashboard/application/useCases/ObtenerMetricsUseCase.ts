//backend/src/modules/dashboard/application/useCases/ObtenerMetricsUseCase.ts
import { SupabaseDashboardRepository } from '../../infrastructure/persistence/SupabaseDashboardRepository';

export class ObtenerMetricsUseCase {
  constructor(private repo: SupabaseDashboardRepository) {}

  async execute(organizacionId: string) {
    if (!organizacionId) {
      throw new Error('El ID de la organización es obligatorio.');
    }
    return await this.repo.obtenerMetricas(organizacionId);
  }
}