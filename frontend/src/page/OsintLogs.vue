<template>
  <!-- Contenedor principal -->
  <main class="flex-1 flex flex-col bg-[#14151a] text-white font-sans animate-in fade-in duration-500 h-full min-h-0"> 
    
    <!-- Barra de Filtros -->
    <div class="px-6 py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-[#1d1f27] shrink-0 border-b border-[#434655] relative z-20">
      <div class="flex items-center gap-4 flex-wrap">
        
        <!-- Desplegable: Fuente de Amenaza -->
        <div class="relative">
          <button 
            @click="isSourceDropdownOpen = !isSourceDropdownOpen"
            class="flex items-center gap-2 px-4 py-2 bg-[#2a2d39] border border-[#434655] rounded-lg text-sm font-medium hover:bg-[#32343d] transition-colors focus:outline-none"
          >
            <span class="text-[#c3c6d7]">Fuente:</span>
            <span class="text-white font-semibold">{{ selectedSource === 'TODAS' ? 'Todas las Fuentes' : selectedSource }}</span>
            <i class="fa-solid fa-chevron-down text-xs ml-1 text-[#c3c6d7] transition-transform duration-200" :class="{ 'rotate-180': isSourceDropdownOpen }"></i>
          </button>

          <!-- Menú Flotante de Fuentes -->
          <div 
            v-if="isSourceDropdownOpen" 
            class="absolute top-full left-0 mt-2 w-56 bg-[#1d1f27] border border-[#434655] rounded-lg shadow-2xl z-50 py-1 overflow-hidden animate-in fade-in duration-150"
          >
            <button 
              @click="setSourceFilter('TODAS')"
              class="w-full text-left px-4 py-2 text-xs hover:bg-[#2a2d39] transition-colors flex items-center justify-between"
              :class="selectedSource === 'TODAS' ? 'text-blue-400 font-bold bg-[#2a2d39]/50' : 'text-[#c3c6d7]'"
            >
              <span>Todas las Fuentes</span>
              <i v-if="selectedSource === 'TODAS'" class="fa-solid fa-check text-xs"></i>
            </button>
            <div class="h-[1px] bg-[#434655] my-1"></div>
            <button 
              v-for="source in availableSources" 
              :key="source"
              @click="setSourceFilter(source)"
              class="w-full text-left px-4 py-2 text-xs hover:bg-[#2a2d39] transition-colors flex items-center justify-between"
              :class="selectedSource === source ? 'text-blue-400 font-bold bg-[#2a2d39]/50' : 'text-[#c3c6d7]'"
            >
              <span>{{ source }}</span>
              <i v-if="selectedSource === source" class="fa-solid fa-check text-xs"></i>
            </button>
          </div>
        </div>
        
        <!-- Filtros de Severidad -->
        <div class="flex items-center gap-1 bg-[#14151a] p-1 rounded-lg border border-[#434655]">
          <button 
            v-for="sev in severityOptions" 
            :key="sev.value"
            @click="setSeverityFilter(sev.value)"
            :class="[
              'px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all cursor-pointer',
              selectedSeverity === sev.value ? sev.activeClass : 'text-[#adb4ce] hover:text-white'
            ]"
          >
            {{ sev.label }}
          </button>
        </div>
      </div>
      
      <div class="flex items-center gap-2">
        <button 
          @click="runScan" 
          :disabled="isScanning"
          class="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-500 active:scale-95 transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-md shadow-blue-600/20"
        >
          <i :class="['fa-solid fa-rotate-right', { 'animate-spin': isScanning }]"></i>
          {{ isScanning ? 'Escaneando...' : 'Ejecutar Escaneo OSINT' }}
        </button>
      </div>
    </div>

    <!-- Cierre de menú al hacer clic fuera -->
    <div 
      v-if="isSourceDropdownOpen" 
      @click="isSourceDropdownOpen = false" 
      class="fixed inset-0 z-10 bg-transparent"
    ></div>

    <!-- Diseño de Panel Dividido (Split-Pane) -->
    <div class="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
      
      <!-- Panel Izquierdo: Lista de Filtraciones -->
      <div class="w-full lg:w-[400px] max-h-[42vh] lg:max-h-none border-b lg:border-b-0 lg:border-r border-[#434655] flex flex-col bg-[#1d1f27] overflow-y-auto custom-scrollbar flex-shrink-0">
        <div class="sticky top-0 z-10 flex items-center justify-between border-b border-[#434655] bg-[#1d1f27] px-4 py-2 text-[11px] text-[#adb4ce]">
          <span>{{ filteredLogs.length }} visibles</span>
          <span>{{ logs.length }} de {{ totalLogs }} cargados</span>
        </div>
        
        <!-- Estado Vacío (Sin Logs para los Filtros Seleccionados) -->
        <div v-if="filteredLogs.length === 0" class="p-8 text-center text-[#adb4ce] flex flex-col items-center justify-center my-auto">
          <i class="fa-solid fa-filter-circle-xmark text-3xl mb-3 text-[#434655]"></i>
          <p class="text-sm font-semibold">Sin hallazgos coincidentes</p>
          <p class="text-xs text-[#c3c6d7] mt-1">Prueba cambiando la fuente o el nivel de severidad.</p>
        </div>

        <template v-else v-for="(log, index) in filteredLogs" :key="log.id">
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
          <div v-if="index !== filteredLogs.length - 1" class="h-[1px] w-full bg-[#434655]"></div>
        </template>

        <button
          v-if="hasMoreLogs"
          :disabled="isLoadingLogs"
          class="m-4 rounded-lg border border-[#434655] px-4 py-2 text-xs font-bold text-blue-300 hover:bg-[#2a2d39] disabled:opacity-50"
          @click="fetchLogs(false)"
        >
          {{ isLoadingLogs ? 'Cargando...' : 'Cargar más registros' }}
        </button>
      </div>

      <!-- Panel Derecho: Inspector de Evidencia -->
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
            <span class="text-[#c3c6d7] text-xs font-mono">ID: {{ selectedLog.id }}</span>
          </div>
          
          <h1 class="text-2xl font-bold text-white mb-6">{{ selectedLog.title }}</h1>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
            <p class="text-sm text-[#adb4ce] leading-relaxed mb-4">{{ selectedLog.details.analysis }}</p>
            
            <div :class="['p-4 border-l-4 rounded-r-lg', selectedLog.impactBgClass]">
              <p class="text-sm font-medium" :class="selectedLog.impactTextClass">
                <span class="font-bold">Impacto:</span> {{ selectedLog.details.impact }}
              </p>
            </div>
          </div>
        </div>

        <!-- Panel Inferior: Ventana de Evidencia JSON -->
        <div class="bg-[#0d0e12]">
          <div class="flex items-center justify-between px-6 py-2 bg-[#1d1f27] border-b border-[#434655]">
            <div class="flex items-center gap-2">
              <i class="fa-solid fa-code text-[#c3c6d7] text-sm"></i>
              <span class="text-xs font-bold uppercase tracking-widest text-[#adb4ce]">Traza de Evidencia JSON</span>
            </div>
            <div class="flex items-center gap-2">
              <!-- Botón Copiar -->
              <button 
                @click="copyJsonToClipboard"
                class="p-2 text-[#c3c6d7] hover:text-white transition-colors flex items-center gap-1.5 text-xs font-mono" 
                :title="isCopied ? '¡Copiado!' : 'Copiar JSON'"
              >
                <i :class="isCopied ? 'fa-solid fa-check text-emerald-400' : 'fa-solid fa-copy'"></i>
                <span v-if="isCopied" class="text-emerald-400 font-sans">¡Copiado!</span>
              </button>

              <!-- Botón Descargar -->
              <button 
                @click="downloadJsonFile"
                class="p-2 text-[#c3c6d7] hover:text-white transition-colors text-xs" 
                title="Descargar archivo JSON"
              >
                <i class="fa-solid fa-download"></i>
              </button>
            </div>
          </div>
          
          <div class="p-6 text-sm font-mono overflow-x-auto custom-scrollbar">
            <pre class="leading-relaxed text-[#c9d2f0]"><code>{{ formattedJSON(selectedLog.json) }}</code></pre>
          </div>
        </div>
      </div>
      
      <!-- Panel de fallback si no hay log seleccionado -->
      <div v-else class="flex-1 bg-[#14151a] flex items-center justify-center text-[#c3c6d7] text-sm">
        Selecciona un registro de la lista para inspeccionar la evidencia.
      </div>

    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { GRAPHQL_URL } from '@/config/api';
