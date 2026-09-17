// backend/src/modules/campaigns/domain/ports/ISmsProvider.ts
import { DeliveryResult } from './DeliveryResult';
export interface ISmsProvider {
  enviarSms(numeroDestino: string, mensaje: string): Promise<DeliveryResult>;
  consultarEstado(providerId: string): Promise<DeliveryResult>;
}
