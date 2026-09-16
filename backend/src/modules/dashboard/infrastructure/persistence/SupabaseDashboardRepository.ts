import { supabase } from '../../../../shared/infrastructure/database/supabase';
import { osintFingerprint } from '../../../osint/domain/osintFingerprint';
import { SupabaseClient } from '@supabase/supabase-js';

type UsuarioDashboard = {
  departamento: string | null;
  risk_score: number | string | null;
  estado: string | null;
};

type EnvioDashboard = {
  estado: string | null;
  fecha_envio: string | null;
  fecha_click: string | null;
  fecha_reporte: string | null;
};

const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
const normalizarEstado = (estado: string | null) => (estado || '').trim().toLocaleLowerCase('es');
const limitarPorcentaje = (valor: number) => Math.min(100, Math.max(0, valor));

const esClick = (envio: EnvioDashboard) => {
  const estado = normalizarEstado(envio.estado);
  return Boolean(envio.fecha_click) || estado === 'clickeado' || estado === 'reportado';
};

const esReporte = (envio: EnvioDashboard) => {
  return Boolean(envio.fecha_reporte) || normalizarEstado(envio.estado) === 'reportado';
};

const resumirDetalle = (detalle: unknown) => {
  const texto = typeof detalle === 'string' ? detalle : JSON.stringify(detalle ?? {});
  return texto.length > 220 ? `${texto.slice(0, 217)}...` : texto;
};

export class SupabaseDashboardRepository {
  constructor(private db: SupabaseClient = supabase) {}

  async obtenerMetricas(organizacionId: string) {
    const [usuariosResult, campanasResult, logsResult] = await Promise.all([
      this.db.from('usuarios_objetivo').select('departamento, risk_score, estado').eq('id_organizacion', organizacionId),
      this.db.from('campanas').select('id').eq('id_organizacion', organizacionId),
      this.db
        .from('osint_logs')
        .select('id, fuente, tipo_hallazgo, detalle_json, creado_en')
        .eq('id_organizacion', organizacionId)
        .order('creado_en', { ascending: false })
        .limit(100),
    ]);

    if (usuariosResult.error) throw new Error(`No se pudieron consultar los usuarios: ${usuariosResult.error.message}`);
    if (campanasResult.error) throw new Error(`No se pudieron consultar las campañas: ${campanasResult.error.message}`);
    if (logsResult.error) throw new Error(`No se pudieron consultar los registros OSINT: ${logsResult.error.message}`);

    const usuarios = (usuariosResult.data || []) as UsuarioDashboard[];
    const usuariosActivos = usuarios.filter(usuario => normalizarEstado(usuario.estado) === 'activo');
    const campanaIds = (campanasResult.data || []).map(campana => campana.id);

    let envios: EnvioDashboard[] = [];
    if (campanaIds.length > 0) {
      const enviosResult = await this.db
        .from('envios_simulacion')
        .select('estado, fecha_envio, fecha_click, fecha_reporte')
        .in('id_campana', campanaIds);

      if (enviosResult.error) throw new Error(`No se pudieron consultar los envíos: ${enviosResult.error.message}`);
      envios = (enviosResult.data || []) as EnvioDashboard[];
    }

    const riskScores = usuariosActivos.map(usuario => Number(usuario.risk_score)).filter(Number.isFinite);
    const promedioRisk = riskScores.length > 0
      ? riskScores.reduce((total, score) => total + score, 0) / riskScores.length
      : 100;

    const totalClics = envios.filter(esClick).length;
    const totalReportes = envios.filter(esReporte).length;
    const tasaClics = envios.length > 0 ? Number(((totalClics / envios.length) * 100).toFixed(1)) : 0;
    const tasaReportes = envios.length > 0 ? Number(((totalReportes / envios.length) * 100).toFixed(1)) : 0;

    const departamentos = new Map<string, number[]>();
    usuariosActivos.forEach(usuario => {
      const departamento = usuario.departamento?.trim() || 'Sin asignar';
      const score = Number(usuario.risk_score);
      if (!Number.isFinite(score)) return;
      departamentos.set(departamento, [...(departamentos.get(departamento) || []), score]);
    });

    const colores = ['bg-red-500', 'bg-blue-500', 'bg-slate-500', 'bg-amber-500', 'bg-purple-500'];
    const falloPorDepartamento = [...departamentos.entries()]
      .map(([name, scores], index) => {
        const promedio = scores.reduce((total, score) => total + score, 0) / scores.length;
        return {
          name,
          rate: Number(limitarPorcentaje(100 - promedio).toFixed(1)),
          color: colores[index % colores.length],
        };
      })
      .sort((a, b) => b.rate - a.rate);

    const seenLogs = new Set<string>();
    const uniqueLogs = (logsResult.data || []).filter(log => {
      const fingerprint = osintFingerprint({
        fuente: String(log.fuente || ''),
        tipo_hallazgo: String(log.tipo_hallazgo || ''),
        detalle_json: log.detalle_json || {},
      });
      if (seenLogs.has(fingerprint)) return false;
      seenLogs.add(fingerprint);
      return true;
    }).slice(0, 8);

    const logsOsintRecientes = uniqueLogs.map(log => {
      const tipo = String(log.tipo_hallazgo || 'Hallazgo');
      const fuente = String(log.fuente || 'Sistema');
      const texto = `${tipo} ${resumirDetalle(log.detalle_json)}`.toLocaleLowerCase('es');
      const esCritico = ['crítico', 'critico', 'vulnerabilidad', 'filtrado', 'expuesto']
        .some(palabra => texto.includes(palabra));

      return {
        id: log.id,
        hora: new Date(log.creado_en).toLocaleString('es-PE', {
          day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false,
        }),
        fuente,
        tipo_hallazgo: tipo,
        detalle: resumirDetalle(log.detalle_json),
        estadoBadging: esCritico ? 'CRÍTICO' : fuente.toLocaleLowerCase('es').includes('sistema') ? 'SISTEMA' : 'LIMPIO',
      };
    });

    const ahora = new Date();
    const evolucionTasaClics = Array.from({ length: 12 }, (_, indice) => {
      const fecha = new Date(Date.UTC(ahora.getUTCFullYear(), ahora.getUTCMonth() - 11 + indice, 1));
      const year = fecha.getUTCFullYear();
      const month = fecha.getUTCMonth();
      const enviosMes = envios.filter(envio => {
        if (!envio.fecha_envio) return false;
        const fechaEnvio = new Date(envio.fecha_envio);
        return fechaEnvio.getUTCFullYear() === year && fechaEnvio.getUTCMonth() === month;
      });
      const clicsMes = enviosMes.filter(esClick).length;

      return {
        label: `${MESES[month]} ${String(year).slice(-2)}`,
        rate: enviosMes.length > 0 ? Number(((clicsMes / enviosMes.length) * 100).toFixed(1)) : 0,
        totalEnvios: enviosMes.length,
        totalClics: clicsMes,
      };
    });

    return {
      totalUsuarios: usuariosActivos.length,
      tasaClics,
      tasaReportes,
      nivelRiesgoPromedio: Number(limitarPorcentaje(promedioRisk).toFixed(1)),
      falloPorDepartamento,
      logsOsintRecientes,
      evolucionTasaClics,
    };
  }
}
