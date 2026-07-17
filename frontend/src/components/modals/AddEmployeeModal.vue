<template>
  <div 
    class="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#11131b]/80 backdrop-blur-sm"
    @click.self="$emit('close')"
  >
    <div class="bg-[#282a32] border border-[#434655] w-full max-w-2xl rounded-xl shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-300">
      
      <div class="px-10 py-6 border-b border-[#434655] flex justify-between items-center">
        <div>
          <h2 class="text-2xl font-bold text-[#e1e2ed] tracking-tight">Añadir Empleados</h2>
          <p class="text-[#c3c6d7] text-sm mt-1">Registra a tu equipo para iniciar el monitoreo de seguridad.</p>
        </div>
        <button 
          @click="$emit('close')"
          class="w-8 h-8 flex items-center justify-center hover:bg-[#32343d] rounded-lg transition-colors group"
        >
          <i class="fas fa-xmark text-[#c3c6d7] group-hover:text-[#e1e2ed] text-lg"></i>
        </button>
      </div>

      <div class="overflow-y-auto px-10 py-10 space-y-10 custom-scrollbar">
        
        <!-- Sección de carga masiva -->
        <section>
          <div class="group relative flex flex-col items-center justify-center border-2 border-dashed border-[#434655] rounded-xl p-16 bg-[#191b23] hover:border-[#b4c5ff]/50 hover:bg-[#2563eb]/5 transition-all cursor-pointer">
            <div class="bg-[#3f465c] w-14 h-14 flex items-center justify-center rounded-full mb-4 group-hover:scale-110 transition-transform">
              <i class="fas fa-cloud-arrow-up text-[#b4c5ff] text-2xl"></i>
            </div>
            <p class="text-[#e1e2ed] font-semibold mb-1">Arrastra y suelta tu archivo CSV / Excel aquí</p>
            <p class="text-[#c3c6d7] text-sm">Límite 10MB por archivo • Máximo 5,000 filas</p>
            <input 
              type="file" 
              accept=".csv, .xlsx"
              class="absolute inset-0 opacity-0 cursor-pointer" 
              @change="handleFileUpload"
            />
          </div>
          <div v-if="uploadedCount > 0" class="mt-2 text-sm text-emerald-400">
            <i class="fas fa-check-circle"></i> {{ uploadedCount }} usuarios cargados desde archivo.
          </div>
          <div class="mt-4 flex justify-center">
            <a href="#" class="flex items-center gap-2 text-[#b4c5ff] hover:underline text-sm font-semibold">
              <i class="fas fa-download text-lg"></i>
              Descargar Plantilla CSV
            </a>
          </div>
        </section>

        <div class="relative flex items-center justify-center">
          <div class="absolute w-full border-t border-[#434655]"></div>
          <span class="relative bg-[#282a32] px-4 text-xs tracking-widest text-[#8d90a0] font-bold uppercase">O</span>
        </div>

        <!-- Formulario manual -->
        <section>
          <h3 class="text-xs font-bold tracking-widest text-[#e1e2ed] mb-6 uppercase">INGRESO MANUAL</h3>
          
          <form @submit.prevent="addManualUser" class="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div class="space-y-1.5 group security-glow">
              <label class="text-xs font-bold text-[#c3c6d7] uppercase tracking-widest px-1">Nombre Completo</label>
              <div class="flex items-center gap-4 bg-[#191b23] border border-[#434655] p-3 rounded-lg group-focus-within:border-[#b4c5ff] transition-all">
                <i class="fas fa-user text-[#8d90a0] text-sm"></i>
                <input 
                  v-model="manualForm.nombre"
                  type="text" 
                  placeholder="ej. Juan Pérez" 
                  class="bg-transparent border-none focus:ring-0 text-[#e1e2ed] w-full p-0 placeholder:text-[#8d90a0] outline-none"
                  required
                />
              </div>
            </div>

            <div class="space-y-1.5 group security-glow">
              <label class="text-xs font-bold text-[#c3c6d7] uppercase tracking-widest px-1">Correo Electrónico</label>
              <div class="flex items-center gap-4 bg-[#191b23] border border-[#434655] p-3 rounded-lg group-focus-within:border-[#b4c5ff] transition-all">
                <i class="fas fa-envelope text-[#8d90a0] text-sm"></i>
                <input 
                  v-model="manualForm.email"
                  type="email" 
                  placeholder="juan@empresa.com" 
                  class="bg-transparent border-none focus:ring-0 text-[#e1e2ed] w-full p-0 placeholder:text-[#8d90a0] outline-none"
                  required
                />
              </div>
            </div>

            <div class="md:col-span-2 space-y-1.5 group security-glow">
              <label class="text-xs font-bold text-[#c3c6d7] uppercase tracking-widest px-1">Departamento</label>
              <div class="relative flex items-center gap-4 bg-[#191b23] border border-[#434655] p-3 rounded-lg group-focus-within:border-[#b4c5ff] transition-all">
                <i class="fas fa-network-wired text-[#8d90a0] text-sm"></i>
                <select 
                  v-model="manualForm.departamento"
                  class="bg-transparent border-none focus:ring-0 text-[#e1e2ed] w-full p-0 appearance-none cursor-pointer outline-none"
                  required
                >
                  <option value="" disabled class="bg-[#282a32]">Seleccionar departamento...</option>
                  <option value="Ingeniería" class="bg-[#282a32]">Ingeniería / TI</option>
                  <option value="Finanzas" class="bg-[#282a32]">Finanzas</option>
                  <option value="RRHH" class="bg-[#282a32]">Recursos Humanos</option>
                  <option value="Marketing" class="bg-[#282a32]">Marketing</option>
                  <option value="Operaciones" class="bg-[#282a32]">Operaciones</option>
                </select>
                <i class="fas fa-chevron-down absolute right-4 pointer-events-none text-[#8d90a0]"></i>
              </div>
            </div>

            <div class="md:col-span-2 space-y-1.5 group security-glow">
              <label class="text-xs font-bold text-[#c3c6d7] uppercase tracking-widest px-1">Cargo / Puesto</label>
              <div class="flex items-center gap-4 bg-[#191b23] border border-[#434655] p-3 rounded-lg group-focus-within:border-[#b4c5ff] transition-all">
                <i class="fas fa-id-badge text-[#8d90a0] text-sm"></i>
                <input 
                  v-model="manualForm.cargo"
                  type="text" 
                  placeholder="ej. Analista Senior de Seguridad" 
                  class="bg-transparent border-none focus:ring-0 text-[#e1e2ed] w-full p-0 placeholder:text-[#8d90a0] outline-none"
                  required
                />
              </div>
            </div>

          </form>

          <div class="flex items-center gap-4 mt-4">
            <button 
              @click="addManualUser"
              type="button"
              class="flex items-center gap-2 text-[#dbe1ff] hover:text-[#b4c5ff] text-sm font-semibold transition-colors"
            >
              <i class="fas fa-plus text-lg"></i>
              Añadir Usuario a la Lista
            </button>
            <span v-if="pendingUsers.length > 0" class="text-xs text-[#8d90a0]">
              ({{ pendingUsers.length }} usuario(s) pendiente(s))
            </span>
          </div>

          <!-- Lista de usuarios agregados manualmente -->
          <div v-if="pendingUsers.length > 0" class="mt-4 space-y-2 max-h-40 overflow-y-auto">
            <div v-for="(user, idx) in pendingUsers" :key="idx" class="flex items-center justify-between bg-[#191b23] p-3 rounded-lg border border-[#434655] text-sm">
              <div>
                <span class="text-[#e1e2ed] font-medium">{{ user.nombre }}</span>
                <span class="text-[#8d90a0] ml-2">{{ user.email }}</span>
                <span class="text-[#8d90a0] ml-2 text-xs">{{ user.departamento }} • {{ user.cargo }}</span>
              </div>
              <button @click="removePendingUser(idx)" class="text-red-400 hover:text-red-300 transition-colors">
                <i class="fas fa-trash-can"></i>
              </button>
            </div>
          </div>
        </section>
      </div>

      <div class="px-10 py-6 border-t border-[#434655] flex justify-between items-center gap-4 bg-[#32343d]/30">
        <div class="text-xs text-[#8d90a0]">
          <span v-if="pendingUsers.length > 0">{{ pendingUsers.length }} usuario(s) listo(s) para importar</span>
          <span v-else>No hay usuarios para importar</span>
        </div>
        <div class="flex items-center gap-4">
          <button 
            @click="$emit('close')"
            class="px-8 py-2.5 border border-[#8d90a0] hover:bg-[#32343d] text-[#e1e2ed] text-xs font-bold tracking-widest uppercase rounded-xl transition-all active:scale-95"
          >
            CANCELAR
          </button>
          <button 
            @click="handleImport"
            :disabled="pendingUsers.length === 0"
            class="px-8 py-2.5 bg-[#b4c5ff] text-[#002a78] text-xs font-bold tracking-widest uppercase rounded-xl hover:brightness-110 shadow-lg shadow-[#b4c5ff]/10 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            IMPORTAR {{ pendingUsers.length > 0 ? pendingUsers.length : '' }} USUARIO(S)
          </button>
        </div>
      </div>
      
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'

