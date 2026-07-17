import { ICampaignRepository } from '../../domain/ports/ICampaignRepository';
import { Campaign } from '../../domain/entities/Campaign';

export class ListarCampaignsUseCase {
  constructor(private repo: ICampaignRepository) {}

  async execute(organizacionId: string): Promise<Campaign[]> {
    if (!organizacionId) throw new Error('ID de organización es obligatorio.');
    return await this.repo.listar(organizacionId);
  }
}