import twilio from 'twilio';
import { ISmsProvider } from '../../domain/ports/ISmsProvider';

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

  async enviarSms(numeroDestino: string, mensaje: string): Promise<boolean> {
    try {
      await this.client.messages.create({
        body: mensaje,
        from: this.fromNumber,
        to: numeroDestino,
      });
      return true;
    } catch (error) {
      console.error('Error al enviar SMS simulado:', error);
      return false;
    }
  }
}