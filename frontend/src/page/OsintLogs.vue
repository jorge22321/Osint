<template>
  <!-- Contenedor principal -->
  <main class="flex-1 flex flex-col bg-[#14151a] text-white font-sans animate-in fade-in duration-500 h-full min-h-0"> 
    <!-- Barra de Filtros -->
    <div class="px-6 py-4 flex items-center justify-between bg-[#1d1f27] shrink-0 border-b border-[#434655]">
      <div class="flex items-center gap-4">
        <div class="relative group">
          <button class="flex items-center gap-2 px-4 py-2 bg-[#2a2d39] border border-[#434655] rounded-lg text-sm font-medium hover:bg-[#32343d] transition-colors">
            <span class="text-[#c3c6d7]">Fuente de Amenaza:</span>
            <span>Todas las Fuentes</span>
            <i class="fa-solid fa-chevron-down text-xs ml-1 text-[#c3c6d7]"></i>
          </button>
        </div>
        
        <!-- Filtros de Severidad -->
        <div class="flex items-center gap-1 bg-[#14151a] p-1 rounded-lg border border-[#434655]">
          <button class="px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider bg-red-500/20 text-red-400 border border-red-500/30 transition-all">Crítico</button>
          <button class="px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider text-[#adb4ce] hover:text-white transition-colors">Alto</button>
          <button class="px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider text-[#adb4ce] hover:text-white transition-colors">Medio</button>
        </div>
      </div>
      
      <div class="flex items-center gap-2">
        <button 
          @click="runScan" 
          :disabled="isScanning"
          class="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-500 active:scale-95 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
        >
          <i :class="['fa-solid fa-rotate-right', { 'animate-spin': isScanning }]"></i>
          {{ isScanning ? 'Escaneando...' : 'Ejecutar Escaneo OSINT' }}
        </button>
      </div>
    </div>

    <!-- Diseño de Panel Dividido (Split-Pane) -->
    <div class="flex-1 flex overflow-hidden min-h-0">    
      
      <!-- Panel Izquierdo: Lista de Filtraciones -->
      <div class="w-[400px] border-r border-[#434655] flex flex-col bg-[#1d1f27] overflow-y-auto custom-scrollbar flex-shrink-0">        
        <template v-for="(log, index) in logs" :key="log.id">
          <!-- Tarjeta de Log -->
          <div 
            @click="selectedLog = log"
            :class="[
              'p-4 border-l-4 cursor-pointer hover:bg-[#2a2d39] transition-colors',
              selectedLog?.id === log.id ? 'bg-[#2a2d39] border-blue-500' : 'border-transparent'
            ]"
          >
            <div class="flex justify-between items-start mb-2">
              <div :class="['w-8 h-8 rounded-lg flex items-center justify-center', log.iconBgClass, log.iconTextClass]">
                <i :class="log.icon"></i>
              </div>
              <span class="text-[10px] font-bold text-[#c3c6d7] uppercase tracking-widest">{{ log.timeAgo }}</span>
            </div>
            
            <h4 class="font-semibold text-white mb-1 text-sm">{{ log.title }}</h4>
            <p class="text-xs text-[#adb4ce] line-clamp-2 leading-relaxed">{{ log.summary }}</p>
            
            <div class="mt-3 flex items-center gap-2">
              <span :class="['px-2 py-0.5 border text-[10px] font-bold rounded uppercase', log.badgeClass]">
                {{ log.severity }}
              </span>
              <span class="text-[10px] text-[#c3c6d7]">Fuente: {{ log.source }}</span>
            </div>
          </div>
          
          <!-- Divisor -->
          <div v-if="index !== logs.length - 1" class="h-[1px] w-full bg-[#434655]"></div>
        </template>
      </div>

      <!-- Panel Derecho: Inspector de Evidencia -->
      <!-- MODIFICACIÓN AQUÍ: Se simplificó a un layout en bloque (sin flex-col) para que fluya hacia abajo -->
      <div
        v-if="selectedLog"
        class="flex-1 bg-[#14151a] overflow-y-auto custom-scrollbar"
      >
        <!-- Cabecera del Inspector y Resumen -->
        <div class="p-8 border-b border-[#434655] bg-[#1d1f27]">
          <div class="flex items-center gap-3 mb-4">
            <span :class="['px-3 py-1 text-xs font-bold rounded-lg uppercase tracking-widest', selectedLog.badgeHeaderClass]">
              Alerta {{ selectedLog.severity }}
            </span>
            <span class="text-[#c3c6d7] text-xs">ID: {{ selectedLog.id }}</span>
          </div>
          
          <h1 class="text-2xl font-bold text-white mb-6">{{ selectedLog.title }}</h1>
          
          <div class="grid grid-cols-3 gap-6 mb-8">
            <div class="p-4 bg-[#2a2d39] rounded-lg border border-[#434655]">
              <p class="text-xs text-[#c3c6d7] mb-1">Motivación del Actor</p>
              <p class="text-sm font-semibold text-white">{{ selectedLog.details.motivation }}</p>
            </div>
            <div class="p-4 bg-[#2a2d39] rounded-lg border border-[#434655]">
              <p class="text-xs text-[#c3c6d7] mb-1">Nivel de Confianza</p>
              <p class="text-sm font-semibold text-white">{{ selectedLog.details.confidence }}</p>
            </div>
            <div class="p-4 bg-[#2a2d39] rounded-lg border border-[#434655]">
              <p class="text-xs text-[#c3c6d7] mb-1">Entidad Objetivo</p>
              <p class="text-sm font-semibold text-white">{{ selectedLog.details.target }}</p>
            </div>
          </div>
          
          <div class="max-w-none">
            <h3 class="text-base font-semibold text-blue-400 mb-2">Análisis de Vulnerabilidad</h3>
            <p class="text-sm text-[#adb4ce] leading-relaxed mb-4" v-html="selectedLog.details.analysis"></p>
            
            <div :class="['p-4 border-l-4 rounded-r-lg', selectedLog.impactBgClass]">
              <p class="text-sm font-medium" :class="selectedLog.impactTextClass">
                <span class="font-bold">Impacto:</span> {{ selectedLog.details.impact }}
              </p>
            </div>
          </div>
        </div>

        <!-- Panel Inferior: Ventana de Evidencia JSON -->
        <!-- MODIFICACIÓN AQUÍ: Se quitaron las clases flex-1 y min-h-0 para que adopte su altura real -->
        <div class="bg-[#0d0e12]">
          <div class="flex items-center justify-between px-6 py-2 bg-[#1d1f27] border-b border-[#434655]">
            <div class="flex items-center gap-2">
              <i class="fa-solid fa-code text-[#c3c6d7] text-sm"></i>
              <span class="text-xs font-bold uppercase tracking-widest text-[#adb4ce]">Traza de Evidencia JSON</span>
            </div>
            <div class="flex items-center gap-2">
              <button class="p-2 text-[#c3c6d7] hover:text-white transition-colors" title="Copiar">
                <i class="fa-solid fa-copy"></i>
              </button>
              <button class="p-2 text-[#c3c6d7] hover:text-white transition-colors" title="Descargar">
                <i class="fa-solid fa-download"></i>
              </button>
            </div>
          </div>
          
          <!-- MODIFICACIÓN AQUÍ: Se usa overflow-x-auto por si el texto JSON es muy largo a lo ancho, pero ya no restringe la altura vertical -->
          <div class="p-6 text-sm font-mono overflow-x-auto custom-scrollbar">
            <pre class="leading-relaxed"><code v-html="highlightedJSON(selectedLog.json)"></code></pre>
          </div>
        </div>
      </div>
      
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';

