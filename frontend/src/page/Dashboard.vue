<template>
  <div class="max-w-[1440px] mx-auto mt-6 space-y-5 animate-in fade-in duration-500">
    
    <!-- Header -->
    <div class="flex justify-between items-end mb-6">
      <div>
        <h2 class="text-2xl font-semibold text-white tracking-tight">Resumen Empresarial</h2>
        <p class="text-sm text-[#c3c6d7] mt-1">Métricas de postura defensiva e inteligencia de amenazas en tiempo real.</p>
      </div>
      <div class="flex gap-2">
        <button 
          @click="loadDashboardData" 
          :disabled="isLoading"
          class="bg-[#32343d] text-white text-[11px] font-bold uppercase tracking-wider px-3 py-2 rounded-md hover:bg-[#434655] active:scale-95 transition-all flex items-center gap-2 border border-[#434655]"
          title="Recargar datos"
        >
          <i class="fa-solid fa-rotate-right" :class="{ 'animate-spin': isLoading }"></i>
        </button>
        <button 
          @click="exportReport" 
          class="bg-blue-600 text-white text-[11px] font-bold uppercase tracking-wider px-4 py-2 rounded-md hover:bg-blue-500 active:scale-95 transition-all flex items-center gap-2 shadow-lg shadow-blue-500/20"
        >
          <i class="fa-solid fa-download"></i>
          Generar Reporte
        </button>
      </div>
    </div>

    <!-- Metricas Principales (KPIs) -->
    <section class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- Usuarios Totales -->
      <div class="glass-card p-4 rounded-xl border border-[#434655] hover:border-[#8d90a0] transition-colors">
        <p class="text-[11px] font-bold text-[#c3c6d7] mb-2 uppercase tracking-wider">Usuarios Totales</p>
        <div class="flex justify-between items-baseline">
          <h3 class="text-2xl font-bold text-white">{{ metrics.totalUsers.toLocaleString() }}</h3>
          <span class="text-xs font-mono text-emerald-400 flex items-center gap-1">
            <i class="fa-solid fa-users"></i> Activos
          </span>
        </div>
        <div class="mt-3 h-1 w-full bg-[#32343d] rounded-full overflow-hidden">
          <div class="h-full bg-blue-500 w-[100%]"></div>
        </div>
      </div>

      <!-- Tasa de Clics -->
      <div class="glass-card p-4 rounded-xl border-t-2 border-t-red-500 border-x border-b border-[#434655] hover:border-[#8d90a0] transition-colors bg-gradient-to-b from-red-500/5 to-transparent">
        <p class="text-[11px] font-bold text-[#c3c6d7] mb-2 uppercase tracking-wider">Tasa de Clics Phishing</p>
        <div class="flex justify-between items-baseline">
          <h3 class="text-2xl font-bold text-red-400">{{ metrics.clickRate }}%</h3>
          <span class="text-xs font-mono text-red-400 flex items-center gap-1">
            <i class="fa-solid fa-arrow-trend-up"></i> Tasa global
          </span>
        </div>
        <p class="mt-3 text-xs text-[#c3c6d7]">Vulnerabilidad calculada sobre envíos</p>
      </div>

      <!-- Tasa de Reportes -->
      <div class="glass-card p-4 rounded-xl border border-[#434655] hover:border-[#8d90a0] transition-colors">
        <p class="text-[11px] font-bold text-[#c3c6d7] mb-2 uppercase tracking-wider">Tasa de Reportes</p>
        <div class="flex justify-between items-baseline">
          <h3 class="text-2xl font-bold text-emerald-400">{{ metrics.reportRate }}%</h3>
          <span class="text-xs font-mono text-emerald-400 flex items-center gap-1">
            <i class="fa-solid fa-shield-halved"></i> Eficiencia
          </span>
        </div>
        <div class="mt-3 flex gap-1">
          <div class="h-1 flex-1 bg-emerald-500 rounded-full"></div>
          <div class="h-1 flex-1 bg-emerald-500 rounded-full"></div>
          <div class="h-1 flex-1 bg-emerald-500 rounded-full"></div>
          <div class="h-1 flex-1 bg-[#32343d] rounded-full"></div>
        </div>
      </div>

      <!-- Nivel de Riesgo Promedio -->
      <div class="glass-card p-4 rounded-xl border border-[#434655] flex flex-col items-center justify-center text-center relative overflow-hidden">
        <p class="text-[11px] font-bold text-[#c3c6d7] mb-1 uppercase tracking-wider z-10">Nivel de Riesgo</p>
        <div class="relative z-10 flex items-baseline gap-1">
          <h3 class="text-4xl font-bold text-blue-500 leading-tight">{{ metrics.riskScore }}</h3>
          <p class="text-xs font-bold text-[#c3c6d7]">/ 100</p>
        </div>
        <span 
          class="mt-2 px-2 py-0.5 rounded text-[9px] font-mono uppercase tracking-widest z-10 border"
          :class="metrics.riskScore < 50 ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'"
        >
          {{ metrics.riskScore < 50 ? 'Atención Requerida' : 'Estable' }}
        </span>
      </div>
    </section>

    <!-- Gráficos y Estadísticas de Departamentos -->
    <section class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div class="glass-card rounded-xl border border-[#434655] p-5 flex flex-col h-[320px]">
        <div class="flex justify-between items-start mb-4">
          <h4 class="text-sm font-semibold text-white">Evolución de Riesgo</h4>
          <select v-model="selectedPeriod" class="bg-transparent border-none text-xs font-bold text-[#c3c6d7] focus:ring-0 cursor-pointer outline-none">
            <option value="6m" class="bg-[#1d1f27]">Últimos 6 Meses</option>
            <option value="1y" class="bg-[#1d1f27]">Último Año</option>
          </select>
        </div>
        <div class="flex-1 chart-grid relative rounded border border-[#434655]/50 overflow-hidden bg-[#11131b]/30">
          <svg class="w-full h-full p-4" viewBox="0 0 400 200" preserveAspectRatio="none">
            <path d="M 0 50 L 80 70 L 160 40 L 240 100 L 320 130 L 400 160" fill="none" stroke="#3b82f6" stroke-width="2"></path>
            <circle cx="0" cy="50" fill="#60a5fa" r="4"></circle>
            <circle cx="80" cy="70" fill="#60a5fa" r="4"></circle>
            <circle cx="160" cy="40" fill="#60a5fa" r="4"></circle>
            <circle cx="240" cy="100" fill="#60a5fa" r="4"></circle>
            <circle cx="320" cy="130" fill="#60a5fa" r="4"></circle>
            <circle cx="400" cy="160" fill="#60a5fa" r="4"></circle>
          </svg>
          <div class="absolute bottom-2 left-0 w-full px-4 flex justify-between text-[9px] font-mono text-[#c3c6d7] opacity-60 uppercase">
            <span>Ene</span><span>Feb</span><span>Mar</span><span>Abr</span><span>May</span><span>Jun</span>
          </div>
        </div>
      </div>

      <div class="glass-card rounded-xl border border-[#434655] p-5 flex flex-col h-[320px]">
        <h4 class="text-sm font-semibold text-white mb-5">Tasa de Fallo por Departamento</h4>
        <div class="flex-1 flex flex-col justify-between overflow-y-auto pr-1">
          <div v-if="departments.length === 0" class="text-xs text-[#8d90a0] my-auto text-center">
            Sin datos de departamentos registrados.
          </div>
          <div class="space-y-1.5" v-for="dept in departments" :key="dept.name">
            <div class="flex justify-between text-[11px] font-bold uppercase text-[#c3c6d7]">
              <span>{{ dept.name }}</span>
              <span>{{ dept.rate }}%</span>
            </div>
            <div class="h-1.5 w-full bg-[#32343d] rounded-full overflow-hidden">
              <div class="h-full rounded-full transition-all duration-500" :class="dept.color || 'bg-blue-500'" :style="{ width: dept.rate + '%' }"></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Escaneo OSINT Automatizado -->
    <section class="glass-card rounded-xl border border-[#434655] p-6 relative overflow-hidden">
      <div class="relative z-10 max-w-2xl">
        <div class="flex items-center gap-4 mb-5">
          <div class="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center border border-blue-500/20">
            <i class="fa-solid fa-satellite-dish text-blue-500 text-lg" :class="{ 'animate-pulse': isScanning }"></i>
          </div>
          <div>
            <h4 class="text-base font-semibold text-white">Escaneo OSINT Automatizado</h4>
            <p class="text-xs text-[#c3c6d7] mt-0.5">Analiza dominios en busca de credenciales filtradas e infraestructura expuesta.</p>
          </div>
        </div>
        
        <form class="flex gap-3" @submit.prevent="startScan">
          <div class="flex-1 relative group">
            <i class="fa-solid fa-globe absolute left-3 top-1/2 -translate-y-1/2 text-[#8d90a0] group-focus-within:text-blue-500 transition-colors text-sm"></i>
            <input 
              class="w-full bg-[#11131b] border border-[#434655] rounded-md pl-9 pr-3 py-2.5 text-sm font-mono text-white focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none transition-all placeholder:text-[#8d90a0]/50 disabled:opacity-50" 
              placeholder="Ingrese dominio, ej., empresa.com" 
              type="text"
              v-model="scanDomain"
              :disabled="isScanning"
              required
            />
          </div>
          <button 
            type="submit" 
            :disabled="isScanning"
            class="bg-white text-slate-900 text-[11px] font-bold uppercase tracking-widest px-6 py-2.5 rounded-md hover:bg-gray-200 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            <i v-if="isScanning" class="fa-solid fa-spinner animate-spin"></i>
            <span>{{ isScanning ? 'Escaneando...' : 'Iniciar' }}</span>
          </button>
        </form>
        
        <div v-if="errorMessage" class="mt-3 text-xs text-red-400 flex items-center gap-1.5">
          <i class="fa-solid fa-circle-exclamation"></i>
          <span>{{ errorMessage }}</span>
        </div>

        <div class="mt-4 flex items-center gap-6">
          <div class="flex items-center gap-2">
            <i class="fa-solid fa-circle-check text-emerald-400 text-xs"></i>
            <span class="text-xs text-[#c3c6d7]">Registros WHOIS & Shodan</span>
          </div>
          <div class="flex items-center gap-2">
            <i class="fa-solid fa-circle-check text-emerald-400 text-xs"></i>
            <span class="text-xs text-[#c3c6d7]">Monitor Dark Web activo</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Logs del Sistema OSINT -->
    <section class="glass-card rounded-xl border border-[#434655]">
      <div class="p-4 border-b border-[#434655] flex justify-between items-center">
        <h4 class="text-[11px] font-bold uppercase tracking-wider text-white">Logs del Sistema OSINT</h4>
        <span class="text-[10px] font-mono text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded flex items-center gap-1.5">
          <span class="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping"></span>
          TIEMPO REAL
        </span>
      </div>

      <div class="divide-y divide-[#434655]/50">
        <div v-if="osintLogs.length === 0" class="p-4 text-center text-xs text-[#8d90a0]">
          No hay registros OSINT para mostrar. Inicie un escaneo arriba.
        </div>

        <div 
          v-for="log in osintLogs" 
          :key="log.id" 
          class="p-3 flex items-center gap-4 hover:bg-[#32343d]/30 transition-colors"
        >
          <span class="text-xs font-mono text-[#8d90a0] w-16">{{ log.hora }}</span>
          
          <i :class="getLogIconClass(log.estadoBadging)"></i>
          
          <p class="text-xs text-[#e1e2ed] flex-1">
            <span class="text-blue-400 font-mono font-bold">[{{ log.fuente }}]</span>
            {{ log.tipo_hallazgo }}: {{ log.detalle }}
          </p>
          
          <span :class="getLogBadgeClass(log.estadoBadging)">
            {{ log.estadoBadging }}
          </span>
        </div>
      </div>
    </section>

  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'

