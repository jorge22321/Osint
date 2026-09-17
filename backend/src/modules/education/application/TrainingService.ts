import { requireServiceSupabase } from '../../../shared/infrastructure/database/supabase';
import { defaultTrainingContent, publicTrainingContent, trainingContentSchema } from '../domain/trainingContent';
import { gradeTrainingAttempt } from '../domain/trainingScore';

type EnvioTracking = {
  id: string;
  id_campana: string;
  id_usuario_objetivo: string;
  estado: string;
  fecha_click: string | null;
};

export class TrainingService {
  private get db() { return requireServiceSupabase(); }
  private async buscarEnvio(trackingCode: string): Promise<EnvioTracking | null> {
    const { data, error } = await this.db
      .from('envios_simulacion')
      .select('id, id_campana, id_usuario_objetivo, estado, fecha_click')
      .eq('tracking_code', trackingCode)
      .maybeSingle();

    if (error) throw new Error(`No se pudo validar el enlace: ${error.message}`);
    return data as EnvioTracking | null;
  }

  private async obtenerCampana(idCampana: string) {
    const { data, error } = await this.db.from('campanas').select('tipo,training_snapshot').eq('id', idCampana).maybeSingle();
    if (error) throw new Error(`No se pudo consultar la campaña: ${error.message}`);
    const tipo = data?.tipo || 'Phishing';
    return { tipo, content: data?.training_snapshot ? trainingContentSchema.parse(data.training_snapshot) : defaultTrainingContent(tipo) };
  }

  private async asegurarModulo(envio: EnvioTracking) {
    const { data: existente, error: consultaError } = await this.db
      .from('modulo_educativo')
      .select('id, estado, puntaje_quiz, respuestas_json')
      .eq('id_envio', envio.id)
      .maybeSingle();

    if (consultaError) throw new Error(`No se pudo consultar la capacitación: ${consultaError.message}`);
    if (existente) return existente;

    const { data, error } = await this.db
      .from('modulo_educativo')
      .insert({ id_envio: envio.id, id_usuario_objetivo: envio.id_usuario_objetivo, estado: 'En Curso' })
      .select('id, estado, puntaje_quiz, respuestas_json')
      .single();

    if (error) throw new Error(`No se pudo iniciar la capacitación: ${error.message}`);
    return data;
  }

  private async cambiarRiesgo(idUsuario: string, delta: number, motivo: string) {
    const { data: usuario, error: usuarioError } = await this.db
      .from('usuarios_objetivo')
      .select('risk_score')
      .eq('id', idUsuario)
      .single();
    if (usuarioError) throw new Error(`No se pudo consultar el nivel de riesgo: ${usuarioError.message}`);

    const scoreAnterior = Number(usuario.risk_score);
    const scoreNuevo = Math.min(100, Math.max(0, scoreAnterior + delta));
    const { error: updateError } = await this.db
      .from('usuarios_objetivo')
      .update({ risk_score: scoreNuevo })
      .eq('id', idUsuario);
    if (updateError) throw new Error(`No se pudo actualizar el nivel de riesgo: ${updateError.message}`);

    const { error: historialError } = await this.db.from('historial_riesgo').insert({
      id_usuario_objetivo: idUsuario,
      score_anterior: scoreAnterior,
      score_nuevo: scoreNuevo,
      motivo,
    });
    if (historialError) throw new Error(`No se pudo registrar el historial de riesgo: ${historialError.message}`);
  }

  async registrarApertura(trackingCode: string) {
    const envio = await this.buscarEnvio(trackingCode);
    if (!envio) return false;
    if (['Aceptado', 'Enviado', 'Entregado'].includes(envio.estado)) {
      const { error } = await this.db.from('envios_simulacion').update({ estado: 'Abierto' }).eq('id', envio.id);
      if (error) throw new Error(`No se pudo registrar la apertura: ${error.message}`);
    }
    return true;
  }

  async registrarClick(trackingCode: string) {
    const envio = await this.buscarEnvio(trackingCode);
    if (!envio) return null;

    if (!envio.fecha_click) {
      const { data: actualizado, error } = await this.db
        .from('envios_simulacion')
        .update({ estado: 'Clickeado', fecha_click: new Date().toISOString() })
        .eq('id', envio.id)
        .is('fecha_click', null)
        .select('id')
        .maybeSingle();
      if (error) throw new Error(`No se pudo registrar el clic: ${error.message}`);
      if (actualizado) await this.cambiarRiesgo(envio.id_usuario_objetivo, -10, 'Clic en enlace de simulación');
    }

    const modulo = await this.asegurarModulo(envio);
    const campaign = await this.obtenerCampana(envio.id_campana);
    return {
      tipo: campaign.tipo,
      estado: modulo.estado,
      puntaje: modulo.puntaje_quiz,
      contenido: publicTrainingContent(campaign.content),
    };
  }

  async obtenerCapacitacion(trackingCode: string) {
    const envio = await this.buscarEnvio(trackingCode);
    if (!envio) return null;
    const modulo = await this.asegurarModulo(envio);
    const campaign = await this.obtenerCampana(envio.id_campana);
    return {
      tipo: campaign.tipo,
      estado: modulo.estado,
      puntaje: modulo.puntaje_quiz,
      contenido: publicTrainingContent(campaign.content),
    };
  }

  async completarCapacitacion(trackingCode: string, respuestas: unknown) {
    const envio = await this.buscarEnvio(trackingCode);
    if (!envio) return null;
    const campaign = await this.obtenerCampana(envio.id_campana);
    const modulo = await this.asegurarModulo(envio);
    const result = gradeTrainingAttempt(campaign.content, respuestas, modulo);

    const { error } = await this.db
      .from('modulo_educativo')
      .update({
        estado: 'Completado',
        puntaje_quiz: result.storedScore,
        respuestas_json: result.score >= Number(modulo.puntaje_quiz ?? -1) ? respuestas : modulo.respuestas_json,
        fecha_completado: new Date().toISOString(),
      })
      .eq('id', modulo.id);
    if (error) throw new Error(`No se pudo guardar la capacitación: ${error.message}`);

    if (result.awardTrainingCredit) {
      await this.cambiarRiesgo(envio.id_usuario_objetivo, 5, 'Aprobación de capacitación y quiz');
    }

    return { puntaje: result.score, aprobado: result.approved, estado: 'Completado' };
  }
}
