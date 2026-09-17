import assert from 'node:assert/strict';
import test from 'node:test';
import { defaultTrainingContent, normalizeGeneratedTrainingContent, publicTrainingContent, trainingContentSchema } from './trainingContent';

test('la capacitación base es válida y no publica respuestas correctas', () => {
  const content = trainingContentSchema.parse(defaultTrainingContent('Phishing'));
  const visible = publicTrainingContent(content);
  assert.equal(content.questions.length, 3);
  assert.equal('correctValue' in visible.questions[0], false);
});

test('no acepta una pregunta sin respuesta correcta entre sus opciones', () => {
  const content = defaultTrainingContent('Smishing');
  content.questions[0].correctValue = 'inexistente';
  assert.equal(trainingContentSchema.safeParse(content).success, false);
});

test('normaliza identificadores numéricos del borrador generado', () => {
  const generated = defaultTrainingContent('Phishing') as unknown as { questions: Array<{ id: number; correctValue: number; options: Array<{ value: number }> }> };
  generated.questions.forEach((question, index) => {
    question.id = index + 1;
    question.options.forEach((option, optionIndex) => { option.value = optionIndex + 1; });
    question.correctValue = index === 0 ? 2 : index === 1 ? 1 : 3;
  });
  const parsed = trainingContentSchema.parse(normalizeGeneratedTrainingContent(generated));
  assert.deepEqual(parsed.questions.map(question => question.id), ['q1', 'q2', 'q3']);
  assert.equal(parsed.questions[0].correctValue, '2');
});
