<template>
  <div class="max-w-7xl mx-auto mb-10 mt-6 animate-in fade-in duration-500">
    
    <!-- Cabecera -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
      <div>
        <h2 class="text-3xl font-bold text-[#e1e2ed] tracking-tight">Directorio de Empleados</h2>
        <p class="text-[#8d90a0] text-sm mt-1">Monitorea y gestiona los vectores de riesgo de identidad en la organización.</p>
      </div>
      <div class="flex items-center gap-2">
        <button 
          @click="showModal = true"
          class="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-blue-500 active:scale-95 transition-all shadow-lg shadow-blue-500/20"
        >
          <i class="fa-solid fa-user-plus text-sm"></i>
          Aprovisionar Usuario
        </button>
      </div>
    </div>

    <!-- Filtros -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center bg-[#1d1f27] p-4 rounded-xl border border-[#434655] mb-6 shadow-lg">
      <!-- ... (igual que antes) ... -->
      <div class="lg:col-span-4 relative">
        <i class="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-[#8d90a0]"></i>
        <input 
          v-model="filters.search"
          class="w-full bg-[#11131b] border border-[#434655] rounded-lg py-2 pl-10 pr-4 text-sm text-[#e1e2ed] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all" 
          placeholder="Buscar por nombre, correo o rol..." 
          type="text"
        />
      </div>
      <div class="lg:col-span-3">
        <select v-model="filters.department" class="w-full bg-[#11131b] border border-[#434655] rounded-lg py-2 px-4 text-sm text-[#e1e2ed] focus:border-blue-500 outline-none cursor-pointer">
          <option value="">Todos los Departamentos</option>
          <option value="Ingeniería">Ingeniería</option>
          <option value="Finanzas">Finanzas</option>
          <option value="RRHH">Recursos Humanos</option>
          <option value="Marketing">Marketing</option>
          <option value="Operaciones">Operaciones</option>
        </select>
      </div>
      <div class="lg:col-span-5 flex items-center gap-4">
        <span class="text-[#8d90a0] text-[10px] font-bold uppercase tracking-widest shrink-0">Nivel de Amenaza:</span>
        <div class="flex p-1 bg-[#11131b] rounded-lg border border-[#434655] flex-1">
          <button @click="filters.threat = 'high'" :class="['flex-1 py-1.5 text-[10px] font-bold uppercase rounded transition-all', filters.threat === 'high' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'text-[#8d90a0] hover:text-[#e1e2ed]']">Alto</button>
          <button @click="filters.threat = 'medium'" :class="['flex-1 py-1.5 text-[10px] font-bold uppercase rounded transition-all', filters.threat === 'medium' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'text-[#8d90a0] hover:text-[#e1e2ed]']">Medio</button>
          <button @click="filters.threat = 'low'" :class="['flex-1 py-1.5 text-[10px] font-bold uppercase rounded transition-all', filters.threat === 'low' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-[#8d90a0] hover:text-[#e1e2ed]']">Bajo</button>
        </div>
      </div>
    </div>

    <!-- Tabla -->
    <div class="bg-[#1d1f27] border border-[#434655] rounded-xl overflow-hidden shadow-xl mb-8">
      <!-- ... (tabla igual que antes) ... -->
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-[#32343d]/50 border-b border-[#434655]">
              <th class="px-6 py-4 text-[10px] font-bold uppercase text-[#8d90a0] tracking-widest">Empleado e Identidad</th>
              <th class="px-6 py-4 text-[10px] font-bold uppercase text-[#8d90a0] tracking-widest">Departamento / Rol</th>
              <th class="px-6 py-4 text-[10px] font-bold uppercase text-[#8d90a0] tracking-widest">Score de Riesgo</th>
              <th class="px-6 py-4 text-[10px] font-bold uppercase text-[#8d90a0] tracking-widest">Filtraciones OSINT</th>
              <th class="px-6 py-4 text-[10px] font-bold uppercase text-[#8d90a0] tracking-widest text-right">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[#434655]/50">
            <tr v-for="emp in filteredEmployees" :key="emp.id" class="hover:bg-[#32343d]/40 transition-colors group cursor-pointer">
              <td class="px-6 py-4">
                <div class="flex items-center gap-4">
                  <div class="w-10 h-10 rounded-full border border-[#434655] bg-[#11131b] overflow-hidden shrink-0">
                    <img class="w-full h-full object-cover" :src="emp.avatar" :alt="emp.name"/>
                  </div>
                  <div class="flex flex-col">
                    <span class="font-semibold text-sm text-[#e1e2ed] group-hover:text-blue-400 transition-colors">{{ emp.name }}</span>
                    <span class="text-xs text-[#8d90a0]">{{ emp.email }}</span>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="flex flex-col">
                  <span class="text-sm text-[#e1e2ed]">{{ emp.department }}</span>
                  <span class="text-xs text-[#8d90a0]">{{ emp.role }}</span>
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="relative w-10 h-10 flex items-center justify-center">
                    <svg class="w-full h-full -rotate-90">
                      <circle class="text-[#434655]/40" cx="20" cy="20" fill="transparent" r="16" stroke="currentColor" stroke-width="3"></circle>
                      <circle :class="emp.color" cx="20" cy="20" fill="transparent" r="16" stroke="currentColor" stroke-dasharray="100.5" :stroke-dashoffset="getDashOffset(emp.score)" stroke-width="3" stroke-linecap="round"></circle>
                    </svg>
                    <span class="absolute text-[10px] font-bold text-[#e1e2ed]">{{ emp.score }}</span>
                  </div>
                  <span :class="['text-[9px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider', emp.badgeClass]">
                    {{ emp.status }}
                  </span>
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="flex flex-wrap gap-2">
                  <span v-for="(leak, idx) in emp.leaks" :key="idx" :class="['px-2 py-1 border rounded text-[10px] font-mono transition-all', leak.style]">
                    <i v-if="leak.icon" :class="[leak.icon, 'mr-1']"></i>
                    {{ leak.text }}
                  </span>
                </div>
              </td>
              <td class="px-6 py-4 text-right">
                <button class="w-8 h-8 rounded border border-transparent hover:border-[#434655] hover:bg-[#32343d] text-[#8d90a0] hover:text-blue-400 transition-all flex items-center justify-center ml-auto">
                  <i class="fa-solid fa-eye"></i>
                </button>
              </td>
            </tr>
            <tr v-if="filteredEmployees.length === 0">
              <td colspan="5" class="px-6 py-8 text-center text-[#8d90a0] text-sm">
                <i class="fa-solid fa-users-slash text-3xl block mb-2 text-[#434655]"></i>
                No se encontraron empleados. Agrega uno nuevo o carga un archivo CSV.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Paginación (simulada) -->
      <div class="px-6 py-4 bg-[#11131b] border-t border-[#434655] flex items-center justify-between">
        <span class="text-xs text-[#8d90a0]">Mostrando {{ filteredEmployees.length }} de {{ employees.length }} empleados</span>
        <div class="flex items-center gap-1">
          <button class="w-8 h-8 flex items-center justify-center text-[#8d90a0] hover:text-[#e1e2ed] transition-all disabled:opacity-30" disabled>
            <i class="fa-solid fa-chevron-left text-xs"></i>
          </button>
          <div class="flex items-center gap-1">
            <button class="w-8 h-8 flex items-center justify-center rounded bg-blue-600 text-white text-xs font-bold">1</button>
            <button class="w-8 h-8 flex items-center justify-center rounded hover:bg-[#32343d] text-[#8d90a0] text-xs font-bold">2</button>
            <button class="w-8 h-8 flex items-center justify-center rounded hover:bg-[#32343d] text-[#8d90a0] text-xs font-bold">3</button>
            <span class="text-[#8d90a0] px-1 text-xs">...</span>
            <button class="w-8 h-8 flex items-center justify-center rounded hover:bg-[#32343d] text-[#8d90a0] text-xs font-bold">125</button>
          </div>
          <button class="w-8 h-8 flex items-center justify-center text-[#8d90a0] hover:text-[#e1e2ed] transition-all">
            <i class="fa-solid fa-chevron-right text-xs"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Tarjetas de Resumen -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="p-6 bg-[#1d1f27] border border-[#434655] rounded-xl flex items-center gap-6 shadow-lg">
        <div class="w-14 h-14 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center border border-red-500/20">
          <i class="fa-solid fa-circle-exclamation text-2xl"></i>
        </div>
        <div>
          <p class="text-[#8d90a0] text-[10px] font-bold uppercase tracking-widest">Alertas de Alto Riesgo</p>
          <h3 class="text-3xl font-bold text-[#e1e2ed] mt-1">{{ highRiskCount }}</h3>
        </div>
      </div>
      <div class="p-6 bg-[#1d1f27] border border-[#434655] rounded-xl flex items-center gap-6 shadow-lg">
        <div class="w-14 h-14 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center border border-blue-500/20">
          <i class="fa-solid fa-shield-halved text-2xl"></i>
        </div>
        <div>
          <p class="text-[#8d90a0] text-[10px] font-bold uppercase tracking-widest">Cumplimiento General</p>
          <h3 class="text-3xl font-bold text-[#e1e2ed] mt-1">{{ avgRiskScore }}%</h3>
        </div>
      </div>
      <div class="p-6 bg-[#1d1f27] border border-[#434655] rounded-xl flex items-center gap-6 shadow-lg">
        <div class="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20">
          <i class="fa-solid fa-file-shield text-2xl"></i>
        </div>
        <div>
          <p class="text-[#8d90a0] text-[10px] font-bold uppercase tracking-widest">Total Empleados</p>
          <h3 class="text-3xl font-bold text-[#e1e2ed] mt-1">{{ employees.length }}</h3>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <AddEmployeeModal 
      v-if="showModal"
      @close="showModal = false"
      @import="handleImportUsers"
    />

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import AddEmployeeModal from '../components/modals/AddEmployeeModal.vue' // Ajusta la ruta según tu estructura
import { GRAPHQL_URL } from '@/config/api'

// --- Tipos ---
interface UsuarioInput {
  nombre: string
  email: string
  departamento: string
  cargo: string
}

interface EmployeeDisplay {
  id: string
  name: string
  email: string
  department: string
  role: string
  score: number
  status: string
  color: string
  badgeClass: string
  avatar: string
  leaks: Array<{ text: string; icon?: string; style: string }>
}

// --- Estado ---
const showModal = ref(false)
const filters = ref({ search: '', department: '', threat: '' })
const employees = ref<EmployeeDisplay[]>([])

const admin = computed(() => {
  try {
    return JSON.parse(localStorage.getItem('ciso_user') || '{}')
  } catch {
    return { id_organizacion: '' }
  }
})

// --- Filtros y métricas ---
const filteredEmployees = computed(() => {
  let result = employees.value
  if (filters.value.search) {
    const s = filters.value.search.toLowerCase()
    result = result.filter(emp =>
      emp.name.toLowerCase().includes(s) ||
      emp.email.toLowerCase().includes(s) ||
      emp.department.toLowerCase().includes(s) ||
      emp.role.toLowerCase().includes(s)
    )
  }
  if (filters.value.department) {
    result = result.filter(emp => emp.department === filters.value.department)
  }
  if (filters.value.threat) {
    if (filters.value.threat === 'high') result = result.filter(emp => emp.score < 40)
    else if (filters.value.threat === 'medium') result = result.filter(emp => emp.score >= 40 && emp.score < 70)
    else if (filters.value.threat === 'low') result = result.filter(emp => emp.score >= 70)
  }
  return result
})

const highRiskCount = computed(() => employees.value.filter(emp => emp.score < 40).length)
const avgRiskScore = computed(() => {
  if (employees.value.length === 0) return 0
  const total = employees.value.reduce((sum, emp) => sum + emp.score, 0)
  return Math.round(total / employees.value.length)
})

const getDashOffset = (score: number) => {
  const circumference = 100.5
  return circumference - (score / 100) * circumference
}

// --- Obtener empleados desde GraphQL ---
const fetchEmployees = async () => {
  try {
    const response = await fetch(GRAPHQL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('ciso_token')}`,
      },
      body: JSON.stringify({
        query: `
          query GetUsuarios($organizacionId: ID!) {
            usuarios(organizacionId: $organizacionId) {
              id
              nombre
              email
              departamento
              cargo
              risk_score
              estado
            }
          }
        `,
        variables: { organizacionId: admin.value.id_organizacion },
      }),
    })
    const result = await response.json()
    if (result.data) {
      employees.value = result.data.usuarios.map((u: any) => {
        const score = u.risk_score
        const isActive = u.estado === 'Activo'
        let color: string, badgeClass: string, status: string
        if (score >= 70) {
          color = 'text-emerald-500'
          badgeClass = 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20'
          status = isActive ? 'ESTABLE' : 'INACTIVO'
        } else if (score >= 40) {
          color = 'text-amber-500'
          badgeClass = 'text-amber-500 bg-amber-500/10 border-amber-500/20'
          status = isActive ? 'PRECAUCIÓN' : 'INACTIVO'
        } else {
          color = 'text-red-500'
          badgeClass = 'text-red-500 bg-red-500/10 border-red-500/20'
          status = isActive ? 'CRÍTICO' : 'INACTIVO'
        }
        const leaks = score < 40 ? [{ text: '⚠️ Filtraciones detectadas', icon: 'fa-solid fa-triangle-exclamation', style: 'bg-red-500/20 border-red-500/50 text-red-400 font-bold' }] :
                      score < 70 ? [{ text: 'Posibles hallazgos', icon: 'fa-solid fa-circle-exclamation', style: 'bg-amber-500/10 border-amber-500/30 text-amber-400' }] :
                      [{ text: 'Sin hallazgos críticos', style: 'bg-[#32343d] border-[#434655] text-[#8d90a0]' }]
        const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(u.nombre || 'U')}&background=random&size=40&color=fff&font-size=0.5`
        return {
          id: u.id,
          name: u.nombre || 'Sin nombre',
          email: u.email || 'sin-email@ejemplo.com',
          department: u.departamento || 'Sin asignar',
          role: u.cargo || 'Sin cargo',
          score,
          status,
          color,
          badgeClass,
          avatar,
          leaks,
        }
      })
    }
  } catch (error) {
    console.error('Error fetching employees:', error)
  }
}

