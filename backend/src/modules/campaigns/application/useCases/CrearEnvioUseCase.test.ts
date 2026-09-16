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
  contenido_generado: '<p>Mensaje de simulación</p>',
};

const setup = (scheduledAt: Date) => {
  let stored: Envio | null = null;
  const sent: Array<{ to: string; html: string }> = [];
  const envioRepo: IEnvioRepository = {
    crear: async data => (stored = { ...data, id: 'send-1' }),
    actualizarEstado: async (id, estado, fechaEnvio = null) => {
      stored = { ...(stored as Envio), id, estado, fecha_envio: fechaEnvio };
      return stored;
    },
    listarPendientesProgramados: async () => [],
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
      return true;
    },
  };
  const smsProvider: ISmsProvider = { enviarSms: async () => true };
  return { useCase: new CrearEnvioUseCase(envioRepo, emailProvider, smsProvider, campaignRepo), sent, getStored: () => stored };
};

test('phishing inserta enlace y píxel individuales antes de enviar', async () => {
  const fixture = setup(new Date(Date.now() - 60_000));
  const result = await fixture.useCase.execute({ ...envioBase }, 'email', 'empleado@example.com');
  assert.equal(result.estado, 'Enviado');
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
