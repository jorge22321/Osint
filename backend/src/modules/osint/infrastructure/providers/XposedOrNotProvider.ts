// src/modules/osint/infrastructure/providers/XposedOrNotProvider.ts
import axios from 'axios';
import { IOsintProvider, OsintHallazgo } from '../../domain/ports/IOsintProvider';

export class XposedOrNotProvider implements IOsintProvider {
  async escanear(dominio: string, organizacionId: string): Promise<OsintHallazgo[]> {
    try {
      const domainClean = dominio.replace(/^https?:\/\//, '').replace(/^www\./, '');
      const url = `https://api.xposedornot.com/v1/breaches?domain=${domainClean}`;

      const response = await axios.get(url, {
        timeout: 10000,
        headers: { 'Accept': 'application/json' },
      });

      const data = response.data;

      if (!data.exposedBreaches || data.exposedBreaches.length === 0) {
        return [];
      }

      return data.exposedBreaches.map((breach: any) => ({
  fuente: 'XposedOrNot',
  tipo_hallazgo: 'Brecha de datos asociada al dominio',
  detalle_json: {
    nombre_brecha: breach.breachID || 'Desconocida',
    fecha: breach.breachedDate || 'Fecha no disponible',
    dominio_afectado: breach.domain || domainClean,
    industria: breach.industry || 'No especificada',
    registros_expuestos: breach.exposedRecords || 0,   // ← este es el nombre que espera el front
    datos_expuestos: breach.exposedData || [],
    descripcion: breach.exposureDescription || `Brecha "${breach.breachID}" encontrada.`,
    url_referencia: breach.referenceURL || '',
    verificado: breach.verified || false,
    sensible: breach.sensitive || false,
  },
  id_usuario_objetivo: null,
}));
    } catch (error: any) {
      if (error.response?.status === 404) {
        console.warn(` XposedOrNot: No se encontraron brechas para el dominio ${dominio}`);
      } else if (error.response?.status === 429) {
        console.warn(' XposedOrNot: Límite de peticiones alcanzado (espera unos segundos)');
      } else if (error.code === 'ECONNABORTED') {
        console.warn(' XposedOrNot: Timeout');
      } else {
        console.error(' XposedOrNot error:', error.message);
      }
      return [];
    }
  }
}