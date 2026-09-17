import nodemailer from 'nodemailer';
import { IEmailProvider } from '../../domain/ports/IEmailProvider';
import { DeliveryResult, safeDeliveryError } from '../../domain/ports/DeliveryResult';

export class NodemailerAdapter implements IEmailProvider {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER, // Tu correo de Gmail
        pass: process.env.GMAIL_APP_PASSWORD, // Contraseña de aplicación de Google
      },
    });
  }

  async enviarEmail(destinatario: string, asunto: string, contenidoHtml: string): Promise<DeliveryResult> {
    try {
      const sent = await this.transporter.sendMail({
        from: `"Seguridad TI" <${process.env.GMAIL_USER}>`,
        to: destinatario,
        subject: asunto,
        html: contenidoHtml,
      });
      return { accepted: true, providerId: sent.messageId, providerStatus: 'accepted' };
    } catch (error) {
      const safeError = safeDeliveryError(error);
      console.error(`[Correo] ${safeError.errorCode}: ${safeError.errorMessage}`);
      return { accepted: false, ...safeError };
    }
  }
}