const GRAPHQL_URL = 'http://localhost:4000/graphql'

// Helper para extraer la Organización desde la sesión del usuario guardada en Login.vue
const obtenerOrganizacionActiva = () => {
  // 1. Verificar si ya existe en localStorage
  const orgDirecta = localStorage.getItem('organizacionId')
  if (orgDirecta) return orgDirecta

  // 2. Si no, extraer 'id_organizacion' del objeto 'ciso_user' guardado por Login.vue
  const cisoUserRaw = localStorage.getItem('ciso_user')
  if (cisoUserRaw) {
    try {
      const user = JSON.parse(cisoUserRaw)
      if (user && user.id_organizacion) {
        localStorage.setItem('organizacionId', user.id_organizacion)
        return user.id_organizacion
      }
    } catch (e) {
      console.error('Error al leer ciso_user desde localStorage:', e)
    }
  }

  return null
}

// Estado global de la Organización (obtenido directamente de la sesión real)
const idOrganizacion = ref(obtenerOrganizacionActiva())
const organizacionNombre = ref('Cargando...')

// Estado UI
const scanDomain = ref('')
const isScanning = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')
const selectedPeriod = ref('6m')

// Métricas KPI (Reactivo)
const metrics = reactive({
  totalUsers: 0,
  clickRate: 0,
  reportRate: 0,
  riskScore: 100
})

