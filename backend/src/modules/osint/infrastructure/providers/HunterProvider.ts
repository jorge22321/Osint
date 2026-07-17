// backend/src/modules/osint/infrastructure/providers/HunterProvider.ts

import axios from 'axios';
import { IOsintProvider, OsintHallazgo } from '../../domain/ports/IOsintProvider';
import { env } from '../../../../config/env';

export class HunterProvider implements IOsintProvider {
  async escanear(dominio: string, organizacionId: string): Promise<OsintHallazgo[]> {
    try {
      const response = await axios.get('https://api.hunter.io/v2/domain-search', {
        params: {
          domain: dominio,
          api_key: env.HUNTER_API_KEY,
        },
        timeout: 10000,
      });

      const emails = response.data.data?.emails || [];
      
      // Para depuración, puedes descomentar la siguiente línea para ver la respuesta real
      // console.log('Hunter.io raw emails:', JSON.stringify(emails, null, 2));

      return emails.map((item: any) => {
        // Extraer el cargo de diferentes posibles campos
        const cargo = item.title || item.position || item.job_title || item.department || 'No especificado';
        
        return {
          fuente: 'Hunter.io',
          tipo_hallazgo: 'Email corporativo expuesto',
          detalle_json: {
            email: item.value || '',
            nombre: `${item.first_name || ''} ${item.last_name || ''}`.trim() || 'Nombre no disponible',
            cargo: cargo,
            fuente: item.sources?.[0]?.uri || 'Desconocida',
            // Guardamos también datos adicionales por si acaso
            raw: item,
          },
          id_usuario_objetivo: null,
        };
      });
    } catch (error) {
      console.error('HunterProvider error:', error);
      return [];
    }
  }
}