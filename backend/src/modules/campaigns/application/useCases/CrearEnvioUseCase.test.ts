import assert from 'node:assert/strict';
import test from 'node:test';
import { CrearEnvioUseCase } from './CrearEnvioUseCase';
import { Envio, IEnvioRepository } from '../../domain/ports/IEnvioRepository';
import { ICampaignRepository } from '../../domain/ports/ICampaignRepository';
import { IEmailProvider } from '../../domain/ports/IEmailProvider';
import { ISmsProvider } from '../../domain/ports/ISmsProvider';

const envioBase: Omit<Envio, 'id'> = {
  id_campana: 'campaign-1',
  id_usuario_objetivo: 'target-1',
  tracking_code: '11111111-1111-4111-8111-111111111111',
  estado: 'Borrador',
  asunto_generado: 'Actualización de seguridad',
  contenido_generado: 'Mensaje de simulación',
};

const setup = (scheduledAt: Date, smsResult = { accepted: true, providerStatus: 'queued', providerId: 'SM123' }) => {
  let stored: Envio | null = null;
  const sent: Array<{ to: string; html: string }> = [];
  const envioRepo: IEnvioRepository = {
    crear: async data => (stored = { ...data, id: 'send-1' }),
    actualizarEstado: async (id, estado, fechaEnvio = null, result) => {
      stored = { ...(stored as Envio), id, estado, fecha_envio: fechaEnvio,
        provider_status: result?.providerStatus, provider_error_code: result?.errorCode };
      return stored;
    },
    listarPendientesProgramados: async () => [],
    listarSmsEnSeguimiento: async () => [],
    actualizarEstadoProveedor: async () => undefined,
  };
  const campaignRepo: ICampaignRepository = {
    listar: async () => [],
    crear: async data => ({ ...data, id: 'campaign-1' }),
    actualizar: async (_id, data) => data as any,
    eliminar: async () => undefined,
    buscarPorId: async () => ({
      id: 'campaign-1', id_organizacion: 'org-1', nombre: 'Prueba', tipo: 'Phishing',
      estado: 'Programada', fecha_programada: scheduledAt, creado_por: 'admin-1',
    }),
  };
  const emailProvider: IEmailProvider = {
    enviarEmail: async (to, _subject, html) => {
      sent.push({ to, html });
      return { accepted: true, providerStatus: 'accepted', providerId: 'mail-1' };
    },
  };
  const smsProvider: ISmsProvider = { enviarSms: async () => smsResult, consultarEstado: async () => ({ accepted: true, providerStatus: 'delivered' }) };
  return { useCase: new CrearEnvioUseCase(envioRepo, emailProvider, smsProvider, campaignRepo), sent, getStored: () => stored };
};

test('phishing inserta enlace y píxel individuales antes de enviar', async () => {
  const fixture = setup(new Date(Date.now() - 60_000));
  const result = await fixture.useCase.execute({ ...envioBase }, 'email', 'empleado@example.com');
  assert.equal(result.estado, 'Aceptado');
  assert.equal(fixture.sent.length, 1);
  assert.match(fixture.sent[0].html, /\/track\/click\/11111111-1111-4111-8111-111111111111/);
  assert.match(fixture.sent[0].html, /\/track\/open\/11111111-1111-4111-8111-111111111111/);
});

test('phishing programado permanece en cola hasta su fecha', async () => {
  const fixture = setup(new Date(Date.now() + 60 * 60 * 1000));
  const result = await fixture.useCase.execute({ ...envioBase }, 'email', 'empleado@example.com');
  assert.equal(result.estado, 'En Cola');
  assert.equal(fixture.sent.length, 0);
  assert.match(fixture.getStored()!.contenido_generado, /Revisar información/);
});

test('el correo conserva saltos de línea y no interpreta HTML escrito por el usuario', async () => {
  const fixture = setup(new Date(Date.now() - 60_000));
  await fixture.useCase.execute({ ...envioBase, contenido_generado: 'Primera línea\n<script>texto</script>' }, 'email', 'empleado@example.com');
  assert.match(fixture.sent[0].html, /Primera línea<br\/>/);
  assert.match(fixture.sent[0].html, /&lt;script&gt;texto&lt;\/script&gt;/);
  assert.doesNotMatch(fixture.sent[0].html, /<script>/);
});

test('un rechazo de Twilio se conserva como fallido, no como entregado', async () => {
  const fixture = setup(new Date(Date.now() - 60_000), { accepted: false, providerStatus: 'failed', providerId: '', errorCode: '572006' } as any);
  const result = await fixture.useCase.execute({ ...envioBase, asunto_generado: '' }, 'sms', '+51900000000');
  assert.equal(result.estado, 'Fallido');
  assert.equal(result.provider_error_code, '572006');
});
