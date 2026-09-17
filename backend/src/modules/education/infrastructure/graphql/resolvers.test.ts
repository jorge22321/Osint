import assert from 'node:assert/strict';
import test from 'node:test';
import { defaultTrainingContent } from '../../domain/trainingContent';
import { trainingTemplateInputSchema } from '../../domain/trainingTemplateInput';

const baseInput = {
  titulo: 'Redes seguras', canal: 'Phishing', estado: 'Publicada', origen: 'IA',
  contenidoJson: JSON.stringify(defaultTrainingContent('Phishing')),
};

test('acepta publicar una plantilla nueva sin id o con id nulo', () => {
  assert.equal(trainingTemplateInputSchema.parse(baseInput).id, undefined);
  assert.equal(trainingTemplateInputSchema.parse({ ...baseInput, id: null }).id, null);
});

test('acepta actualizar una plantilla con id UUID y rechaza ids inválidos', () => {
  const id = '20e6246a-3625-47be-93d3-34f4c4b2d011';
  assert.equal(trainingTemplateInputSchema.parse({ ...baseInput, id }).id, id);
  assert.equal(trainingTemplateInputSchema.safeParse({ ...baseInput, id: 'no-es-uuid' }).success, false);
});
