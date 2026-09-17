//backend/src/modules/campaigns/domain/ports/IEnvioRepository.ts
import { DeliveryResult } from './DeliveryResult';

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
  provider_message_id?: string | null;
  provider_status?: string | null;
  provider_error_code?: string | null;
  provider_error_message?: string | null;
  fecha_estado_proveedor?: Date | null;
  intentos?: number;
}

export interface IEnvioRepository {
  crear(envio: Omit<Envio, 'id'>): Promise<Envio>;
  actualizarEstado(id: string, estado: string, fechaEnvio?: Date | null, result?: DeliveryResult): Promise<Envio>;
  listarPendientesProgramados(hasta: Date): Promise<EnvioProgramado[]>;
  listarSmsEnSeguimiento(): Promise<Array<{ id: string; provider_message_id: string }>>;
  actualizarEstadoProveedor(id: string, result: DeliveryResult): Promise<void>;
}

export interface EnvioProgramado extends Envio {
  id: string;
  vector: 'email' | 'sms';
  contacto_destino: string;
}
