import { IEnvioRepository, Envio } from '../../domain/ports/IEnvioRepository';

export class CrearEnvioUseCase {
  constructor(private envioRepo: IEnvioRepository) {}

  async execute(envioData: Omit<Envio, 'id'>): Promise<Envio> {
    // Validaciones
    if (!envioData.id_campana || !envioData.id_usuario_objetivo) {
      throw new Error('ID de campaña y usuario objetivo son obligatorios.');
    }
    if (!envioData.asunto_generado || !envioData.contenido_generado) {
      throw new Error('El asunto y el contenido del envío son obligatorios.');
    }
    if (!envioData.tracking_code) {
      throw new Error('El código de tracking es obligatorio.');
    }

    // Guardar en base de datos
    return await this.envioRepo.crear(envioData);
  }
}