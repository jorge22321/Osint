//backend/src/modules/dashboard/infrastructure/graphql/resolvers.ts
import { SupabaseDashboardRepository } from '../persistence/SupabaseDashboardRepository';
import { ObtenerMetricsUseCase } from '../../application/useCases/ObtenerMetricsUseCase';

const repo = new SupabaseDashboardRepository();

export const dashboardResolvers = {
  Query: {
    obtenerDashboardMetrics: async (_: any, { organizacionId }: { organizacionId: string }) => {
      const useCase = new ObtenerMetricsUseCase(repo);
      return await useCase.execute(organizacionId);
    },
  },
};