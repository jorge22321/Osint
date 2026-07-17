//frontend/src/page/Dashboard.vue
<template>
  <div class="max-w-[1440px] mx-auto mt-6 space-y-5 animate-in fade-in duration-500">
    
    <div class="flex justify-between items-end mb-6">
      <div>
        <h2 class="text-2xl font-semibold text-white tracking-tight">Resumen Empresarial</h2>
        <p class="text-sm text-[#c3c6d7] mt-1">Métricas de postura defensiva e inteligencia de amenazas en tiempo real.</p>
      </div>
      <button class="bg-blue-600 text-white text-[11px] font-bold uppercase tracking-wider px-4 py-2 rounded-md hover:bg-blue-500 active:scale-95 transition-all flex items-center gap-2 shadow-lg shadow-blue-500/20">
        <i class="fa-solid fa-download"></i>
        Generar Reporte
      </button>
    </div>

      <section class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="glass-card p-4 rounded-xl border border-[#434655] hover:border-[#8d90a0] transition-colors">
          <p class="text-[11px] font-bold text-[#c3c6d7] mb-2 uppercase tracking-wider">Usuarios Totales</p>
          <div class="flex justify-between items-baseline">
            <h3 class="text-2xl font-bold text-white">12,450</h3>
            <span class="text-xs font-mono text-emerald-400 flex items-center gap-1">
              <i class="fa-solid fa-arrow-trend-up"></i> 12%
            </span>
          </div>
          <div class="mt-3 h-1 w-full bg-[#32343d] rounded-full overflow-hidden">
            <div class="h-full bg-blue-500 w-[75%]"></div>
          </div>
        </div>

        <div class="glass-card p-4 rounded-xl border-t-2 border-t-red-500 border-x border-b border-[#434655] hover:border-[#8d90a0] transition-colors bg-gradient-to-b from-red-500/5 to-transparent">
          <p class="text-[11px] font-bold text-[#c3c6d7] mb-2 uppercase tracking-wider">Tasa de Clics Phishing</p>
          <div class="flex justify-between items-baseline">
            <h3 class="text-2xl font-bold text-red-400">2.4%</h3>
            <span class="text-xs font-mono text-emerald-400 flex items-center gap-1">
              <i class="fa-solid fa-arrow-trend-down"></i> 0.5%
            </span>
          </div>
          <p class="mt-3 text-xs text-[#c3c6d7]">Vulnerabilidad crítica en RRHH</p>
        </div>

        <div class="glass-card p-4 rounded-xl border border-[#434655] hover:border-[#8d90a0] transition-colors">
          <p class="text-[11px] font-bold text-[#c3c6d7] mb-2 uppercase tracking-wider">Tasa de Reportes</p>
          <div class="flex justify-between items-baseline">
            <h3 class="text-2xl font-bold text-emerald-400">85%</h3>
            <span class="text-xs font-mono text-emerald-400 flex items-center gap-1">
              <i class="fa-solid fa-arrow-trend-up"></i> 5%
            </span>
          </div>
          <div class="mt-3 flex gap-1">
            <div class="h-1 flex-1 bg-emerald-500 rounded-full"></div>
            <div class="h-1 flex-1 bg-emerald-500 rounded-full"></div>
            <div class="h-1 flex-1 bg-emerald-500 rounded-full"></div>
            <div class="h-1 flex-1 bg-[#32343d] rounded-full"></div>
          </div>
        </div>

        <div class="glass-card p-4 rounded-xl border border-[#434655] flex flex-col items-center justify-center text-center relative overflow-hidden">
          <p class="text-[11px] font-bold text-[#c3c6d7] mb-1 uppercase tracking-wider z-10">Nivel de Riesgo</p>
          <div class="relative z-10 flex items-baseline gap-1">
            <h3 class="text-4xl font-bold text-blue-500 leading-tight">72</h3>
            <p class="text-xs font-bold text-[#c3c6d7]">/ 100</p>
          </div>
          <span class="mt-2 bg-[#32343d] px-2 py-0.5 rounded text-[9px] font-mono text-white uppercase tracking-widest z-10">Estable</span>
        </div>
      </section>

      <section class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div class="glass-card rounded-xl border border-[#434655] p-5 flex flex-col h-[320px]">
          <div class="flex justify-between items-start mb-4">
            <h4 class="text-sm font-semibold text-white">Evolución de Riesgo</h4>
            <select class="bg-transparent border-none text-xs font-bold text-[#c3c6d7] focus:ring-0 cursor-pointer outline-none">
              <option class="bg-[#1d1f27]">Últimos 6 Meses</option>
              <option class="bg-[#1d1f27]">Último Año</option>
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
          <div class="flex-1 flex flex-col justify-between">
            <div class="space-y-1.5" v-for="dept in departments" :key="dept.name">
              <div class="flex justify-between text-[11px] font-bold uppercase text-[#c3c6d7]">
                <span>{{ dept.name }}</span>
                <span>{{ dept.rate }}%</span>
              </div>
              <div class="h-1.5 w-full bg-[#32343d] rounded-full overflow-hidden">
                <div class="h-full rounded-full" :class="dept.color" :style="{ width: dept.rate + '%' }"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="glass-card rounded-xl border border-[#434655] p-6 relative overflow-hidden">
        <div class="relative z-10 max-w-2xl">
          <div class="flex items-center gap-4 mb-5">
            <div class="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center border border-blue-500/20">
              <i class="fa-solid fa-satellite-dish text-blue-500 text-lg"></i>
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
                class="w-full bg-[#11131b] border border-[#434655] rounded-md pl-9 pr-3 py-2.5 text-sm font-mono text-white focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none transition-all placeholder:text-[#8d90a0]/50" 
                placeholder="Ingrese dominio, ej., empresa.com" 
                type="text"
                v-model="scanDomain"
              />
            </div>
            <button type="submit" class="bg-white text-slate-900 text-[11px] font-bold uppercase tracking-widest px-6 py-2.5 rounded-md hover:bg-gray-200 active:scale-95 transition-all">
              Iniciar
            </button>
          </form>
          
          <div class="mt-4 flex items-center gap-6">
            <div class="flex items-center gap-2">
              <i class="fa-solid fa-circle-check text-emerald-400 text-xs"></i>
              <span class="text-xs text-[#c3c6d7]">Registros WHOIS indexados</span>
            </div>
            <div class="flex items-center gap-2">
              <i class="fa-solid fa-circle-check text-emerald-400 text-xs"></i>
              <span class="text-xs text-[#c3c6d7]">Monitor Dark Web activo</span>
            </div>
          </div>
        </div>
      </section>

      <section class="glass-card rounded-xl border border-[#434655]">
        <div class="p-4 border-b border-[#434655] flex justify-between items-center">
          <h4 class="text-[11px] font-bold uppercase tracking-wider text-white">Logs del Sistema OSINT</h4>
          <span class="text-[10px] font-mono text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded">TIEMPO REAL</span>
        </div>
        <div class="divide-y divide-[#434655]/50">
          
          <div class="p-3 flex items-center gap-4 hover:bg-[#32343d]/30 transition-colors">
            <span class="text-xs font-mono text-[#8d90a0] w-16">14:02:11</span>
            <i class="fa-solid fa-circle-check text-emerald-400 text-sm"></i>
            <p class="text-xs text-[#e1e2ed] flex-1">Chequeo de credenciales para <span class="text-blue-400">corp-internal.com</span>: Sin filtraciones.</p>
            <span class="bg-[#11131b] text-[#c3c6d7] border border-[#434655] px-2 py-0.5 rounded text-[9px] font-bold uppercase">Limpio</span>
          </div>

          <div class="p-3 flex items-center gap-4 hover:bg-[#32343d]/30 transition-colors">
            <span class="text-xs font-mono text-[#8d90a0] w-16">13:58:45</span>
            <i class="fa-solid fa-triangle-exclamation text-red-500 text-sm"></i>
            <p class="text-xs text-[#e1e2ed] flex-1">Actividad DNS sospechosa detectada en <span class="text-blue-400">dev-01.empresa.io</span></p>
            <span class="bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded text-[9px] font-bold uppercase">Crítico</span>
          </div>

          <div class="p-3 flex items-center gap-4 hover:bg-[#32343d]/30 transition-colors">
            <span class="text-xs font-mono text-[#8d90a0] w-16">13:42:00</span>
            <i class="fa-solid fa-circle-info text-blue-500 text-sm"></i>
            <p class="text-xs text-[#e1e2ed] flex-1">Campaña automatizada "Concientización Q3" completada.</p>
            <span class="bg-[#11131b] text-[#c3c6d7] border border-[#434655] px-2 py-0.5 rounded text-[9px] font-bold uppercase">Sistema</span>
          </div>

        </div>
      </section>

    </div>
  
</template>

<script setup>
import { ref } from 'vue'

// Estado del formulario de escaneo
const scanDomain = ref('')

const startScan = () => {
  if(scanDomain.value) {
    alert(`Iniciando escaneo OSINT para: ${scanDomain.value}...`)
    scanDomain.value = ''
  }
}

// Datos dinámicos para las barras de progreso
const departments = [
  { name: 'Tecnología (TI)', rate: 1.2, color: 'bg-blue-500' },
  { name: 'Recursos Humanos', rate: 6.8, color: 'bg-red-500' },
  { name: 'Ventas', rate: 4.5, color: 'bg-[#5e6e85]' },
  { name: 'Finanzas', rate: 2.1, color: 'bg-blue-500' },
  { name: 'Operaciones', rate: 3.3, color: 'bg-blue-500' }
]
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