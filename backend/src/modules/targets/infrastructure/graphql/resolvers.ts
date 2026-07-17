import { SupabaseUsuarioObjetivoRepository } from '../persistence/SupabaseUsuarioObjetivoRepository';
import { ListarUsuariosUseCase } from '../../application/useCases/ListarUsuariosUseCase';
import { CrearUsuarioUseCase } from '../../application/useCases/CrearUsuarioUseCase';
import { ActualizarUsuarioUseCase } from '../../application/useCases/ActualizarUsuarioUseCase';
import { EliminarUsuarioUseCase } from '../../application/useCases/EliminarUsuarioUseCase';

const repo = new SupabaseUsuarioObjetivoRepository();

export const targetsResolvers = {
  Query: {
    usuarios: async (_: any, { organizacionId }: any) => {
      const useCase = new ListarUsuariosUseCase(repo);
      return await useCase.execute(organizacionId);
    },
    usuario: async (_: any, { id }: any) => {
      return await repo.buscarPorId(id);
    },
  },
  Mutation: {
    crearUsuario: async (_: any, { input, organizacionId }: any) => {
      const useCase = new CrearUsuarioUseCase(repo);
      return await useCase.execute({ ...input, id_organizacion: organizacionId });
    },
    actualizarUsuario: async (_: any, { id, input }: any) => {
      const useCase = new ActualizarUsuarioUseCase(repo);
      return await useCase.execute(id, input);
    },
    eliminarUsuario: async (_: any, { id }: any) => {
      const useCase = new EliminarUsuarioUseCase(repo);
      await useCase.execute(id);
      return true;
    },
  },
};