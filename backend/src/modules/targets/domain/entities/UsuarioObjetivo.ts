//backend/src/modules/targets/domain/entities/UsuarioObjetivo.ts
export interface UsuarioObjetivo {
  id?: string;
  id_organizacion: string;
  nombre: string;
  email: string;
  telefono?: string | null;
  departamento?: string | null;
  cargo?: string | null;
  risk_score: number; // 0-100
  estado: 'Activo' | 'Inactivo';
  creado_en?: Date;
}
