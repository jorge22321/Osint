//backend/src/modules/osint/infrastructure/graphql/resolvers.ts
import { EjecutarEscaneoDominioUseCase } from '../../application/useCases/EjecutarEscaneoDominioUseCase';
import { SupabaseOsintRepository } from '../persistence/SupabaseOsintRepository';
import { OsintAggregateAdapter } from '../providers/OsintAggregateAdapter';
import { HunterProvider } from '../providers/HunterProvider';
import { XposedOrNotProvider } from '../providers/XposedOrNotProvider';
import { ShodanProvider } from '../providers/ShodanProvider';
const repository = new SupabaseOsintRepository();
const hunterProvider = new HunterProvider();
const xposedOrNotProvider = new XposedOrNotProvider();
const shodanProvider = new ShodanProvider();
const aggregateProvider = new OsintAggregateAdapter([hunterProvider, shodanProvider]);
const useCase = new EjecutarEscaneoDominioUseCase(aggregateProvider, repository);

export const osintResolvers = {
  Query: {
    osintLogs: async (_: any, { organizacionId }: any) => {
      return await repository.obtenerPorOrganizacion(organizacionId);
    },
  },
  Mutation: {
    osintScan: async (_: any, { dominio, organizacionId }: any) => {
      try {
        return await useCase.execute(dominio, organizacionId);
      } catch (error: any) {
        throw new Error(error.message);
      }
    },
  },
};