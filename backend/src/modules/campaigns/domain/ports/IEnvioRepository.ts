//backend/src/modules/campaigns/domain/ports/IEnvioRepository.ts
export interface Envio {
  id?: string;
  id_campana: string;
  id_usuario_objetivo: string;
  tracking_code: string;
  estado: string;
  asunto_generado: string;
  contenido_generado: string;
  fecha_envio?: Date | null;
  fecha_click?: Date | null;
  fecha_reporte?: Date | null;
}

export interface IEnvioRepository {
  crear(envio: Omit<Envio, 'id'>): Promise<Envio>;
  actualizarEstado(id: string, estado: string, fechaEnvio?: Date | null): Promise<Envio>;
  listarPendientesProgramados(hasta: Date): Promise<EnvioProgramado[]>;
}

export interface EnvioProgramado extends Envio {
  id: string;
  vector: 'email' | 'sms';
  contacto_destino: string;
}
