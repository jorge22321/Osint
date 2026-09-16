import { supabase } from '../../../shared/infrastructure/database/supabase';

const RESPUESTAS_CORRECTAS = ['verificar', 'urgencia', 'reportar'];

type EnvioTracking = {
  id: string;
  id_campana: string;
  id_usuario_objetivo: string;
  estado: string;
  fecha_click: string | null;
};

export class TrainingService {
  private async buscarEnvio(trackingCode: string): Promise<EnvioTracking | null> {
    const { data, error } = await supabase
      .from('envios_simulacion')
      .select('id, id_campana, id_usuario_objetivo, estado, fecha_click')
      .eq('tracking_code', trackingCode)
      .maybeSingle();

    if (error) throw new Error(`No se pudo validar el enlace: ${error.message}`);
    return data as EnvioTracking | null;
  }

  private async obtenerTipoCampana(idCampana: string) {
    const { data, error } = await supabase.from('campanas').select('tipo').eq('id', idCampana).maybeSingle();
    if (error) throw new Error(`No se pudo consultar la campaña: ${error.message}`);
    return data?.tipo || 'Phishing';
  }

  private async asegurarModulo(envio: EnvioTracking) {
    const { data: existente, error: consultaError } = await supabase
      .from('modulo_educativo')
      .select('id, estado, puntaje_quiz')
      .eq('id_envio', envio.id)
      .maybeSingle();

    if (consultaError) throw new Error(`No se pudo consultar la capacitación: ${consultaError.message}`);
    if (existente) return existente;

    const { data, error } = await supabase
      .from('modulo_educativo')
      .insert({ id_envio: envio.id, id_usuario_objetivo: envio.id_usuario_objetivo, estado: 'En Curso' })
      .select('id, estado, puntaje_quiz')
      .single();

    if (error) throw new Error(`No se pudo iniciar la capacitación: ${error.message}`);
    return data;
  }

  private async cambiarRiesgo(idUsuario: string, delta: number, motivo: string) {
    const { data: usuario, error: usuarioError } = await supabase
      .from('usuarios_objetivo')
      .select('risk_score')
      .eq('id', idUsuario)
      .single();
    if (usuarioError) throw new Error(`No se pudo consultar el nivel de riesgo: ${usuarioError.message}`);

    const scoreAnterior = Number(usuario.risk_score);
    const scoreNuevo = Math.min(100, Math.max(0, scoreAnterior + delta));
    const { error: updateError } = await supabase
      .from('usuarios_objetivo')
      .update({ risk_score: scoreNuevo })
      .eq('id', idUsuario);
    if (updateError) throw new Error(`No se pudo actualizar el nivel de riesgo: ${updateError.message}`);

    const { error: historialError } = await supabase.from('historial_riesgo').insert({
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
    if (envio.estado === 'Enviado') {
      const { error } = await supabase.from('envios_simulacion').update({ estado: 'Abierto' }).eq('id', envio.id);
      if (error) throw new Error(`No se pudo registrar la apertura: ${error.message}`);
    }
    return true;
  }

  async registrarClick(trackingCode: string) {
    const envio = await this.buscarEnvio(trackingCode);
    if (!envio) return null;

    if (!envio.fecha_click) {
      const { data: actualizado, error } = await supabase
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
    return {
      tipo: await this.obtenerTipoCampana(envio.id_campana),
      estado: modulo.estado,
      puntaje: modulo.puntaje_quiz,
    };
  }

  async obtenerCapacitacion(trackingCode: string) {
    const envio = await this.buscarEnvio(trackingCode);
    if (!envio) return null;
    const modulo = await this.asegurarModulo(envio);
    return {
      tipo: await this.obtenerTipoCampana(envio.id_campana),
      estado: modulo.estado,
      puntaje: modulo.puntaje_quiz,
    };
  }

  async completarCapacitacion(trackingCode: string, respuestas: unknown) {
    if (!Array.isArray(respuestas) || respuestas.length !== RESPUESTAS_CORRECTAS.length) {
      throw new Error('Debe responder todas las preguntas de la capacitación.');
    }

    const envio = await this.buscarEnvio(trackingCode);
    if (!envio) return null;
    const modulo = await this.asegurarModulo(envio);
    const aciertos = RESPUESTAS_CORRECTAS.filter((respuesta, index) => respuestas[index] === respuesta).length;
    const puntaje = Math.round((aciertos / RESPUESTAS_CORRECTAS.length) * 100);
    const aprobado = puntaje >= 67;
    const yaCompletado = modulo.estado === 'Completado';

    const { error } = await supabase
      .from('modulo_educativo')
      .update({
        estado: 'Completado',
        puntaje_quiz: puntaje,
        respuestas_json: respuestas,
        fecha_completado: new Date().toISOString(),
      })
      .eq('id', modulo.id);
    if (error) throw new Error(`No se pudo guardar la capacitación: ${error.message}`);

    if (aprobado && !yaCompletado) {
      await this.cambiarRiesgo(envio.id_usuario_objetivo, 5, 'Aprobación de capacitación y quiz');
    }

    return { puntaje, aprobado, estado: 'Completado' };
  }
}
