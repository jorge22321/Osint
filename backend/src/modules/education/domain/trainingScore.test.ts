import assert from 'node:assert/strict';
import { test } from 'node:test';
import { defaultTrainingContent } from './trainingContent';
import { gradeTrainingAttempt } from './trainingScore';

const content = defaultTrainingContent('Phishing');
const correct = content.questions.map(question => question.correctValue);
const wrong = content.questions.map(question => question.options.find(option => option.value !== question.correctValue)!.value);

test('una capacitación fallida puede aprobarse en un intento posterior', () => {
  const first = gradeTrainingAttempt(content, wrong, { estado: 'En Curso', puntaje_quiz: null });
  assert.equal(first.approved, false);
  assert.equal(first.awardTrainingCredit, false);
  const second = gradeTrainingAttempt(content, correct, { estado: 'Completado', puntaje_quiz: first.storedScore });
  assert.equal(second.approved, true);
  assert.equal(second.awardTrainingCredit, true);
});

test('no concede dos veces el crédito ni rebaja el mejor puntaje', () => {
  const retry = gradeTrainingAttempt(content, correct, { estado: 'Completado', puntaje_quiz: 100 });
  assert.equal(retry.awardTrainingCredit, false);
  const laterFailure = gradeTrainingAttempt(content, wrong, { estado: 'Completado', puntaje_quiz: 100 });
  assert.equal(laterFailure.storedScore, 100);
  assert.equal(laterFailure.awardTrainingCredit, false);
});

test('rechaza respuestas incompletas o no pertenecientes a una opción', () => {
  assert.throws(() => gradeTrainingAttempt(content, [], { estado: 'En Curso', puntaje_quiz: null }));
  assert.throws(() => gradeTrainingAttempt(content, ['invalida', ...correct.slice(1)], { estado: 'En Curso', puntaje_quiz: null }));
});
