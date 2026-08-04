//backend/src/modules/campaigns/application/useCases/ActualizarCampaignUseCase.ts
import { ICampaignRepository } from '../../domain/ports/ICampaignRepository';
import { Campaign } from '../../domain/entities/Campaign';

export class ActualizarCampaignUseCase {
  constructor(private repo: ICampaignRepository) {}

  async execute(id: string, data: Partial<Campaign>): Promise<Campaign> {
    if (!id) throw new Error('ID de campaña es obligatorio.');
    const existente = await this.repo.buscarPorId(id);
    if (!existente) throw new Error('Campaña no encontrada.');
    return await this.repo.actualizar(id, data);
  }
}