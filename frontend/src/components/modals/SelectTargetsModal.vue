<!-- frontend/src/components/SelectTargetsModal.vue -->
<template>
  <div 
    class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#11131b]/80 backdrop-blur-sm"
    @click.self="$emit('close')"
  >
    <div class="bg-[#1d1f27] border border-[#434655] w-full max-w-4xl rounded-xl shadow-2xl flex flex-col max-h-[85vh] animate-in fade-in zoom-in duration-300">
      
      <!-- Cabecera -->
      <div class="px-6 py-4 border-b border-[#434655] flex justify-between items-center shrink-0">
        <div>
          <h2 class="text-xl font-bold text-[#e1e2ed]">Seleccionar Destinatarios</h2>
          <p class="text-sm text-[#8d90a0]">{{ selectedIds.length }} empleados seleccionados</p>
        </div>
        <button @click="$emit('close')" class="w-8 h-8 flex items-center justify-center hover:bg-[#32343d] rounded-lg">
          <i class="fa-solid fa-xmark text-[#c3c6d7] text-xl"></i>
        </button>
      </div>

      <div v-if="requiresPhone" class="mx-6 mt-4 flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3">
        <i class="fa-solid fa-mobile-screen mt-0.5 text-amber-400"></i>
        <p class="text-xs leading-5 text-amber-100">
          Esta campaña es de Smishing. Solo puedes seleccionar empleados con teléfono registrado en formato internacional.
        </p>
      </div>

      <!-- Barra de búsqueda -->
      <div class="px-6 py-3 border-b border-[#434655] flex items-center gap-4 shrink-0">
        <div class="relative flex-1">
          <i class="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-[#8d90a0] text-sm"></i>
          <input 
            v-model="searchTerm"
            type="text" 
            placeholder="Buscar por nombre o correo..." 
            class="w-full bg-[#11131b] border border-[#434655] rounded-lg py-2 pl-9 pr-4 text-sm text-[#e1e2ed] focus:border-blue-500 outline-none transition-all"
          />
        </div>
        <button 
          @click="toggleAll"
          class="text-xs font-bold uppercase tracking-widest text-blue-400 hover:text-blue-300 transition-colors"
        >
          {{ allSelected ? 'Deseleccionar Todos' : 'Seleccionar Todos' }}
        </button>
      </div>

      <!-- Lista de empleados -->
      <div class="flex-1 overflow-y-auto custom-scrollbar">
        <table class="w-full text-left">
          <thead class="sticky top-0 bg-[#1d1f27] border-b border-[#434655]">
            <tr>
              <th class="px-6 py-3 w-12">
                <input 
                  type="checkbox" 
                  :checked="allSelected" 
                  @change="toggleAll"
                  class="w-4 h-4 bg-[#11131b] border-[#434655] rounded focus:ring-blue-500 focus:ring-1"
                />
              </th>
              <th class="px-6 py-3 text-[10px] font-bold uppercase text-[#8d90a0] tracking-widest">Empleado</th>
              <th class="px-6 py-3 text-[10px] font-bold uppercase text-[#8d90a0] tracking-widest">Teléfono</th>
              <th class="px-6 py-3 text-[10px] font-bold uppercase text-[#8d90a0] tracking-widest">Departamento</th>
              <th class="px-6 py-3 text-[10px] font-bold uppercase text-[#8d90a0] tracking-widest">Cargo</th>
              <th class="px-6 py-3 text-[10px] font-bold uppercase text-[#8d90a0] tracking-widest">Score</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[#434655]/50">
            <tr v-for="user in filteredUsers" :key="user.id" class="hover:bg-[#32343d]/30 transition-colors">
              <td class="px-6 py-3">
                <input 
                  type="checkbox" 
                  :value="user.id"
                  v-model="selectedIds"
                  :disabled="requiresPhone && !user.telefono"
                  class="w-4 h-4 bg-[#11131b] border-[#434655] rounded focus:ring-blue-500 focus:ring-1"
                />
              </td>
              <td class="px-6 py-3">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-full bg-[#32343d] border border-[#434655] overflow-hidden">
                    <img :src="`https://ui-avatars.com/api/?name=${encodeURIComponent(user.nombre)}&background=random&size=32&color=fff&font-size=0.4`" :alt="user.nombre" />
                  </div>
                  <div>
                    <p class="text-sm font-semibold text-[#e1e2ed]">{{ user.nombre }}</p>
                    <p class="text-xs text-[#8d90a0]">{{ user.email }}</p>
                  </div>
                </div>
              </td>
              <td class="px-6 py-3 text-sm">
                <span v-if="user.telefono" class="text-[#c3c6d7]">{{ user.telefono }}</span>
                <span v-else class="rounded border border-amber-500/20 bg-amber-500/10 px-2 py-1 text-[10px] font-bold text-amber-400">Sin teléfono</span>
              </td>
              <td class="px-6 py-3 text-sm text-[#c3c6d7]">{{ user.departamento || 'Sin asignar' }}</td>
              <td class="px-6 py-3 text-sm text-[#c3c6d7]">{{ user.cargo || 'Sin cargo' }}</td>
              <td class="px-6 py-3">
                <span :class="['px-2 py-1 rounded text-xs font-bold', getScoreClass(user.risk_score)]">
                  {{ user.risk_score }}
                </span>
              </td>
            </tr>
            <tr v-if="filteredUsers.length === 0">
              <td colspan="6" class="px-6 py-8 text-center text-[#8d90a0]">
                <i class="fa-solid fa-users-slash text-2xl block mb-2"></i>
                No se encontraron empleados.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pie -->
      <div class="px-6 py-4 border-t border-[#434655] flex justify-end items-center gap-3 bg-[#11131b] rounded-b-xl shrink-0">
        <span class="text-xs text-[#8d90a0] mr-auto">{{ selectedIds.length }} seleccionados</span>
        <button 
          @click="$emit('close')"
          class="px-6 py-2 border border-[#434655] text-[#c3c6d7] rounded-lg hover:bg-[#32343d] transition-all text-sm font-bold uppercase tracking-widest"
        >
          Cancelar
        </button>
        <button 
          @click="applySelection"
          class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-all text-sm font-bold uppercase tracking-widest shadow-lg shadow-blue-600/20"
        >
          Aplicar ({{ selectedIds.length }})
        </button>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { GRAPHQL_URL } from '@/config/api'

// --- Tipos ---
interface Usuario {
  id: string
  nombre: string
  email: string
  telefono?: string | null
  departamento: string | null
  cargo: string | null
  risk_score: number
  estado: string
}

// --- Props y Emits ---
const props = defineProps<{
  organizacionId: string
  preselectedIds?: string[]
  requiresPhone?: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'apply', selectedIds: string[], selectedUsers: Usuario[]): void
}>()

// --- Estado ---
const searchTerm = ref('')
const users = ref<Usuario[]>([])
const selectedIds = ref<string[]>(props.preselectedIds || [])

// --- Computed ---
const filteredUsers = computed(() => {
  if (!searchTerm.value) return users.value
  const s = searchTerm.value.toLowerCase()
  return users.value.filter(u =>
    u.nombre.toLowerCase().includes(s) ||
    u.email.toLowerCase().includes(s) ||
    (u.telefono && u.telefono.toLowerCase().includes(s)) ||
    (u.departamento && u.departamento.toLowerCase().includes(s))
  )
})

const selectableUsers = computed(() => props.requiresPhone
  ? filteredUsers.value.filter(user => Boolean(user.telefono))
  : filteredUsers.value
)

const allSelected = computed(() => {
  return selectableUsers.value.length > 0 &&
         selectableUsers.value.every(u => selectedIds.value.includes(u.id))
})

const selectedUsers = computed(() => {
  return users.value.filter(user => selectedIds.value.includes(user.id))
})

// --- Métodos ---
const getScoreClass = (score: number) => {
  if (score >= 70) return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20'
  if (score >= 40) return 'bg-amber-500/20 text-amber-400 border border-amber-500/20'
  return 'bg-red-500/20 text-red-400 border border-red-500/20'
}

const toggleAll = () => {
  if (allSelected.value) {
    const filteredIds = selectableUsers.value.map(u => u.id)
    selectedIds.value = selectedIds.value.filter(id => !filteredIds.includes(id))
  } else {
    const filteredIds = selectableUsers.value.map(u => u.id)
    const newIds = filteredIds.filter(id => !selectedIds.value.includes(id))
    selectedIds.value = [...selectedIds.value, ...newIds]
  }
}

const applySelection = () => {
  const validIds = props.requiresPhone
    ? selectedIds.value.filter(id => users.value.some(user => user.id === id && user.telefono))
    : selectedIds.value
  const validUsers = users.value.filter(user => validIds.includes(user.id))
  emit('apply', validIds, validUsers)
  emit('close')
}

// --- Obtener empleados ---
const fetchUsers = async () => {
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
              telefono
              departamento
              cargo
              risk_score
              estado
            }
          }
        `,
        variables: { organizacionId: props.organizacionId },
      }),
    })
    const result = await response.json()
    if (result.data) {
      users.value = result.data.usuarios
      
    }
  } catch (error) {
    console.error('Error fetching users:', error)
  }
}

onMounted(() => {
  fetchUsers()
})
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: #11131b;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #434655;
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #5a5e73;
}
</style>
