// src/modules/iam/domain/ports/IAdminRepository.ts

export interface AuthResponse {
  token: string;
  admin: {
    id: string;
    id_organizacion: string;
    nombre: string;
    email: string;
    rol: string;
    dominio?: string;
  };
}

export interface IAdminRepository {
  // Define que cualquier adaptador de autenticación debe cumplir con esta función
  autenticar(email: string, contrasena: string): Promise<AuthResponse>;
}