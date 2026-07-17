import { ICampaignRepository } from '../../domain/ports/ICampaignRepository';
import { Campaign } from '../../domain/entities/Campaign';

export class ObtenerCampaignUseCase {
  constructor(private repo: ICampaignRepository) {}

  async execute(id: string): Promise<Campaign> {
    const campaign = await this.repo.buscarPorId(id);
    if (!campaign) throw new Error('Campaña no encontrada.');
    return campaign;
  }
}