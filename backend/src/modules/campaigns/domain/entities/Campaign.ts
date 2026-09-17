//backend/src/modules/campaigns/domain/entities/Campaign.ts
export interface Campaign {
  id?: string;
  id_organizacion: string;
  nombre: string;
  tipo: 'Phishing' | 'Smishing';
  estado: 'Borrador' | 'Programada' | 'En Progreso' | 'Finalizada';
  fecha_programada?: Date | null;
  creado_por: string;
  creado_en?: Date;
  training_snapshot?: Record<string, unknown> | null;
  training_template_id?: string | null;
  training_template_version?: number | null;
}
