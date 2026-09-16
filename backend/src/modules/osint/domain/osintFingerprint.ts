import { OsintLog } from './entities/OsintLog';

const stableStringify = (value: unknown): string => {
  if (Array.isArray(value)) return `[${value.map(item => stableStringify(item)).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, item]) => `${key}:${stableStringify(item)}`)
      .join(',')}}`;
  }
  return JSON.stringify(value) ?? 'undefined';
};

export const osintFingerprint = (log: Pick<OsintLog, 'fuente' | 'tipo_hallazgo' | 'detalle_json'>): string => {
  const detail = log.detalle_json || {};
  let identity: unknown;
  if (log.fuente === 'Hunter.io') {
    identity = String(detail.email || '').trim().toLowerCase();
  } else if (log.fuente.includes('Shodan')) {
    identity = {
      ip: detail.ip_objetivo || '',
      ports: [...(detail.puertos_abiertos || [])].sort(),
      cves: [...(detail.vulnerabilidades_cve || [])].sort(),
    };
  } else {
    identity = {
      breach: detail.nombre_brecha || detail.nombre || detail.titulo || '',
      domain: detail.dominio_afectado || detail.dominio || '',
      date: detail.fecha || '',
    };
  }
  return `${log.fuente}|${log.tipo_hallazgo}|${stableStringify(identity)}`;
};
