//backend/src/modules/osint/domain/ports/IOsintProvider.ts
export interface OsintHallazgo {
  fuente: string;
  tipo_hallazgo: string;
  detalle_json: Record<string, any>;
  id_usuario_objetivo?: string | null;
}

export interface IOsintProvider {
  escanear(dominio: string, organizacionId: string): Promise<OsintHallazgo[]>;
}