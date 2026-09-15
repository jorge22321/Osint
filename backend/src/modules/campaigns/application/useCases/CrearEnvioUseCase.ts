import { IEnvioRepository, Envio } from '../../domain/ports/IEnvioRepository';
import { ISmsProvider } from '../../domain/ports/ISmsProvider';
import { IEmailProvider } from '../../domain/ports/IEmailProvider';


export class CrearEnvioUseCase {
  constructor(
    private envioRepo: IEnvioRepository,
    private emailProvider: IEmailProvider,
    private smsProvider: ISmsProvider
  ) {}

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

    // 2. Inyectar tracking pixel si es email
    let contenidoFinal = envioData.contenido_generado;
    if (vector === 'email') {
      const pixelTracking = `<img src="${process.env.API_URL || 'http://localhost:3000'}/track/open/${envioData.tracking_code}" width="1" height="1" style="display:none;" />`;
      contenidoFinal += pixelTracking;
    }

    // 3. Despachar el mensaje
    let envioExitoso = false;
    try {
      if (vector === 'email') {
        if (!envioData.asunto_generado) throw new Error('El asunto es obligatorio para email.');
        envioExitoso = await this.emailProvider.enviarEmail(contactoDestino, envioData.asunto_generado, contenidoFinal);
      } else if (vector === 'sms') {
        envioExitoso = await this.smsProvider.enviarSms(contactoDestino, contenidoFinal);
      } else {
        throw new Error('Vector no soportado. Debe ser "email" o "sms".');
      }
    } catch (error) {
      console.error(`Error crítico al despachar el ${vector}:`, error);
      envioExitoso = false;
    }

    // 4. Actualizar estado y fecha en base de datos
    envioData.estado = envioExitoso ? 'Enviado' : 'Fallido';
    if (envioExitoso) {
      envioData.fecha_envio = new Date();
    }

    // 5. Guardar en Supabase
    return await this.envioRepo.crear(envioData);
  }
}