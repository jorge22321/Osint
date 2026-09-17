import { z } from 'zod';

const optionSchema = z.object({ value: z.string().min(1).max(32), label: z.string().min(2).max(240) });
const questionSchema = z.object({
  id: z.string().min(1).max(32),
  text: z.string().min(10).max(500),
  options: z.array(optionSchema).min(2).max(4),
  correctValue: z.string().min(1).max(32),
}).superRefine((question, ctx) => {
  const values = question.options.map(option => option.value);
  if (new Set(values).size !== values.length || !values.includes(question.correctValue)) {
    ctx.addIssue({ code: 'custom', message: 'Cada pregunta debe tener opciones distintas y una respuesta correcta válida.' });
  }
});

export const trainingContentSchema = z.object({
  title: z.string().min(5).max(150),
  introduction: z.string().min(20).max(2000),
  signals: z.array(z.object({ title: z.string().min(3).max(100), description: z.string().min(10).max(500) })).min(1).max(5),
  questions: z.array(questionSchema).min(3).max(5),
  passScore: z.number().int().min(0).max(100),
}).superRefine((content, ctx) => {
  const ids = content.questions.map(question => question.id);
  if (new Set(ids).size !== ids.length) ctx.addIssue({ code: 'custom', message: 'Los identificadores de las preguntas deben ser únicos.' });
});

export type TrainingContent = z.infer<typeof trainingContentSchema>;

// Los identificadores del borrador son internos. Un modelo puede devolverlos
// como números; les damos valores estables antes de validar el contenido.
export const normalizeGeneratedTrainingContent = (input: unknown): unknown => {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return input;
  const content = input as Record<string, unknown>;
  if (!Array.isArray(content.questions)) return input;
  const toStringIfNumber = (value: unknown) => typeof value === 'number' ? String(value) : value;
  return {
    ...content,
    questions: content.questions.map((entry, index) => {
      if (!entry || typeof entry !== 'object' || Array.isArray(entry)) return entry;
      const question = entry as Record<string, unknown>;
      return {
        ...question,
        id: `q${index + 1}`,
        correctValue: toStringIfNumber(question.correctValue),
        options: Array.isArray(question.options)
          ? question.options.map(option => option && typeof option === 'object' && !Array.isArray(option)
            ? { ...option, value: toStringIfNumber((option as Record<string, unknown>).value) }
            : option)
          : question.options,
      };
    }),
  };
};

export const defaultTrainingContent = (channel: string, passScore = 67): TrainingContent => ({
  title: channel === 'Smishing' ? 'Reconoce el smishing' : 'Reconoce el phishing',
  introduction: 'Este enlace era una simulación controlada. Antes de actuar, verifica el remitente, el destino del enlace y cualquier solicitud urgente por un canal confiable.',
  signals: channel === 'Smishing' ? [
    { title: 'Número inesperado', description: 'Un número desconocido puede hacerse pasar por una entidad de confianza.' },
    { title: 'Urgencia artificial', description: 'La presión por actuar rápido busca evitar que verifiques el mensaje.' },
    { title: 'Enlace sospechoso', description: 'Comprueba el dominio antes de abrir un enlace recibido por SMS.' },
  ] : [
    { title: 'Remitente alterado', description: 'Revisa el dominio completo del correo, no solo el nombre visible.' },
    { title: 'Urgencia artificial', description: 'Las amenazas de consecuencias inmediatas son una señal de alerta.' },
    { title: 'Destino diferente', description: 'Verifica la dirección real de un enlace antes de abrirlo.' },
  ],
  questions: [
    { id: 'q1', text: '¿Qué debes hacer antes de abrir un enlace inesperado?', options: [
      { value: 'abrir', label: 'Abrirlo de inmediato.' }, { value: 'verificar', label: 'Verificar remitente y dominio por un canal confiable.' }, { value: 'reenviar', label: 'Reenviarlo a otra persona para que lo pruebe.' },
    ], correctValue: 'verificar' },
    { id: 'q2', text: '¿Cuál es una señal frecuente de ingeniería social?', options: [
      { value: 'urgencia', label: 'Una solicitud urgente con consecuencias inmediatas.' }, { value: 'firma', label: 'Un mensaje con firma corporativa.' }, { value: 'horario', label: 'Que llegue durante el horario laboral.' },
    ], correctValue: 'urgencia' },
    { id: 'q3', text: '¿Qué haces si sospechas que el mensaje es fraudulento?', options: [
      { value: 'responder', label: 'Responder para solicitar más detalles.' }, { value: 'borrar', label: 'Borrarlo sin avisar.' }, { value: 'reportar', label: 'No interactuar y reportarlo al equipo de seguridad.' },
    ], correctValue: 'reportar' },
  ],
  passScore,
});

export const publicTrainingContent = (content: TrainingContent) => ({
  ...content,
  questions: content.questions.map(({ correctValue: _correctValue, ...question }) => question),
});
