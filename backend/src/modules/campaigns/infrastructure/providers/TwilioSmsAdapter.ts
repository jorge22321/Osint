import twilio from 'twilio';
import { ISmsProvider } from '../../domain/ports/ISmsProvider';
import { DeliveryResult, safeDeliveryError } from '../../domain/ports/DeliveryResult';

export class TwilioSmsAdapter implements ISmsProvider {
  private client;
  private fromNumber;

  constructor() {
    this.client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    this.fromNumber = process.env.TWILIO_PHONE_NUMBER;
  }

  async enviarSms(numeroDestino: string, mensaje: string): Promise<DeliveryResult> {
    try {
      const sent = await this.client.messages.create({
        body: mensaje,
        from: this.fromNumber,
        to: numeroDestino,
      });
      return { accepted: true, providerId: sent.sid, providerStatus: sent.status };
    } catch (error) {
      const safeError = safeDeliveryError(error);
      console.error(`[Twilio] ${safeError.errorCode}: ${safeError.errorMessage}`);
      return { accepted: false, ...safeError };
    }
  }

  async consultarEstado(providerId: string): Promise<DeliveryResult> {
    try {
      const message = await this.client.messages(providerId).fetch();
      return { accepted: true, providerId, providerStatus: message.status, errorCode: message.errorCode ? String(message.errorCode) : undefined,
        errorMessage: message.errorMessage ? safeDeliveryError({ message: message.errorMessage }).errorMessage : undefined };
    } catch (error) {
      return { accepted: false, ...safeDeliveryError(error) };
    }
  }
}
