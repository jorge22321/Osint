import { SupabaseUsuarioObjetivoRepository } from '../persistence/SupabaseUsuarioObjetivoRepository';
import { ListarUsuariosUseCase } from '../../application/useCases/ListarUsuariosUseCase';
import { CrearUsuarioUseCase } from '../../application/useCases/CrearUsuarioUseCase';
import { ActualizarUsuarioUseCase } from '../../application/useCases/ActualizarUsuarioUseCase';
import { EliminarUsuarioUseCase } from '../../application/useCases/EliminarUsuarioUseCase';
import { GraphqlContext, requireAdmin, requireDb, requireOrganization } from '../../../../shared/infrastructure/graphql/authContext';

export const targetsResolvers = {
  Query: {
    usuarios: async (_: any, { organizacionId }: any, context: GraphqlContext) => {
      const admin = requireOrganization(context, organizacionId);
      const repo = new SupabaseUsuarioObjetivoRepository(requireDb(context));
      const useCase = new ListarUsuariosUseCase(repo);
      return await useCase.execute(admin.id_organizacion);
    },
    usuario: async (_: any, { id }: any, context: GraphqlContext) => {
      const admin = requireAdmin(context);
      const repo = new SupabaseUsuarioObjetivoRepository(requireDb(context));
      const usuario = await repo.buscarPorId(id);
      if (usuario && usuario.id_organizacion !== admin.id_organizacion) throw new Error('No tienes acceso a este empleado.');
      return usuario;
    },
  },
  Mutation: {
    crearUsuario: async (_: any, { input, organizacionId }: any, context: GraphqlContext) => {
      const admin = requireOrganization(context, organizacionId);
      const repo = new SupabaseUsuarioObjetivoRepository(requireDb(context));
      const useCase = new CrearUsuarioUseCase(repo);
      return await useCase.execute({ ...input, id_organizacion: admin.id_organizacion });
    },
    actualizarUsuario: async (_: any, { id, input }: any, context: GraphqlContext) => {
      const admin = requireAdmin(context);
      const repo = new SupabaseUsuarioObjetivoRepository(requireDb(context));
      const usuario = await repo.buscarPorId(id);
      if (!usuario || usuario.id_organizacion !== admin.id_organizacion) throw new Error('No tienes acceso a este empleado.');
      const useCase = new ActualizarUsuarioUseCase(repo);
      return await useCase.execute(id, input);
    },
    eliminarUsuario: async (_: any, { id }: any, context: GraphqlContext) => {
      const admin = requireAdmin(context);
      const repo = new SupabaseUsuarioObjetivoRepository(requireDb(context));
      const usuario = await repo.buscarPorId(id);
      if (!usuario || usuario.id_organizacion !== admin.id_organizacion) throw new Error('No tienes acceso a este empleado.');
      const useCase = new EliminarUsuarioUseCase(repo);
      await useCase.execute(id);
      return true;
    },
  },
};
