//backend/src/modules/osint/infrastructure/providers/HibpProvider.ts
import { IOsintProvider, OsintHallazgo } from '../../domain/ports/IOsintProvider';
import axios from 'axios';
import { env } from '../../../../config/env';

export class HibpProvider implements IOsintProvider {
  async escanear(dominio: string, organizacionId: string): Promise<OsintHallazgo[]> {
    try {
      // HIBP requiere el dominio sin http:// y sin www
      const domainClean = dominio.replace(/^https?:\/\//, '').replace(/^www\./, '');
      
      const response = await axios.get(`https://haveibeenpwned.com/api/v3/breacheddomain/${domainClean}`, {
        headers: {
          'hibp-api-key': env.HIBP_API_KEY || '',
        },
        timeout: 10000,
      });

      const breaches = response.data || [];
      
      if (!breaches.length) return [];

      return breaches.map((breach: any) => ({
        fuente: 'HIBP',
        tipo_hallazgo: 'Brecha de datos asociada al dominio',
        detalle_json: {
          nombre: breach.Name,
          titulo: breach.Title,
          fecha: breach.BreachDate,
          descripcion: breach.Description?.substring(0, 200) || '',
          dominio_afectado: breach.Domain,
          registros_comprometidos: breach.PwnCount,
        },
        id_usuario_objetivo: null,
      }));
    } catch (error) {
      console.error('HIBP error:', error);
      return [];
    }
  }
}