const departments = ref([])
const osintLogs = ref([])

// Función ejecutora GraphQL
async function executeGraphQL(query, variables = {}) {
  const response = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables })
  })
  const result = await response.json()
  if (result.errors) {
    throw new Error(result.errors[0]?.message || 'Error en GraphQL')
  }
  return result.data
}

// Cargar Métricas usando el UUID Real de la Sesión
const loadDashboardData = async () => {
  // Re-verificar la organización en caso de que no estuviera inicializada
  if (!idOrganizacion.value) {
    idOrganizacion.value = obtenerOrganizacionActiva()
  }

  if (!idOrganizacion.value) {
    errorMessage.value = 'No se encontró una sesión activa con organización. Vuelva a iniciar sesión.'
    return
  }

  isLoading.value = true
  errorMessage.value = ''
  try {
    const query = `
      query GetDashboardMetrics($organizacionId: ID!) {
        obtenerDashboardMetrics(organizacionId: $organizacionId) {
          totalUsuarios
          tasaClics
          tasaReportes
          nivelRiesgoPromedio
          falloPorDepartamento {
            name
            rate
            color
          }
          logsOsintRecientes {
            id
            hora
            fuente
            tipo_hallazgo
            detalle
            estadoBadging
          }
        }
      }
    `
    const data = await executeGraphQL(query, { organizacionId: idOrganizacion.value })
    if (data?.obtenerDashboardMetrics) {
      const res = data.obtenerDashboardMetrics
      metrics.totalUsers = res.totalUsuarios
      metrics.clickRate = res.tasaClics
      metrics.reportRate = res.tasaReportes
      metrics.riskScore = res.nivelRiesgoPromedio
      departments.value = res.falloPorDepartamento
      osintLogs.value = res.logsOsintRecientes
    }
  } catch (err) {
    console.error('Error al cargar métricas del Dashboard:', err)
    errorMessage.value = err.message || 'Error al cargar los datos.'
  } finally {
    isLoading.value = false
  }
}

