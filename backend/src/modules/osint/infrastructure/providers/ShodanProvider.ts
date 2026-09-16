//backend/src/modules/osint/infrastructure/providers/ShodanProvider.ts
import dns from 'dns/promises';
import axios from 'axios';
import { IOsintProvider, OsintHallazgo } from '../../domain/ports/IOsintProvider';

export class ShodanProvider implements IOsintProvider {
  async escanear(dominio: string, organizacionId: string): Promise<OsintHallazgo[]> {
    try {
      // 1. Limpiar el dominio y resolver su IP real
      const domainClean = dominio.replace(/^https?:\/\//, '').replace(/^www\./, '');
      const dnsResult = await dns.lookup(domainClean);
      const ip = dnsResult.address;

      console.log(`🔍 Shodan: Resolviendo ${domainClean} -> IP: ${ip}`);

      // 2. Consultar Shodan InternetDB (API Gratuita, sin necesidad de Key)
      const url = `https://internetdb.shodan.io/${ip}`;
      const response = await axios.get(url, { timeout: 10000 });
      const data = response.data;

      // Si no hay puertos ni vulnerabilidades, devolvemos vacío
      if (!data || (!data.ports && !data.vulns)) {
        return [];
      }

      // 3. Mapear el hallazgo de infraestructura
      return [{
        fuente: 'Shodan (InternetDB)',
        tipo_hallazgo: 'Vulnerabilidad de Infraestructura (Puertos/CVE)',
        detalle_json: {
          ip_objetivo: ip,
          puertos_abiertos: data.ports || [],
          vulnerabilidades_cve: data.vulns || [], // Aquí viajan los CVE reales
          hostnames: data.hostnames || []
        },
        id_usuario_objetivo: null
      }];

    } catch (error: any) {
      // Si el dominio no tiene registros públicos o Shodan no lo tiene indexado
      if (error.response?.status === 404) {
        console.warn(`⚠️ Shodan: No hay datos de vulnerabilidades públicas para este dominio.`);
        return [];
      } else {
        throw new Error(`Shodan no disponible: ${error.message}`);
      }
    }
  }
}