import { promptNotice, showNotice } from '@/composables/useNotification';

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

// -------------------- 3. Estados de Filtros e Interacción --------------------
const isScanning = ref(false);
const isLoadingLogs = ref(false);
const logs = ref<DisplayLog[]>([]);
const selectedLog = ref<DisplayLog | null>(null);
const totalLogs = ref(0);
const pageSize = 50;

const hasMoreLogs = computed(() => logs.value.length < totalLogs.value);

// Estados de Filtros
const selectedSource = ref<string>('TODAS');
const selectedSeverity = ref<string>('TODOS');
const isSourceDropdownOpen = ref<boolean>(false);
const isCopied = ref<boolean>(false);

// Opciones dinámicas de Severidad
const severityOptions = [
  { label: 'Todos', value: 'TODOS', activeClass: 'bg-[#32343d] text-white border border-[#434655]' },
  { label: 'Crítico', value: 'CRÍTICO', activeClass: 'bg-red-500/20 text-red-400 border border-red-500/30' },
  { label: 'Alto', value: 'ALTO', activeClass: 'bg-orange-500/20 text-orange-400 border border-orange-500/30' },
  { label: 'Medio', value: 'MEDIO', activeClass: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' },
  { label: 'Bajo', value: 'BAJO', activeClass: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' }
];

// Computado: Extraer Fuentes Únicas disponibles en los logs
const availableSources = computed(() => {
  const sourcesSet = new Set(logs.value.map(l => l.source));
  return Array.from(sourcesSet);
});

// Computado: Filtrado de Logs según Fuente y Severidad seleccionadas
const filteredLogs = computed(() => {
  return logs.value.filter(log => {
    const matchesSource = selectedSource.value === 'TODAS' || log.source.toLowerCase() === selectedSource.value.toLowerCase();
    const matchesSeverity = selectedSeverity.value === 'TODOS' || log.severity.toUpperCase() === selectedSeverity.value.toUpperCase();
    return matchesSource && matchesSeverity;
  });
});

// Observar los logs filtrados para recalcular el seleccionado
watch(filteredLogs, (newFiltered) => {
  if (newFiltered.length > 0) {
    // Mantener la selección si aún está dentro del filtro, de lo contrario seleccionar el primero
    if (!selectedLog.value || !newFiltered.some(l => l.id === selectedLog.value?.id)) {
      selectedLog.value = newFiltered[0];
    }
  } else {
    selectedLog.value = null;
  }
});

// Cambiar filtro de Fuente
const setSourceFilter = (source: string) => {
  selectedSource.value = source;
  isSourceDropdownOpen.value = false;
};

// Cambiar filtro de Severidad
const setSeverityFilter = (sev: string) => {
  selectedSeverity.value = sev;
};

// -------------------- 4. Lógica de Copiar y Descargar JSON --------------------
const copyJsonToClipboard = async () => {
  if (!selectedLog.value) return;
  try {
    const formattedJson = JSON.stringify(selectedLog.value.json, null, 2);
    await navigator.clipboard.writeText(formattedJson);
    isCopied.value = true;
    setTimeout(() => {
      isCopied.value = false;
    }, 2000);
  } catch (err) {
    console.error('Error al copiar al portapapeles:', err);
  }
};

const downloadJsonFile = () => {
  if (!selectedLog.value) return;
  const jsonString = JSON.stringify(selectedLog.value.json, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `evidencia_osint_${selectedLog.value.id}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// -------------------- 5. Formateador de Logs --------------------
const formatearLogs = (rawLogs: OsintLog[]): DisplayLog[] => {
  return rawLogs.map((log: OsintLog) => {
    const { detalle_json, fuente, tipo_hallazgo, creado_en, id } = log;

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

    // --- Proveedor: XposedOrNot ---
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

    // --- Proveedor: Shodan ---
    else if (fuente.includes('Shodan')) {
      const puertos = detalle_json.puertos_abiertos || [];
      const cves = detalle_json.vulnerabilidades_cve || [];
      title = 'Infraestructura Expuesta';
      summary = `IP: ${detalle_json.ip_objetivo} - Puertos abiertos: ${puertos.length}`;
      target = detalle_json.hostnames?.[0] || detalle_json.ip_objetivo || 'Servidor Desconocido';
      analysis = cves.length > 0 
        ? `Se detectaron vulnerabilidades conocidas (CVE): ${cves.join(', ')}` 
        : `Se detectaron ${puertos.length} puertos expuestos. No hay CVEs públicos críticos activos.`;
      impact = `Puertos expuestos: ${puertos.join(', ')}`;
      motivation = 'Escaneo de red e infraestructura';
      confidence = 'Alta (Shodan)';
      severity = cves.length > 0 ? 'ALTO' : 'BAJO';
      
      if (cves.length > 0) {
        badgeClass = 'bg-orange-500/10 text-orange-400 border-orange-500/20';
        badgeHeaderClass = 'bg-orange-500 text-white';
        impactBgClass = 'bg-orange-500/10 border-orange-500';
        impactTextClass = 'text-orange-200';
      } else {
        badgeClass = 'bg-blue-500/10 text-blue-400 border-blue-500/20';
        badgeHeaderClass = 'bg-blue-500 text-white';
      }
      
      icon = 'fa-solid fa-server';
      iconBgClass = 'bg-blue-500/20';
      iconTextClass = 'text-blue-400';
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
      details: { motivation, confidence, target, analysis, impact },
      json,
    };
  });
};

// -------------------- 6. Llamadas a la API --------------------
const fetchLogs = async (reset = true) => {
  if (isLoadingLogs.value) return;
  isLoadingLogs.value = true;
  try {
    const response = await fetch(GRAPHQL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('ciso_token')}`,
      },
      body: JSON.stringify({
        query: `
          query GetOsintLogs($organizacionId: ID!, $limit: Int!, $offset: Int!) {
            osintLogsPage(organizacionId: $organizacionId, limit: $limit, offset: $offset) {
              items {
                id
                fuente
                tipo_hallazgo
                detalle_json
                creado_en
              }
              total
              hasMore
            }
          }
        `,
        variables: {
          organizacionId: admin.value.id_organizacion,
          limit: pageSize,
          offset: reset ? 0 : logs.value.length,
        },
      }),
    });

    const result = await response.json();
    if (result.errors) throw new Error(result.errors[0].message);
    if (result.data) {
      const page = result.data.osintLogsPage;
      const formatted = formatearLogs(page.items);
      logs.value = reset ? formatted : [...logs.value, ...formatted];
      totalLogs.value = page.total;
      if (filteredLogs.value.length > 0) selectedLog.value = filteredLogs.value[0];
    }
  } catch (error: any) {
    console.error('Error fetching OSINT logs:', error);
    showNotice({ type: 'error', message: error.message || 'No se pudieron cargar los logs OSINT.' });
  } finally {
    isLoadingLogs.value = false;
  }
};

