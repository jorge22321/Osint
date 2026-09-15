import nodemailer from 'nodemailer';
import { IEmailProvider } from '../../domain/ports/IEmailProvider';

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

  async enviarEmail(destinatario: string, asunto: string, contenidoHtml: string): Promise<boolean> {
    try {
      await this.transporter.sendMail({
        from: `"Seguridad TI" <${process.env.GMAIL_USER}>`,
        to: destinatario,
        subject: asunto,
        html: contenidoHtml,
      });
      return true;
    } catch (error) {
      console.error('Error al enviar email simulado:', error);
      return false;
    }
  }
}