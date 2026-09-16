import { Router } from 'express';
import { env } from '../../../../config/env';
import { TrainingService } from '../../application/TrainingService';

const TOKEN_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const PIXEL_GIF = Buffer.from('R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=', 'base64');

export const trainingRoutes = Router();
const service = new TrainingService();

trainingRoutes.get('/track/open/:token', async (req, res) => {
  try {
    if (TOKEN_PATTERN.test(req.params.token)) await service.registrarApertura(req.params.token);
  } catch (error) {
    console.error('[Tracking apertura]', error);
  }
  res.set('Cache-Control', 'no-store').type('gif').send(PIXEL_GIF);
});

trainingRoutes.get('/track/click/:token', async (req, res) => {
  const token = req.params.token;
  if (!TOKEN_PATTERN.test(token)) return res.redirect(302, `${env.PUBLIC_BASE_URL}/training/invalido`);

  try {
    const training = await service.registrarClick(token);
    return res.redirect(302, `${env.PUBLIC_BASE_URL}/training/${training ? token : 'invalido'}`);
  } catch (error) {
    console.error('[Tracking clic]', error);
    return res.redirect(302, `${env.PUBLIC_BASE_URL}/training/error`);
  }
});

trainingRoutes.get('/api/training/:token', async (req, res) => {
  if (!TOKEN_PATTERN.test(req.params.token)) return res.status(404).json({ message: 'Enlace de capacitación inválido.' });
  try {
    const training = await service.obtenerCapacitacion(req.params.token);
    if (!training) return res.status(404).json({ message: 'No se encontró la capacitación.' });
    return res.json(training);
  } catch (error: any) {
    return res.status(500).json({ message: error.message || 'No se pudo cargar la capacitación.' });
  }
});

trainingRoutes.post('/api/training/:token/complete', async (req, res) => {
  if (!TOKEN_PATTERN.test(req.params.token)) return res.status(404).json({ message: 'Enlace de capacitación inválido.' });
  try {
    const result = await service.completarCapacitacion(req.params.token, req.body?.respuestas);
    if (!result) return res.status(404).json({ message: 'No se encontró la capacitación.' });
    return res.json(result);
  } catch (error: any) {
    return res.status(400).json({ message: error.message || 'No se pudo guardar la capacitación.' });
  }
});
