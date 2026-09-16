// src/modules/iam/infrastructure/graphql/resolvers.ts
import { AutenticarAdminUseCase } from '../../application/useCases/AutenticarAdminUseCase';
import { SupabaseAdminRepository } from '../persistence/SupabaseAdminRepository';
import { GraphqlContext, requireAdmin } from '../../../../shared/infrastructure/graphql/authContext';

const adminRepo = new SupabaseAdminRepository();
const autenticarUseCase = new AutenticarAdminUseCase(adminRepo);

export const iamResolvers = {
  Query: {
    me: (_: any, __: any, context: GraphqlContext) => requireAdmin(context),
  },
  Mutation: {
    loginAdmin: async (_: any, { email, contrasena }: any) => {
      try {
        return await autenticarUseCase.execute(email, contrasena);
      } catch (error: any) {
        // GraphQL elevará automáticamente este error al frontend
        throw new Error(error.message);
      }
    },
  },
};
