import { ICampaignRepository } from '../../domain/ports/ICampaignRepository';
import { Campaign } from '../../domain/entities/Campaign';

export class CrearCampaignUseCase {  // ✅ Nombre correcto
  constructor(private repo: ICampaignRepository) {}

  async execute(data: Omit<Campaign, 'id' | 'creado_en'>): Promise<Campaign> {
    if (!data.nombre || !data.id_organizacion || !data.creado_por) {
      throw new Error('Nombre, organización y creador son obligatorios.');
    }
    if (!data.estado) {
      data.estado = 'Borrador';
    }
    return await this.repo.crear(data);
  }
}