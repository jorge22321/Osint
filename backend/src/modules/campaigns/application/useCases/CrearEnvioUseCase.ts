import { IEnvioRepository, Envio } from '../../domain/ports/IEnvioRepository';
import { ISmsProvider } from '../../domain/ports/ISmsProvider';
import { IEmailProvider } from '../../domain/ports/IEmailProvider';
import { ICampaignRepository } from '../../domain/ports/ICampaignRepository';
import { env } from '../../../../config/env';
import { DeliveryResult, safeDeliveryError } from '../../domain/ports/DeliveryResult';

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[character]!);

export class CrearEnvioUseCase {
  constructor(
    private envioRepo: IEnvioRepository,
    private emailProvider: IEmailProvider,
    private smsProvider: ISmsProvider,
    private campaignRepo: ICampaignRepository
  ) {}

  private processingIds = new Set<string>();

  private async despachar(envio: Envio, vector: string, contactoDestino: string): Promise<Envio> {
    if (!envio.id) throw new Error('El envío debe estar persistido antes de despacharse.');
    if (!contactoDestino) {
      return this.envioRepo.actualizarEstado(envio.id, 'Fallido', null, { accepted: false, errorCode: 'NO_DESTINATION', errorMessage: 'El destinatario no tiene un dato de contacto válido.' });
    }

    let result: DeliveryResult;
    try {
      if (vector === 'email') {
        if (!envio.asunto_generado) throw new Error('El asunto es obligatorio para email.');
        result = await this.emailProvider.enviarEmail(contactoDestino, envio.asunto_generado, envio.contenido_generado);
      } else if (vector === 'sms') {
        result = await this.smsProvider.enviarSms(contactoDestino, envio.contenido_generado);
      } else {
        throw new Error('Vector no soportado. Debe ser "email" o "sms".');
      }
    } catch (error) {
      const safeError = safeDeliveryError(error);
      console.error(`[Envío ${vector}] ${safeError.errorCode}: ${safeError.errorMessage}`);
      result = { accepted: false, ...safeError };
    }

    return this.envioRepo.actualizarEstado(
      envio.id,
      result.accepted ? 'Aceptado' : 'Fallido',
      result.accepted ? new Date() : null,
      result
    );
  }

  async execute(
    envioData: Omit<Envio, 'id'>,
    vector: string,
    contactoDestino: string
  ): Promise<Envio> {
    
    // 1. Validaciones
    if (!envioData.id_campana || !envioData.id_usuario_objetivo) {
      throw new Error('ID de campaña y usuario objetivo son obligatorios.');
    }
    if (!envioData.contenido_generado) {
      throw new Error('El contenido del envío es obligatorio.');
    }
    if (!envioData.tracking_code) {
      throw new Error('El código de tracking es obligatorio.');
    }

    // 2. Inyectar un enlace único para registrar el clic y abrir la capacitación.
    let contenidoFinal = envioData.contenido_generado;
    const trackingUrl = `${env.PUBLIC_BASE_URL}/track/click/${encodeURIComponent(envioData.tracking_code)}`;
    if (vector === 'email') {
      // El editor trabaja en texto plano; el correo debe conservar sus saltos
      // de línea sin interpretar etiquetas escritas en el mensaje.
      contenidoFinal = escapeHtml(contenidoFinal).replace(/\r?\n/g, '<br/>');
      const pixelTracking = `<img src="${env.PUBLIC_BASE_URL}/track/open/${encodeURIComponent(envioData.tracking_code)}" width="1" height="1" style="display:none;" alt="" />`;
      const callToAction = `<p style="margin-top:24px"><a href="${trackingUrl}" style="display:inline-block;padding:12px 20px;background:#2563eb;color:#fff;text-decoration:none;border-radius:6px;font-weight:600">Revisar información</a></p>`;
      contenidoFinal += `${callToAction}${pixelTracking}`;
    } else {
      contenidoFinal += `\n\nMás información: ${trackingUrl}`;
    }
    envioData.contenido_generado = contenidoFinal;

    // 3. Persistir primero. Así el enlace ya existe cuando el destinatario lo abra.
    envioData.estado = 'En Cola';
    envioData.fecha_envio = null;
    const envioCreado = await this.envioRepo.crear(envioData);

    // 4. Respetar la fecha/hora de la campaña. Si ya venció, despachar ahora.
    const campaign = await this.campaignRepo.buscarPorId(envioData.id_campana);
    const scheduledAt = campaign?.fecha_programada ? new Date(campaign.fecha_programada) : new Date();
    if (scheduledAt.getTime() <= Date.now()) {
      return this.despachar(envioCreado, vector, contactoDestino);
    }

    return envioCreado;
  }

  async procesarPendientes(): Promise<number> {
    const pendientes = await this.envioRepo.listarPendientesProgramados(new Date());
    let procesados = 0;

    for (const envio of pendientes) {
      if (this.processingIds.has(envio.id)) continue;
      this.processingIds.add(envio.id);
      try {
        await this.despachar(envio, envio.vector, envio.contacto_destino);
        procesados++;
      } finally {
        this.processingIds.delete(envio.id);
      }
    }

    return procesados;
  }

  async actualizarEntregasSms(): Promise<number> {
    const pending = await this.envioRepo.listarSmsEnSeguimiento();
    for (const envio of pending) {
      const result = await this.smsProvider.consultarEstado(envio.provider_message_id);
      if (result.accepted) await this.envioRepo.actualizarEstadoProveedor(envio.id, result);
    }
    return pending.length;
  }
}
