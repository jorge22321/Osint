//backend/src/modules/osint/infrastructure/providers/BreachDirectoryProvider.ts
import axios from 'axios';
import { IOsintProvider, OsintHallazgo } from '../../domain/ports/IOsintProvider';
import { env } from '../../../../config/env';

export class BreachDirectoryProvider implements IOsintProvider {
  async escanear(dominio: string, organizacionId: string): Promise<OsintHallazgo[]> {
    try {
      const domainClean = dominio.replace(/^https?:\/\//, '').replace(/^www\./, '');

      // Endpoint de BreachDirectory (versión gratuita)
      // Documentación: https://breachdirectory.org/api/
      const url = `https://breachdirectory.org/api/v1/domain/${domainClean}`;

      const response = await axios.get(url, {
        params: {
          api_key: env.BREACH_DIRECTORY_KEY,
        },
        timeout: 10000,
        headers: {
          'Accept': 'application/json',
        },
      });

      const data = response.data;

      // La respuesta típica:
      // {
      //   "success": true,
      //   "domain": "ejemplo.com",
      //   "breaches": [
      //     {
      //       "name": "Adobe",
      //       "date": "2013-10-04",
      //       "email_count": 152
      //     }
      //   ]
      // }

      if (!data.breaches || data.breaches.length === 0) {
        return [];
      }

      return data.breaches.map((breach: any) => ({
        fuente: 'BreachDirectory',
        tipo_hallazgo: 'Brecha de datos asociada al dominio',
        detalle_json: {
          nombre_brecha: breach.name || 'Desconocida',
          fecha: breach.date || 'Fecha no disponible',
          emails_afectados: breach.email_count || 0,
          dominio: domainClean,
          descripcion: `Brecha "${breach.name}" con ${breach.email_count || 0} correos afectados.`,
        },
        id_usuario_objetivo: null,
      }));
    } catch (error: any) {
      if (error.response?.status === 404) {
        console.warn(` BreachDirectory: No se encontraron brechas para el dominio ${dominio}`);
      } else if (error.response?.status === 429) {
        console.warn(' BreachDirectory: Límite de peticiones diarias alcanzado.');
      } else if (error.code === 'ECONNABORTED') {
        console.warn(' BreachDirectory: Timeout');
      } else {
        console.error(' BreachDirectory error:', error.message);
      }
      return [];
    }
  }
}