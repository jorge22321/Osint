// src/modules/iam/application/useCases/AutenticarAdminUseCase.ts
import { IAdminRepository, AuthResponse } from '../../domain/ports/IAdminRepository';

export class AutenticarAdminUseCase {
  constructor(private adminRepo: IAdminRepository) {}

  async execute(email: string, contrasena: string): Promise<AuthResponse> {
    if (!email || !contrasena) {
      throw new Error('El email y la contraseña son obligatorios.');
    }
    
    // Ejecuta la autenticación a través del puerto
    return await this.adminRepo.autenticar(email, contrasena);
  }
}