// Iniciar Escaneo OSINT vinculado al UUID Real
const startScan = async () => {
  if (!scanDomain.value.trim()) return

  if (!idOrganizacion.value) {
    errorMessage.value = 'Se requiere una organización válida para realizar escaneos.'
    return
  }

  isScanning.value = true
  errorMessage.value = ''

  try {
    const mutation = `
      mutation ExecutarOsintScan($dominio: String!, $organizacionId: ID!) {
        osintScan(dominio: $dominio, organizacionId: $organizacionId) {
          id
          tipo_hallazgo
          detalle_json
          creado_en
        }
      }
    `
    await executeGraphQL(mutation, { 
      dominio: scanDomain.value.trim(),
      organizacionId: idOrganizacion.value 
    })

    scanDomain.value = ''
    await loadDashboardData()
  } catch (err) {
    console.error('Error durante el escaneo OSINT:', err)
    errorMessage.value = err.message || 'No se pudo completar el escaneo OSINT.'
  } finally {
    isScanning.value = false
  }
}

const getLogIconClass = (estado) => {
  switch (estado?.toUpperCase()) {
    case 'CRÍTICO':
      return 'fa-solid fa-triangle-exclamation text-red-500 text-sm'
    case 'LIMPIO':
      return 'fa-solid fa-circle-check text-emerald-400 text-sm'
    default:
      return 'fa-solid fa-circle-info text-blue-500 text-sm'
  }
}

const getLogBadgeClass = (estado) => {
  switch (estado?.toUpperCase()) {
    case 'CRÍTICO':
      return 'bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded text-[9px] font-bold uppercase'
    case 'LIMPIO':
      return 'bg-[#11131b] text-[#c3c6d7] border border-[#434655] px-2 py-0.5 rounded text-[9px] font-bold uppercase'
    default:
      return 'bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded text-[9px] font-bold uppercase'
  }
}

const exportReport = () => {
  alert('Generando y descargando el reporte consolidado...')
}

onMounted(() => {
  loadDashboardData()
})
</script>

<style scoped>
.glass-card {
  background: rgba(29, 31, 39, 0.6);
  backdrop-filter: blur(8px);
}
.chart-grid {
  background-image: radial-gradient(#434655 1px, transparent 1px);
  background-size: 20px 20px;
}
</style>