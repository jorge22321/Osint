//backend/src/modules/osint/domain/entities/OsintLog.ts
export interface OsintLog {
  id?: string;
  id_organizacion: string;
  id_usuario_objetivo?: string | null;
  fuente: string;          // 'Hunter.io', 'HIBP', 'Shodan', etc.
  tipo_hallazgo: string;   // 'Email filtrado', 'Puerto expuesto', etc.
  detalle_json: Record<string, any>; // Datos estructurados
  creado_en?: Date;
}