const runScan = async () => {
  isScanning.value = true;
  const dominio = await promptNotice('Ingresa el dominio que deseas analizar.', {
    title: 'Nuevo escaneo OSINT',
    inputPlaceholder: 'empresa.com',
    confirmText: 'Iniciar escaneo'
  });
  if (!dominio) {
    isScanning.value = false;
    return;
  }

  try {
    const response = await fetch(GRAPHQL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('ciso_token')}`,
      },
      body: JSON.stringify({
        query: `
          mutation OsintScan($dominio: String!, $organizacionId: ID!) {
            osintScanDetailed(dominio: $dominio, organizacionId: $organizacionId) {
              hallazgosEncontrados
              nuevosGuardados
              duplicadosOmitidos
              proveedores {
                nombre
                estado
                hallazgos
                mensaje
              }
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
      showNotice({ type: 'error', message: result.errors[0].message });
    } else {
      const scan = result.data.osintScanDetailed;
      const failed = scan.proveedores.filter((provider: any) => provider.estado === 'ERROR');
      showNotice({
        type: failed.length ? 'warning' : 'success',
        title: failed.length ? 'Escaneo completado parcialmente' : 'Escaneo completado',
        message: `${scan.hallazgosEncontrados} hallazgo(s), ${scan.nuevosGuardados} nuevo(s) y ${scan.duplicadosOmitidos} duplicado(s) omitido(s).${failed.length ? ` Fallaron: ${failed.map((provider: any) => provider.nombre).join(', ')}.` : ''}`,
      });
      await fetchLogs(true);
    }
  } catch (error) {
    console.error('Error en escaneo OSINT:', error);
    showNotice({ type: 'error', message: 'No se pudo conectar con el servidor.' });
  } finally {
    isScanning.value = false;
  }
};

const formattedJSON = (jsonObj: Record<string, any>) => jsonObj ? JSON.stringify(jsonObj, null, 2) : '';

onMounted(() => {
  fetchLogs();
});
</script>

<style scoped>
.animate-in {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(6px); }
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
