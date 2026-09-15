// backend/src/modules/campaigns/domain/ports/IEmailProvider.ts
export interface IEmailProvider {
  enviarEmail(destinatario: string, asunto: string, contenidoHtml: string): Promise<boolean>;
}