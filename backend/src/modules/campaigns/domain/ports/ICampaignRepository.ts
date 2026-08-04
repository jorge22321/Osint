//backend/src/modules/campaigns/domain/ports/ICampaignRepository.ts
import { Campaign } from '../entities/Campaign';

export interface ICampaignRepository {
  listar(organizacionId: string): Promise<Campaign[]>;
  crear(data: Omit<Campaign, 'id' | 'creado_en'>): Promise<Campaign>;
  actualizar(id: string, data: Partial<Campaign>): Promise<Campaign>;
  eliminar(id: string): Promise<void>;
  buscarPorId(id: string): Promise<Campaign | null>;
}