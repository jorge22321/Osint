import { TrainingContent } from './trainingContent';

export const gradeTrainingAttempt = (
  content: TrainingContent,
  answers: unknown,
  previous: { estado: string; puntaje_quiz: number | null }
) => {
  if (!Array.isArray(answers) || answers.length !== content.questions.length ||
    !answers.every((answer, index) => content.questions[index].options.some(option => option.value === answer))) {
    throw new Error('Debe responder todas las preguntas con opciones válidas.');
  }

  const correct = content.questions.filter((question, index) => answers[index] === question.correctValue).length;
  const score = Math.round((correct / content.questions.length) * 100);
  const approved = score >= content.passScore;
  const previousScore = previous.estado === 'Completado' && previous.puntaje_quiz !== null
    ? Number(previous.puntaje_quiz)
    : null;
  const previouslyApproved = previousScore !== null && previousScore >= content.passScore;

  return {
    score,
    approved,
    storedScore: Math.max(score, previousScore ?? 0),
    awardTrainingCredit: approved && !previouslyApproved,
  };
};