// -------------------- 1. Definición de tipos --------------------
interface OsintLog {
  id: string;
  id_organizacion: string;
  id_usuario_objetivo?: string | null;
  fuente: string;
  tipo_hallazgo: string;
  detalle_json: Record<string, any>;
  creado_en: string;
}

interface DisplayLog {
  id: string;
  timeAgo: string;
  title: string;
  summary: string;
  severity: string;
  source: string;
  icon: string;
  iconBgClass: string;
  iconTextClass: string;
  badgeClass: string;
  badgeHeaderClass: string;
  impactBgClass: string;
  impactTextClass: string;
  details: {
    motivation: string;
    confidence: string;
    target: string;
    analysis: string;
    impact: string;
  };
  json: Record<string, any>;
}

// -------------------- 2. Composable useAuth (inline) --------------------
const admin = computed(() => {
  try {
    const stored = localStorage.getItem('ciso_user');
    return stored ? JSON.parse(stored) : { id_organizacion: '' };
  } catch {
    return { id_organizacion: '' };
  }
});

// -------------------- 3. Estado y lógica --------------------
const isScanning = ref(false);
const logs = ref<DisplayLog[]>([]);
const selectedLog = ref<DisplayLog | null>(null);

// Obtener los logs al montar el componente
const fetchLogs = async () => {
  try {
    const response = await fetch('http://localhost:4000/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('ciso_token')}`,
      },
      body: JSON.stringify({
        query: `
          query GetOsintLogs($organizacionId: ID!) {
            osintLogs(organizacionId: $organizacionId) {
              id
              fuente
              tipo_hallazgo
              detalle_json
              creado_en
            }
          }
        `,
        variables: {
          organizacionId: admin.value.id_organizacion,
        },
      }),
    });

    const result = await response.json();
    if (result.data) {
      logs.value = result.data.osintLogs.map((log: OsintLog) => {
        const { detalle_json, fuente, tipo_hallazgo, creado_en, id } = log;

        // Configuración por defecto (fallback)
        let title = tipo_hallazgo || 'Registro OSINT';
        let summary = '';
        let severity = 'BAJO';
        let icon = 'fa-solid fa-database';
        let iconBgClass = 'bg-blue-500/20';
        let iconTextClass = 'text-blue-400';
        let badgeClass = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
        let badgeHeaderClass = 'bg-emerald-500 text-white';
        let impactBgClass = 'bg-emerald-500/10 border-emerald-500';
        let impactTextClass = 'text-emerald-200';
        let target = 'Desconocido';
        let analysis = 'Sin descripción disponible';
        let impact = 'No se encontraron datos adicionales.';
        let motivation = 'Sin información';
        let confidence = 'No determinada';
        let json = detalle_json;

        // --- Proveedor: Hunter.io ---
        if (fuente === 'Hunter.io') {
          const { email = '', nombre = '', cargo = '', fuente: sourceUrl = '' } = detalle_json;
          title = nombre || email || 'Correo expuesto';
          summary = `${email || 'Sin email'} - ${cargo || 'Sin cargo'}`;
          target = email || 'Desconocido';
          analysis = `Correo electrónico ${email} encontrado en Hunter.io. ${cargo ? `Cargo: ${cargo}.` : ''}`;          
          impact = `Fuente: ${sourceUrl || 'desconocida'}`;
          motivation = 'Exposición de correo corporativo';
          confidence = 'Alta (Hunter.io)';
          severity = 'MEDIO';
          badgeClass = 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
          badgeHeaderClass = 'bg-yellow-500 text-white';
          impactBgClass = 'bg-yellow-500/10 border-yellow-500';
          impactTextClass = 'text-yellow-200';
          icon = 'fa-solid fa-envelope';
          iconBgClass = 'bg-yellow-500/20';
          iconTextClass = 'text-yellow-400';
        }

        // --- Proveedor: XposedOrNot (si en algún momento funciona) ---
        else if (fuente === 'XposedOrNot') {
          const { nombre_brecha = '', dominio_afectado = '', descripcion = '', registros_expuestos = 0 } = detalle_json;
          title = nombre_brecha || 'Brecha desconocida';
          summary = descripcion ? descripcion.substring(0, 100) + '...' : 'Sin descripción';
          target = dominio_afectado || 'Desconocido';
          analysis = descripcion || 'Sin descripción';
          impact = `Registros expuestos: ${registros_expuestos.toLocaleString()}`;
          motivation = registros_expuestos > 0 ? 'Brecha de datos' : 'Posible brecha';
          confidence = 'Media';
          if (registros_expuestos > 1000000) {
            severity = 'CRÍTICO';
            badgeClass = 'bg-red-500/10 text-red-400 border-red-500/20';
            badgeHeaderClass = 'bg-red-500 text-white';
            impactBgClass = 'bg-red-500/10 border-red-500';
            impactTextClass = 'text-red-200';
            icon = 'fa-solid fa-triangle-exclamation';
            iconBgClass = 'bg-red-500/20';
            iconTextClass = 'text-red-400';
          } else if (registros_expuestos > 100000) {
            severity = 'ALTO';
            badgeClass = 'bg-orange-500/10 text-orange-400 border-orange-500/20';
            badgeHeaderClass = 'bg-orange-500 text-white';
            impactBgClass = 'bg-orange-500/10 border-orange-500';
            impactTextClass = 'text-orange-200';
            icon = 'fa-solid fa-shield-halved';
            iconBgClass = 'bg-orange-500/20';
            iconTextClass = 'text-orange-400';
          } else if (registros_expuestos > 0) {
            severity = 'MEDIO';
            badgeClass = 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
            badgeHeaderClass = 'bg-yellow-500 text-white';
            impactBgClass = 'bg-yellow-500/10 border-yellow-500';
            impactTextClass = 'text-yellow-200';
            icon = 'fa-solid fa-database';
            iconBgClass = 'bg-yellow-500/20';
            iconTextClass = 'text-yellow-400';
          }
        }

        // --- Proveedor desconocido (fallback) ---
        else {
          title = tipo_hallazgo || 'Registro OSINT';
          summary = JSON.stringify(detalle_json).substring(0, 100);
          analysis = 'Sin análisis detallado';
          impact = 'Ver JSON para más detalles';
          motivation = 'No especificado';
          confidence = 'No determinada';
        }

        return {
          id,
          timeAgo: new Date(creado_en).toLocaleString(),
          title,
          summary,
          severity,
          source: fuente,
          icon,
          iconBgClass,
          iconTextClass,
          badgeClass,
          badgeHeaderClass,
          impactBgClass,
          impactTextClass,
          details: {
            motivation,
            confidence,
            target,
            analysis,
            impact,
          },
          json,
        };
      });

      if (logs.value.length > 0) {
        selectedLog.value = logs.value[0];
      }
    }
  } catch (error) {
    console.error('Error fetching OSINT logs:', error);
  }
};
const runScan = async () => {
  isScanning.value = true;
  const dominio = prompt('Ingresa el dominio a escanear (ej: empresa.com)');
  if (!dominio) {
    isScanning.value = false;
    return;
  }

  try {
    const response = await fetch('http://localhost:4000/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('ciso_token')}`,
      },
      body: JSON.stringify({
        query: `
          mutation OsintScan($dominio: String!, $organizacionId: ID!) {
            osintScan(dominio: $dominio, organizacionId: $organizacionId) {
              id
              fuente
              tipo_hallazgo
              detalle_json
              creado_en
            }
          }
        `,
        variables: {
          dominio,
          organizacionId: admin.value.id_organizacion,
        },
      }),
    });

    const result = await response.json();
    if (result.errors) {
      alert('Error: ' + result.errors[0].message);
    } else {
      alert(`Escaneo completado. Se encontraron ${result.data.osintScan.length} hallazgos.`);
      await fetchLogs(); // recargar lista
    }
  } catch (error) {
    console.error('Error en escaneo OSINT:', error);
    alert('No se pudo conectar con el servidor.');
  } finally {
    isScanning.value = false;
  }
};

const highlightedJSON = (jsonObj: Record<string, any>) => {
  const jsonStr = JSON.stringify(jsonObj, null, 2);
  return jsonStr
    .replace(/"(.*?)":/g, '<span class="text-blue-400">"$1"</span>:')
    .replace(/: "(.*?)"/g, ': <span class="text-green-400">"$1"</span>')
    .replace(/: ([0-9]+(\.[0-9]+)?)/g, ': <span class="text-orange-400">$1</span>')
    .replace(/: (true|false)/g, ': <span class="text-red-400">$1</span>');
};

onMounted(() => {
  fetchLogs();
});
</script>

<style scoped>
.animate-in {
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: #14151a;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #434655;
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #5a5e73;
}
</style>