// --- Tipos ---
interface UsuarioInput {
  nombre: string
  email: string
  departamento: string
  cargo: string
}

// --- Emits ---
const emit = defineEmits<{
  (e: 'close'): void
  (e: 'import', usuarios: UsuarioInput[]): void
}>()

// --- Estado ---
const manualForm = reactive<UsuarioInput>({
  nombre: '',
  email: '',
  departamento: '',
  cargo: ''
})

const pendingUsers = ref<UsuarioInput[]>([])
const uploadedCount = ref(0)

// --- Agregar usuario manual a la lista ---
const addManualUser = () => {
  // Validar campos
  if (!manualForm.nombre || !manualForm.email || !manualForm.departamento || !manualForm.cargo) {
    alert('Todos los campos son obligatorios para agregar un usuario.')
    return
  }
  // Agregar a la lista
  pendingUsers.value.push({ ...manualForm })
  // Limpiar formulario
  Object.assign(manualForm, { nombre: '', email: '', departamento: '', cargo: '' })
}

// --- Eliminar usuario de la lista pendiente ---
const removePendingUser = (index: number) => {
  pendingUsers.value.splice(index, 1)
}

// --- Manejo de archivo CSV ---
const handleFileUpload = (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    const text = e.target?.result as string
    const lines = text.split('\n').filter(line => line.trim() !== '')
    if (lines.length < 2) {
      alert('El archivo no contiene datos válidos.')
      return
    }
    // Asumimos primera línea como encabezados
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
    const usuarios: UsuarioInput[] = []

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim())
      if (values.length < 4) continue
      const obj: any = {}
      headers.forEach((h, idx) => {
        obj[h] = values[idx] || ''
      })
      // Mapear a campos esperados
      usuarios.push({
        nombre: obj['nombre'] || obj['name'] || '',
        email: obj['email'] || obj['correo'] || '',
        departamento: obj['departamento'] || obj['department'] || '',
        cargo: obj['cargo'] || obj['role'] || '',
      })
    }
    if (usuarios.length > 0) {
      // Añadir a la lista pendiente
      pendingUsers.value = [...pendingUsers.value, ...usuarios]
      uploadedCount.value = usuarios.length
      // Mostrar mensaje
      alert(`Se cargaron ${usuarios.length} usuarios desde el archivo.`)
    } else {
      alert('No se encontraron usuarios válidos en el archivo.')
    }
  }
  reader.readAsText(file)
}

// --- Botón importar ---
const handleImport = () => {
  if (pendingUsers.value.length === 0) {
    alert('No hay usuarios para importar.')
    return
  }
  // Emitir todos los usuarios pendientes
  emit('import', pendingUsers.value)
  // Limpiar lista
  pendingUsers.value = []
  uploadedCount.value = 0
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: #1d1f27;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #434655;
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #8d90a0;
}
.security-glow:focus-within {
  box-shadow: 0 0 4px 0 rgba(180, 197, 255, 0.2);
}
</style>