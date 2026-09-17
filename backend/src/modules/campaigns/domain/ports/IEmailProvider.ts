// backend/src/modules/campaigns/domain/ports/IEmailProvider.ts
import { DeliveryResult } from './DeliveryResult';
export interface IEmailProvider {
  enviarEmail(destinatario: string, asunto: string, contenidoHtml: string): Promise<DeliveryResult>;
}