// --- Crear usuario(s) vía GraphQL ---
const createUser = async (user: UsuarioInput) => {
  const mutation = `
    mutation CrearUsuario($input: CrearUsuarioInput!, $organizacionId: ID!) {
      crearUsuario(input: $input, organizacionId: $organizacionId) {
        id
        nombre
        email
      }
    }
  `
  const variables = {
    input: {
      nombre: user.nombre,
      email: user.email,
      departamento: user.departamento,
      cargo: user.cargo,
    },
    organizacionId: admin.value.id_organizacion,
  }

  const response = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('ciso_token')}`,
    },
    body: JSON.stringify({ query: mutation, variables }),
  })
  const result = await response.json()
  if (result.errors) {
    throw new Error(result.errors[0].message)
  }
  return result.data.crearUsuario
}

// --- Manejar importación desde el modal ---
const handleImportUsers = async (data: UsuarioInput | UsuarioInput[]) => {
  try {
    const usuarios = Array.isArray(data) ? data : [data]
    for (const user of usuarios) {
      await createUser(user)
    }
    // Refrescar lista
    await fetchEmployees()
    // Cerrar modal
    showModal.value = false
    alert(`✅ ${usuarios.length} usuario(s) importado(s) correctamente.`)
  } catch (error: any) {
    alert('❌ Error al importar: ' + error.message)
  }
}

// --- Carga inicial ---
onMounted(() => {
  fetchEmployees()
})
</script>

<style scoped>
/* mismos estilos que antes */
</style>
