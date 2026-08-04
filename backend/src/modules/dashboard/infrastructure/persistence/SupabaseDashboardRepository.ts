//backend/src/modules/dashboard/infrastructure/persistence/SupabaseDashboardRepository.ts
import { supabase } from '../../../../shared/infrastructure/database/supabase';

export class SupabaseDashboardRepository {
  async obtenerMetricas(organizacionId: string) {
    // 1. Total de usuarios activos
    const { count: totalUsuarios } = await supabase
      .from('usuarios_objetivo')
      .select('*', { count: 'exact', head: true })
      .eq('id_organizacion', organizacionId)
      .eq('estado', 'Activo');

    // 2. Promedio de Risk Score de la organización
    const { data: usuariosRisk } = await supabase
      .from('usuarios_objetivo')
      .select('risk_score')
      .eq('id_organizacion', organizacionId);

    const promedioRisk = usuariosRisk && usuariosRisk.length > 0
      ? usuariosRisk.reduce((acc, u) => acc + Number(u.risk_score), 0) / usuariosRisk.length
      : 100;

    // 3. Obtener campañas de esta organización para calcular Envíos/Clics/Reportes
    const { data: campanas } = await supabase
      .from('campanas')
      .select('id')
      .eq('id_organizacion', organizacionId);

    const campanaIds = campanas?.map(c => c.id) || [];

    let tasaClics = 0;
    let tasaReportes = 0;

    if (campanaIds.length > 0) {
      const { data: envios } = await supabase
        .from('envios_simulacion')
        .select('estado')
        .in('id_campana', campanaIds);

      if (envios && envios.length > 0) {
        const totalEnvios = envios.length;
        const clics = envios.filter(e => e.estado === 'Clickeado').length;
        const reportes = envios.filter(e => e.estado === 'Reportado').length;

        tasaClics = Number(((clics / totalEnvios) * 100).toFixed(1));
        tasaReportes = Number(((reportes / totalEnvios) * 100).toFixed(1));
      }
    }

    // 4. Fallo por Departamento (calculado sobre el riesgo promedio por depto)
    const { data: usuariosDept } = await supabase
      .from('usuarios_objetivo')
      .select('departamento, risk_score')
      .eq('id_organizacion', organizacionId);

    const deptMap: Record<string, { total: number; sumRisk: number }> = {};
    (usuariosDept || []).forEach(u => {
      const dept = u.departamento || 'Sin Asignar';
      if (!deptMap[dept]) deptMap[dept] = { total: 0, sumRisk: 0 };
      deptMap[dept].total += 1;
      deptMap[dept].sumRisk += Number(u.risk_score);
    });

    const colores = ['bg-red-500', 'bg-blue-500', 'bg-[#5e6e85]', 'bg-amber-500', 'bg-purple-500'];
    const falloPorDepartamento = Object.keys(deptMap).map((dept, index) => {
      const avgRisk = deptMap[dept].sumRisk / deptMap[dept].total;
      // Convertimos el risk score a tasa de fallo aproximada (100 - risk_score)
      const rate = Number((100 - avgRisk).toFixed(1));
      return {
        name: dept,
        rate: rate < 0 ? 0 : rate,
        color: colores[index % colores.length]
      };
    });

    // 5. Últimos logs OSINT
    const { data: logs } = await supabase
      .from('osint_logs')
      .select('*')
      .eq('id_organizacion', organizacionId)
      .order('creado_en', { ascending: false })
      .limit(5);

    const logsOsintRecientes = (logs || []).map(log => {
      const fecha = new Date(log.creado_en);
      const hora = fecha.toTimeString().split(' ')[0]; // HH:MM:SS

      let estadoBadging = 'LIMPIO';
      if (log.tipo_hallazgo.toLowerCase().includes('crítico') || log.tipo_hallazgo.toLowerCase().includes('vulnerabilidad')) {
        estadoBadging = 'CRÍTICO';
      } else if (log.fuente.toLowerCase().includes('sistema')) {
        estadoBadging = 'SISTEMA';
      }

      const detalleTexto = typeof log.detalle_json === 'object' 
        ? JSON.stringify(log.detalle_json) 
        : String(log.detalle_json);

      return {
        id: log.id,
        hora,
        fuente: log.fuente,
        tipo_hallazgo: log.tipo_hallazgo,
        detalle: detalleTexto,
        estadoBadging
      };
    });

    return {
      totalUsuarios: totalUsuarios || 0,
      tasaClics,
      tasaReportes,
      nivelRiesgoPromedio: Number(promedioRisk.toFixed(1)),
      falloPorDepartamento,
      logsOsintRecientes
    };
  }
}