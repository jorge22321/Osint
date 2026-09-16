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
            <p class="text-[#e1e2ed] font-semibold mb-1">Arrastra y suelta tu archivo CSV aquí</p>
            <p class="text-[#c3c6d7] text-sm">Límite 10MB • Columnas: nombre, email, telefono, departamento, cargo</p>
            <input 
              type="file" 
              accept=".csv,text/csv"
              class="absolute inset-0 opacity-0 cursor-pointer" 
              @change="handleFileUpload"
            />
          </div>
          <div v-if="uploadedCount > 0" class="mt-2 text-sm text-emerald-400">
            <i class="fas fa-check-circle"></i> {{ uploadedCount }} usuarios cargados desde archivo.
          </div>
          <div class="mt-4 flex justify-center">
            <button type="button" @click="downloadCsvTemplate" class="flex items-center gap-2 text-[#b4c5ff] hover:underline text-sm font-semibold">
              <i class="fas fa-download text-lg"></i>
              Descargar Plantilla CSV
            </button>
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
              <label class="text-xs font-bold text-[#c3c6d7] uppercase tracking-widest px-1">Teléfono para Smishing <span class="normal-case text-[#8d90a0]">(opcional)</span></label>
              <div class="flex items-center gap-4 bg-[#191b23] border border-[#434655] p-3 rounded-lg group-focus-within:border-[#b4c5ff] transition-all">
                <i class="fas fa-mobile-screen text-[#8d90a0] text-sm"></i>
                <input
                  v-model="manualForm.telefono"
                  type="tel"
                  placeholder="+51 999 999 999"
                  class="bg-transparent border-none focus:ring-0 text-[#e1e2ed] w-full p-0 placeholder:text-[#8d90a0] outline-none"
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
                <span v-if="user.telefono" class="text-[#8d90a0] ml-2">{{ user.telefono }}</span>
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
import { showNotice } from '@/composables/useNotification'
import { isValidInternationalPhone, normalizePhone } from '@/utils/phone'

// --- Tipos ---
interface UsuarioInput {
  nombre: string
  email: string
  telefono?: string
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
  telefono: '',
  departamento: '',
  cargo: ''
})

const pendingUsers = ref<UsuarioInput[]>([])
const uploadedCount = ref(0)

// --- Agregar usuario manual a la lista ---
const addManualUser = () => {
  // Validar campos
  if (!manualForm.nombre || !manualForm.email || !manualForm.departamento || !manualForm.cargo) {
    showNotice({ type: 'warning', message: 'Todos los campos son obligatorios para agregar un usuario.' })
    return
  }
  if (!isValidInternationalPhone(manualForm.telefono)) {
    showNotice({ type: 'warning', message: 'El teléfono debe usar formato internacional, por ejemplo +51999999999.' })
    return
  }
  const normalizedEmail = manualForm.email.trim().toLowerCase()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    showNotice({ type: 'warning', message: 'Ingresa un correo electrónico válido.' })
    return
  }
  if (pendingUsers.value.some(user => user.email.toLowerCase() === normalizedEmail)) {
    showNotice({ type: 'warning', message: 'Ese correo ya está en la lista de importación.' })
    return
  }
  // Agregar a la lista
  pendingUsers.value.push({ ...manualForm, email: normalizedEmail, telefono: normalizePhone(manualForm.telefono) })
  // Limpiar formulario
  Object.assign(manualForm, { nombre: '', email: '', telefono: '', departamento: '', cargo: '' })
}

// --- Eliminar usuario de la lista pendiente ---
const removePendingUser = (index: number) => {
  pendingUsers.value.splice(index, 1)
}

