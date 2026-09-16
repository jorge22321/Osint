import assert from 'node:assert/strict';
import test from 'node:test';
import { EjecutarEscaneoDominioUseCase } from './EjecutarEscaneoDominioUseCase';
import { IOsintProvider } from '../../domain/ports/IOsintProvider';
import { IOsintRepository } from '../../domain/ports/IOsintRepository';
import { OsintLog } from '../../domain/entities/OsintLog';
import { osintFingerprint } from '../../domain/osintFingerprint';

const provider: IOsintProvider = { escanear: async () => [] };
const repository: IOsintRepository = {
  guardarHallazgos: async logs => logs,
  obtenerPorOrganizacion: async () => [],
  obtenerPagina: async () => ({ items: [], total: 0 }),
  obtenerLogPorId: async () => null,
};

test('normaliza URLs a un dominio seguro', () => {
  const useCase = new EjecutarEscaneoDominioUseCase(provider, repository);
  assert.equal(useCase.normalizarDominio('https://WWW.Empresa.com/ruta'), 'empresa.com');
});

test('rechaza hosts locales o dominios inválidos', () => {
  const useCase = new EjecutarEscaneoDominioUseCase(provider, repository);
  assert.throws(() => useCase.normalizarDominio('localhost'), /dominio ingresado no es válido/);
  assert.throws(() => useCase.normalizarDominio('http://127.0.0.1'), /dominio ingresado no es válido/);
});

test('la huella de Hunter ignora cambios en el payload raw', () => {
  const base: Pick<OsintLog, 'fuente' | 'tipo_hallazgo' | 'detalle_json'> = {
    fuente: 'Hunter.io',
    tipo_hallazgo: 'Email corporativo expuesto',
    detalle_json: { email: 'Persona@Empresa.com', raw: { score: 10 } },
  };
  const changed = { ...base, detalle_json: { email: 'persona@empresa.com', raw: { score: 99 } } };
  assert.equal(osintFingerprint(base), osintFingerprint(changed));
});

test('la huella de Shodan cambia cuando aparece un CVE nuevo', () => {
  const base: Pick<OsintLog, 'fuente' | 'tipo_hallazgo' | 'detalle_json'> = {
    fuente: 'Shodan (InternetDB)',
    tipo_hallazgo: 'Vulnerabilidad de Infraestructura (Puertos/CVE)',
    detalle_json: { ip_objetivo: '203.0.113.1', puertos_abiertos: [443], vulnerabilidades_cve: [] },
  };
  const changed = { ...base, detalle_json: { ...base.detalle_json, vulnerabilidades_cve: ['CVE-2026-0001'] } };
  assert.notEqual(osintFingerprint(base), osintFingerprint(changed));
});
