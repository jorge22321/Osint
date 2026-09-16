//backend/src/modules/dashboard/infrastructure/graphql/resolvers.ts
import { SupabaseDashboardRepository } from '../persistence/SupabaseDashboardRepository';
import { ObtenerMetricsUseCase } from '../../application/useCases/ObtenerMetricsUseCase';
import { GraphqlContext, requireDb, requireOrganization } from '../../../../shared/infrastructure/graphql/authContext';

export const dashboardResolvers = {
  Query: {
    obtenerDashboardMetrics: async (_: any, { organizacionId }: { organizacionId: string }, context: GraphqlContext) => {
      const admin = requireOrganization(context, organizacionId);
      const repo = new SupabaseDashboardRepository(requireDb(context));
      const useCase = new ObtenerMetricsUseCase(repo);
      return await useCase.execute(admin.id_organizacion);
    },
  },
};
