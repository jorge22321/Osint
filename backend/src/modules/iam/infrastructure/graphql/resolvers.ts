// src/modules/iam/infrastructure/graphql/resolvers.ts
import { AutenticarAdminUseCase } from '../../application/useCases/AutenticarAdminUseCase';
import { SupabaseAdminRepository } from '../persistence/SupabaseAdminRepository';

const adminRepo = new SupabaseAdminRepository();
const autenticarUseCase = new AutenticarAdminUseCase(adminRepo);

export const iamResolvers = {
  Query: {
    me: () => null, // Lo implementaremos más adelante para validar sesiones de JWT
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