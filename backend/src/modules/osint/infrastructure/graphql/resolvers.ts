//backend/src/modules/osint/infrastructure/graphql/resolvers.ts
import { EjecutarEscaneoDominioUseCase } from '../../application/useCases/EjecutarEscaneoDominioUseCase';
import { SupabaseOsintRepository } from '../persistence/SupabaseOsintRepository';
import { OsintAggregateAdapter } from '../providers/OsintAggregateAdapter';
import { HunterProvider } from '../providers/HunterProvider';
import { XposedOrNotProvider } from '../providers/XposedOrNotProvider';
import { ShodanProvider } from '../providers/ShodanProvider';
import { HibpProvider } from '../providers/HibpProvider';
import { BreachDirectoryProvider } from '../providers/BreachDirectoryProvider';
import { env } from '../../../../config/env';
import { GraphqlContext, requireDb, requireOrganization } from '../../../../shared/infrastructure/graphql/authContext';
const providers = [
  ...(env.HUNTER_API_KEY ? [{ nombre: 'Hunter.io', provider: new HunterProvider() }] : []),
  { nombre: 'Shodan InternetDB', provider: new ShodanProvider() },
  { nombre: 'XposedOrNot', provider: new XposedOrNotProvider() },
  ...(env.BREACH_DIRECTORY_KEY ? [{ nombre: 'BreachDirectory', provider: new BreachDirectoryProvider() }] : []),
  ...(env.HIBP_API_KEY ? [{ nombre: 'Have I Been Pwned', provider: new HibpProvider() }] : []),
];
const aggregateProvider = new OsintAggregateAdapter(providers);

export const osintResolvers = {
  Query: {
    osintLogs: async (_: any, { organizacionId }: any, context: GraphqlContext) => {
      const admin = requireOrganization(context, organizacionId);
      const repository = new SupabaseOsintRepository(requireDb(context));
      return await repository.obtenerPorOrganizacion(admin.id_organizacion);
    },
    osintLogsPage: async (_: any, { organizacionId, limit, offset }: any, context: GraphqlContext) => {
      const admin = requireOrganization(context, organizacionId);
      const repository = new SupabaseOsintRepository(requireDb(context));
      const page = await repository.obtenerPagina(admin.id_organizacion, limit, offset);
      return { ...page, hasMore: offset + page.items.length < page.total };
    },
  },
  Mutation: {
    osintScan: async (_: any, { dominio, organizacionId }: any, context: GraphqlContext) => {
      try {
        const admin = requireOrganization(context, organizacionId);
        const repository = new SupabaseOsintRepository(requireDb(context));
        const useCase = new EjecutarEscaneoDominioUseCase(aggregateProvider, repository);
        return await useCase.execute(dominio, admin.id_organizacion);
      } catch (error: any) {
        throw new Error(error.message);
      }
    },
    osintScanDetailed: async (_: any, { dominio, organizacionId }: any, context: GraphqlContext) => {
      const admin = requireOrganization(context, organizacionId);
      const repository = new SupabaseOsintRepository(requireDb(context));
      const useCase = new EjecutarEscaneoDominioUseCase(aggregateProvider, repository);
      const dominioNormalizado = useCase.normalizarDominio(dominio);
      const report = await aggregateProvider.escanearConEstado(dominioNormalizado, admin.id_organizacion);
      const logs = await useCase.guardar(report.hallazgos, admin.id_organizacion);
      return {
        logs,
        proveedores: report.proveedores,
        hallazgosEncontrados: report.hallazgos.length,
        nuevosGuardados: logs.length,
        duplicadosOmitidos: report.hallazgos.length - logs.length,
      };
    },
  },
};
