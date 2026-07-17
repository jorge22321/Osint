import { ICampaignRepository } from '../../domain/ports/ICampaignRepository';

export class EliminarCampaignUseCase {
  constructor(private repo: ICampaignRepository) {}

  async execute(id: string): Promise<void> {
    if (!id) throw new Error('ID de campaña es obligatorio.');
    const existente = await this.repo.buscarPorId(id);
    if (!existente) throw new Error('Campaña no encontrada.');
    await this.repo.eliminar(id);
  }
}