const parseCsvLine = (line: string, separator: string) => {
  const values: string[] = []
  let current = ''
  let quoted = false
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (char === '"' && quoted && line[i + 1] === '"') {
      current += '"'
      i++
    } else if (char === '"') {
      quoted = !quoted
    } else if (char === separator && !quoted) {
      values.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  values.push(current.trim())
  return values
}

const downloadCsvTemplate = () => {
  const content = '\uFEFFnombre,email,telefono,departamento,cargo\nJuan Pérez,juan@empresa.com,+51987654321,Finanzas,Analista'
  const url = URL.createObjectURL(new Blob([content], { type: 'text/csv;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url
  link.download = 'plantilla_empleados_osint.csv'
  link.click()
  URL.revokeObjectURL(url)
}

// --- Manejo de archivo CSV ---
const handleFileUpload = (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  if (file.size > 10 * 1024 * 1024) {
    showNotice({ type: 'warning', message: 'El archivo supera el límite de 10MB.' })
    input.value = ''
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    const text = e.target?.result as string
    const lines = text.replace(/^\uFEFF/, '').split(/\r?\n/).filter(line => line.trim() !== '')
    if (lines.length < 2) {
      showNotice({ type: 'warning', message: 'El archivo no contiene datos válidos.' })
      return
    }
    const separator = lines[0].includes(';') && !lines[0].includes(',') ? ';' : ','
    const headers = parseCsvLine(lines[0], separator).map(h => h.trim().toLowerCase())
    const requiredHeaders = [
      { label: 'nombre', aliases: ['nombre', 'name'] },
      { label: 'email', aliases: ['email', 'correo'] },
      { label: 'departamento', aliases: ['departamento', 'department'] },
      { label: 'cargo', aliases: ['cargo', 'role'] },
    ]
    const missingHeaders = requiredHeaders
      .filter(group => !group.aliases.some(alias => headers.includes(alias)))
      .map(group => group.label)
    if (missingHeaders.length > 0) {
      showNotice({ type: 'error', title: 'CSV inválido', message: `Faltan columnas obligatorias: ${missingHeaders.join(', ')}.` })
      input.value = ''
      return
    }
    if (lines.length - 1 > 5000) {
      showNotice({ type: 'warning', message: 'El CSV supera el máximo de 5,000 filas.' })
      input.value = ''
      return
    }
    const usuarios: UsuarioInput[] = []
    const rowErrors: string[] = []
    const emails = new Set(pendingUsers.value.map(user => user.email.toLowerCase()))

    for (let i = 1; i < lines.length; i++) {
      const values = parseCsvLine(lines[i], separator)
      const obj: any = {}
      headers.forEach((h, idx) => {
        obj[h] = values[idx] || ''
      })
      const usuario: UsuarioInput = {
        nombre: obj['nombre'] || obj['name'] || '',
        email: (obj['email'] || obj['correo'] || '').toLowerCase(),
        telefono: normalizePhone(obj['telefono'] || obj['teléfono'] || obj['phone'] || obj['celular'] || ''),
        departamento: obj['departamento'] || obj['department'] || '',
        cargo: obj['cargo'] || obj['role'] || '',
      }
      if (!usuario.nombre || !usuario.email || !usuario.departamento || !usuario.cargo) {
        rowErrors.push(`Fila ${i + 1}: faltan campos obligatorios`)
        continue
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(usuario.email)) {
        rowErrors.push(`Fila ${i + 1}: correo inválido`)
        continue
      }
      if (!isValidInternationalPhone(usuario.telefono)) {
        rowErrors.push(`Fila ${i + 1}: teléfono inválido`)
        continue
      }
      if (emails.has(usuario.email)) {
        rowErrors.push(`Fila ${i + 1}: correo duplicado en la lista`)
        continue
      }
      emails.add(usuario.email)
      usuarios.push(usuario)
    }
    if (usuarios.length > 0) {
      // Añadir a la lista pendiente
      pendingUsers.value = [...pendingUsers.value, ...usuarios]
      uploadedCount.value = usuarios.length
      // Mostrar mensaje
      showNotice({
        type: rowErrors.length ? 'warning' : 'success',
        title: 'CSV procesado',
        message: `${usuarios.length} fila(s) válida(s).${rowErrors.length ? ` ${rowErrors.length} fila(s) omitida(s): ${rowErrors.slice(0, 3).join('; ')}${rowErrors.length > 3 ? '; ...' : ''}` : ''}`
      })
    } else {
      showNotice({ type: 'warning', message: 'No se encontraron usuarios válidos en el archivo.' })
    }
    input.value = ''
  }
  reader.onerror = () => {
    showNotice({ type: 'error', message: 'No se pudo leer el archivo CSV.' })
    input.value = ''
  }
  reader.readAsText(file)
}

// --- Botón importar ---
const handleImport = () => {
  if (pendingUsers.value.length === 0) {
    showNotice({ type: 'warning', message: 'No hay usuarios para importar.' })
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
