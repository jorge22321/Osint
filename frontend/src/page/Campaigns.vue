<template>
  <div class="max-w-6xl mx-auto mb-10 mt-6">
   
    <!-- Stepper (sin cambios) -->
    <div class="relative flex justify-between items-center mb-12 px-10">
      <div class="absolute top-1/2 left-10 right-10 h-0.5 bg-[#434655] -translate-y-1/2 -z-10"></div>
      <div 
        class="absolute top-1/2 left-10 h-0.5 bg-blue-500 -translate-y-1/2 -z-10 transition-all duration-700 ease-in-out"
        :style="{ width: progressWidth }"
      ></div>

      <div class="flex flex-col items-center gap-2">
        <div 
          :class="['w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all', 
          step >= 1 ? 'bg-blue-500 text-white ring-4 ring-blue-900 shadow-lg' : 'bg-[#282a32] text-[#8d90a0]']"
        >1</div>
        <span :class="['text-[10px] font-bold uppercase tracking-widest', step >= 1 ? 'text-blue-500' : 'text-[#8d90a0]']">Configuración</span>
      </div>

      <div class="flex flex-col items-center gap-2">
        <div 
          :class="['w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all', 
          step >= 2 ? 'bg-blue-500 text-white ring-4 ring-blue-900 shadow-lg' : 'bg-[#282a32] text-[#8d90a0]']"
        >2</div>
        <span :class="['text-[10px] font-bold uppercase tracking-widest', step >= 2 ? 'text-blue-500' : 'text-[#8d90a0]']">Contenido</span>
      </div>

      <div class="flex flex-col items-center gap-2">
        <div 
          :class="['w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all', 
          step >= 3 ? 'bg-blue-500 text-white ring-4 ring-blue-900 shadow-lg' : 'bg-[#282a32] text-[#8d90a0]']"
        >3</div>
        <span :class="['text-[10px] font-bold uppercase tracking-widest', step >= 3 ? 'text-blue-500' : 'text-[#8d90a0]']">Despliegue</span>
      </div>
    </div>

    <div class="max-w-6xl mx-auto">
      
      <!-- PASO 1: Configuración -->
      <div v-if="step === 1" class="grid grid-cols-12 gap-6 animate-in fade-in duration-500">
        <div class="col-span-12 lg:col-span-8">
          <div class="bg-[#1d1f27] rounded-xl border border-[#434655] p-6 flex flex-col gap-6 shadow-xl">
            <div class="flex items-center gap-2 border-b border-[#434655] pb-4">
              <i class="fa-solid fa-sliders text-blue-500"></i>
              <h3 class="text-xl font-semibold text-[#e1e2ed]">Configuración General</h3>
            </div>
            
            <!-- Nombre de campaña -->
            <div class="flex flex-col gap-2">
              <label class="text-[10px] font-bold text-[#8d90a0] uppercase tracking-widest">Nombre de la Campaña</label>
              <input 
                v-model="form.name"
                class="bg-[#11131b] border border-[#434655] rounded-lg p-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all" 
                placeholder="Ej: Auditoría Q3 - Departamento Finanzas" 
                type="text"
              >
            </div>

            <!-- Vector de ataque -->
            <div class="flex flex-col gap-2">
              <label class="text-[10px] font-bold text-[#8d90a0] uppercase tracking-widest">Vector de Ataque</label>
              <div class="grid grid-cols-2 gap-4 p-1 bg-[#11131b] border border-[#434655] rounded-xl">
                <button 
                  @click="form.vector = 'email'"
                  :class="['flex items-center justify-center gap-2 py-3 rounded-lg font-bold transition-all', form.vector === 'email' ? 'bg-blue-600 text-white shadow-md' : 'text-[#8d90a0] hover:bg-[#32343d]']"
                >
                  <i class="fa-solid fa-envelope"></i> Phishing Email
                </button>
                <button 
                  @click="form.vector = 'sms'"
                  :class="['flex items-center justify-center gap-2 py-3 rounded-lg font-bold transition-all', form.vector === 'sms' ? 'bg-blue-600 text-white shadow-md' : 'text-[#8d90a0] hover:bg-[#32343d]']"
                >
                  <i class="fa-solid fa-comment-sms"></i> Smishing SMS
                </button>
              </div>
            </div>

            <!-- Selector de destinatarios (ahora con modal) -->
            <div class="flex flex-col gap-2">
              <label class="text-[10px] font-bold text-[#8d90a0] uppercase tracking-widest">Grupo de Empleados Objetivo</label>
              <div 
                @click="showTargetModal = true"
                class="w-full bg-[#11131b] border border-[#434655] rounded-lg p-3 text-sm flex items-center justify-between cursor-pointer hover:border-blue-500 transition-all"
              >
                <span :class="selectedTargets.length === 0 ? 'text-[#8d90a0]' : 'text-[#e1e2ed]'">
                  {{ selectedTargets.length === 0 ? 'Seleccionar empleados...' : `${selectedTargets.length} empleados seleccionados` }}
                </span>
                <i class="fa-solid fa-chevron-down text-[#8d90a0] text-xs"></i>
              </div>
              <p v-if="selectedTargets.length > 0" class="text-xs text-[#8d90a0] truncate">
                IDs: {{ selectedTargets.join(', ') }}
              </p>
            </div>
          </div>
        </div>

        <div class="col-span-12 lg:col-span-4 flex flex-col gap-6">
          <div class="bg-[#282a32] rounded-xl border border-blue-500/20 p-4 flex flex-col gap-3">
            <div class="flex items-center gap-2 text-blue-400">
              <i class="fa-solid fa-circle-info"></i>
              <span class="font-bold text-xs uppercase">Consejo de CISO</span>
            </div>
            <p class="text-xs text-[#8d90a0] leading-relaxed">
              Targetear departamentos específicos como **Finanzas** o **RRHH** suele resultar en una tasa de éxito un 14% mayor debido a la naturaleza sensible de sus tareas.
            </p>
          </div>
        </div>
      </div>

      <!-- PASO 2: Contenido -->
      <div v-if="step === 2" class="grid grid-cols-12 gap-6 animate-in fade-in duration-500">
        <div class="col-span-12 lg:col-span-4">
          <div class="bg-[#1d1f27] rounded-xl border border-[#434655] h-full flex flex-col overflow-hidden shadow-lg">
            <div class="bg-[#32343d] p-4 flex items-center justify-between border-b border-[#434655]">
              <span class="text-[10px] font-bold uppercase text-[#e1e2ed]">Insights OSINT</span>
              <span class="text-[9px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20">LIVE DATA</span>
            </div>
            <div class="p-5 flex flex-col gap-5">
              <div class="flex flex-col gap-1">
                <span class="text-[10px] text-[#8d90a0] font-bold uppercase">Dominio Objetivo</span>
                <div class="bg-[#11131b] border border-[#434655] p-2 rounded flex items-center justify-between">
                  <span class="font-mono text-xs text-blue-400">{{ organizationDomain }}</span>
                  <i class="fa-solid fa-circle-check text-[10px] text-emerald-500"></i>
                </div>
              </div>
              <div class="flex flex-col gap-1">
                <span class="text-[10px] text-[#8d90a0] font-bold uppercase">Emails Expuestos</span>
                <div class="flex flex-wrap gap-1">
                  <span 
                    v-for="email in exposedEmails.slice(0, 3)" 
                    :key="email"
                    class="bg-[#32343d] px-2 py-1 rounded text-[10px] font-mono border border-[#434655]"
                  >
                    {{ email }}
                  </span>
                  <span v-if="exposedEmails.length > 3" class="text-[10px] text-blue-500 p-1">
                    +{{ exposedEmails.length - 3 }} más
                  </span>
                  <span v-if="exposedEmails.length === 0" class="text-[10px] text-[#8d90a0] p-1">
                    Sin hallazgos
                  </span>
                </div>
              </div>
              <button 
                @click="generateContent"
                :disabled="isGenerating"
                class="mt-4 w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <i :class="['fa-solid fa-wand-magic-sparkles group-hover:rotate-12 transition-transform', isGenerating ? 'animate-spin' : '']"></i>
                {{ isGenerating ? 'Generando...' : 'Generar con IA OSINT' }}
              </button>
            </div>
          </div>
        </div>

        <div class="col-span-12 lg:col-span-8">
          <div class="bg-[#1d1f27] rounded-xl border border-[#434655] flex flex-col shadow-lg overflow-hidden">
            <div class="p-4 border-b border-[#434655] flex items-center gap-6">
              <button class="text-[10px] font-bold text-blue-500 border-b-2 border-blue-500 pb-1">EDITOR</button>
              <button class="text-[10px] font-bold text-[#8d90a0] pb-1 hover:text-[#e1e2ed]">VISTA PREVIA</button>
              <div class="ml-auto flex items-center gap-2">
                <div class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                <span class="text-[9px] text-[#8d90a0] font-bold uppercase text-xs">Autoguardado</span>
              </div>
            </div>
            <div class="p-6 flex flex-col gap-4">
              <div class="flex flex-col gap-2">
                <label class="text-[10px] text-[#8d90a0] font-bold uppercase">Asunto Generado por IA</label>
                <input 
                  v-model="form.subject"
                  class="w-full bg-[#11131b] border border-[#434655] rounded-lg p-3 text-sm text-[#e1e2ed] focus:border-blue-500 outline-none" 
                  type="text"
                >
              </div>
              <div class="flex flex-col gap-2">
                <label class="text-[10px] text-[#8d90a0] font-bold uppercase">Cuerpo del Mensaje</label>
                <div class="bg-[#11131b] border border-[#434655] rounded-lg flex flex-col h-64">
                  <div class="p-2 border-b border-[#434655] flex items-center gap-3">
                    <button class="p-1 hover:bg-[#32343d] rounded text-[#8d90a0]"><i class="fa-solid fa-bold text-xs"></i></button>
                    <button class="p-1 hover:bg-[#32343d] rounded text-[#8d90a0]"><i class="fa-solid fa-italic text-xs"></i></button>
                    <button class="p-1 hover:bg-[#32343d] rounded text-[#8d90a0]"><i class="fa-solid fa-link text-xs"></i></button>
                  </div>
                  <textarea 
                    v-model="form.body"
                    class="flex-1 bg-transparent p-4 resize-none border-none focus:ring-0 text-sm leading-relaxed text-[#e1e2ed] outline-none"
                  ></textarea>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- PASO 3: Despliegue -->
      <div v-if="step === 3" class="mt-4 grid grid-cols-12 gap-6 animate-in zoom-in-95 duration-500">
        <div class="col-span-12">
          <div class="bg-[#1d1f27] rounded-xl border border-[#434655] p-8 shadow-xl grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div class="flex flex-col gap-4">
              <label class="text-[10px] font-bold text-[#8d90a0] uppercase tracking-widest">Programar Fecha de Envío</label>
              <div class="bg-[#11131b] border border-[#434655] rounded-xl p-6">
                <div class="flex items-center justify-between mb-6">
                  <span class="font-bold text-sm">{{ currentMonth }} {{ currentYear }}</span>
                  <div class="flex gap-2">
                    <i class="fa-solid fa-chevron-left text-xs cursor-pointer hover:text-blue-500" @click="prevMonth"></i>
                    <i class="fa-solid fa-chevron-right text-xs cursor-pointer hover:text-blue-500" @click="nextMonth"></i>
                  </div>
                </div>
                <div class="grid grid-cols-7 gap-2 text-center text-[9px] font-bold text-[#8d90a0] mb-4 uppercase">
                  <span>Dom</span><span>Lun</span><span>Mar</span><span>Mie</span><span>Jue</span><span>Vie</span><span>Sab</span>
                </div>
                <div class="grid grid-cols-7 gap-2 text-center text-xs">
                  <span 
                    v-for="(day, index) in daysInMonth" 
                    :key="index"
                    @click="selectDay(day)"

                    :class="[
                      'p-2 hover:bg-[#32343d] rounded-lg cursor-pointer transition-all',
                      day.date === selectedDay ? 'bg-blue-600 text-white font-bold' : '',
                      day.isCurrentMonth ? '' : 'text-[#434655] cursor-not-allowed'
                    ]"
                  >
                    {{ day.date }}
                  </span>
                </div>
              </div>
            </div>

            <div class="flex flex-col justify-center items-center gap-6 border-l border-[#434655] pl-12 border-dashed">
              <div class="w-20 h-20 bg-[#32343d] rounded-full flex items-center justify-center border border-[#434655] shadow-inner">
                <i class="fa-solid fa-rocket text-3xl text-[#8d90a0]"></i>
              </div>
              <div class="text-center">
                <h4 class="text-xl font-bold text-[#e1e2ed] mb-2">Listo para el Despliegue</h4>
                <p class="text-xs text-[#8d90a0] max-w-xs leading-relaxed">
                  La campaña se pondrá en cola en nuestro clúster Redis de alta disponibilidad. El envío comenzará automáticamente.
                </p>
              </div>
              <button 
                @click="deployCampaign"
                :disabled="isDeploying"
                class="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-[#0c0e16] font-extrabold text-sm rounded-xl flex items-center justify-center gap-3 shadow-2xl shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <i :class="['fa-solid fa-paper-plane', isDeploying ? 'animate-pulse' : '']"></i>
                {{ isDeploying ? 'Desplegando...' : 'Agendar Despliegue en Clúster' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Botones de navegación -->
      <div class="flex justify-between mt-5 pt-6">
        <button 
          v-if="step > 1" 
          @click="step--"
          class="px-6 py-2 border border-[#434655] text-[#8d90a0] rounded-lg hover:bg-[#32343d] transition-all text-sm font-bold uppercase tracking-widest"
        >
          Atrás
        </button>
        <div v-else></div>

        <button 
          v-if="step < 3" 
          @click="goToNextStep"
          class="px-8 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-all text-sm font-bold uppercase tracking-widest shadow-lg shadow-blue-600/20"
        >
          Siguiente Paso
        </button>
      </div>

    </div>

    <!-- Modal de selección de destinatarios -->
    <SelectTargetsModal 
      v-if="showTargetModal"
      :organizacion-id="organizacionId"
      :preselected-ids="selectedTargets"
      @close="showTargetModal = false"
      @apply="handleApplyTargets"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import SelectTargetsModal from '../components/modals/SelectTargetsModal.vue'

// --- Interfaces ---
interface FormData {
  name: string
  vector: 'email' | 'sms'
  subject: string
  body: string
}

// --- Estado ---
const step = ref(1)
const showTargetModal = ref(false)
const isGenerating = ref(false)
const isDeploying = ref(false)

const selectDay = (day: { date: number | string; isCurrentMonth: boolean }) => {
  if (day.isCurrentMonth && typeof day.date === 'number') {
    selectedDay.value = day.date
  }
}

const form = ref<FormData>({
  name: '',
  vector: 'email',
  subject: '',
  body: ''
})

// --- Selección de destinatarios ---
const selectedTargets = ref<string[]>([])
const selectedTargetUsers = ref<any[]>([])

// --- Datos del administrador y organización ---
const admin = computed(() => {
  try { return JSON.parse(localStorage.getItem('ciso_user') || '{}') } 
  catch { return { id_organizacion: '', nombre: 'Admin' } }
})
const organizacionId = computed(() => admin.value.id_organizacion || '')

// --- Datos OSINT (para el panel e IA) ---
const organizationDomain = ref('')
const exposedEmails = ref<string[]>([])
const latestOsintLogId = ref<string>('') // Guardamos el ID del log OSINT

const getDomainFromEmail = (email: string) => {
  if (!email) return ''
  const normalized = email.trim().toLowerCase()
  const atIndex = normalized.indexOf('@')
  if (atIndex === -1) return ''
  return normalized.slice(atIndex + 1).replace(/^www\./, '')
}

const getActiveTargetDomain = () => {
  const selectedEmail = selectedTargetUsers.value
    .map((user: any) => user.email)
    .find((email: string) => Boolean(email))

  if (selectedEmail) {
    return getDomainFromEmail(selectedEmail)
  }

  const adminData = JSON.parse(localStorage.getItem('ciso_user') || '{}')
  return adminData.dominio || ''
}

// --- Calendario (fecha seleccionada) ---
const currentMonth = ref(new Date().getMonth())
const currentYear = ref(new Date().getFullYear())
const selectedDay = ref<number | null>(null)

// --- Computed: días del mes ---
const daysInMonth = computed(() => {
  const firstDay = new Date(currentYear.value, currentMonth.value, 1).getDay()
  const daysCount = new Date(currentYear.value, currentMonth.value + 1, 0).getDate()
  const days = []
  const today = new Date()
  const isCurrentMonth = (currentMonth.value === today.getMonth() && currentYear.value === today.getFullYear())
  
  for (let i = 0; i < firstDay; i++) {
    days.push({ date: '', isCurrentMonth: false })
  }
  for (let d = 1; d <= daysCount; d++) {
    const isPast = isCurrentMonth && d < today.getDate()
    days.push({ date: d, isCurrentMonth: !isPast })
  }
  return days
})

const progressWidth = computed(() => {
  if (step.value === 1) return '0%'
  if (step.value === 2) return '50%'
  return '100%'
})

// --- Funciones del calendario ---
const prevMonth = () => {
  if (currentMonth.value === 0) { currentMonth.value = 11; currentYear.value-- } 
  else { currentMonth.value-- }
}
const nextMonth = () => {
  if (currentMonth.value === 11) { currentMonth.value = 0; currentYear.value++ } 
  else { currentMonth.value++ }
}

// --- Navegación entre pasos ---
const goToNextStep = () => {
  if (step.value === 1 && !form.value.name) {
    alert('Por favor, ingresa un nombre para la campaña.')
    return
  }
  if (step.value === 1 && selectedTargets.value.length === 0) {
    alert('Selecciona al menos un empleado objetivo.')
    return
  }
  step.value++
}

// --- Cargar datos OSINT al entrar al paso 2 ---
const loadOsintData = async () => {
  const activeDomain = getActiveTargetDomain() || 'Dominio no encontrado'
  organizationDomain.value = activeDomain

  if (!organizacionId.value || !activeDomain || activeDomain === 'Dominio no encontrado') {
    exposedEmails.value = []
    return
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
        }
      }
    `,
    variables: {
      dominio: activeDomain,
      organizacionId: organizacionId.value,
    },
      }),
    })

    const result = await response.json()
    if (result.errors) {
      throw new Error(result.errors[0].message)
    }

    const logs = result.data?.osintScan || []
    const emails: string[] = []

    if (logs.length > 0 && logs[0].id) {
  latestOsintLogId.value = logs[0].id
  console.log(' Log OSINT asignado:', latestOsintLogId.value)
} else {
  console.warn(' No se obtuvo un ID de OSINT en el escaneo.')
}

    logs.forEach((log: any) => {
      const detalle = log.detalle_json || {}
      if (detalle.email) emails.push(detalle.email)
      if (detalle.emails && Array.isArray(detalle.emails)) {
        emails.push(...detalle.emails)
      }
    })

    exposedEmails.value = [...new Set(emails)]
  } catch (error) {
    console.error('Error loading OSINT data:', error)
    exposedEmails.value = []
  }
}

// --- Generar contenido con IA (CORREGIDO) ---
const generateContent = async () => {
  if (!latestOsintLogId.value) {
    alert('No se encontraron registros OSINT válidos para generar la campaña.')
    return
  }

  isGenerating.value = true

  // Tomamos los datos del primer usuario objetivo seleccionado
  const primerUsuario = selectedTargetUsers.value[0] || {}
  const departamento = primerUsuario.departamento || 'General'
  const nombreObjetivo = primerUsuario.nombre || primerUsuario.nombre_completo || ''
  const cargoObjetivo = primerUsuario.cargo || primerUsuario.puesto || ''
  const tipoSimulacion = form.value.vector === 'sms' ? 'Smishing' : 'Phishing'

  try {
    const response = await fetch('http://localhost:4000/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('ciso_token')}`,
      },
      body: JSON.stringify({
        query: `
          mutation GenerarContenido(
            $osintLogId: ID!
            $departamento: String!
            $tipoSimulacion: String!
            $nombreObjetivo: String
            $cargoObjetivo: String
          ) {
            generarContenidoCampaign(
              osintLogId: $osintLogId
              departamento: $departamento
              tipoSimulacion: $tipoSimulacion
              nombreObjetivo: $nombreObjetivo
              cargoObjetivo: $cargoObjetivo
            ) {
              asunto
              contenido
            }
          }
        `,
        variables: { 
          osintLogId: latestOsintLogId.value,
          departamento,
          tipoSimulacion,
          nombreObjetivo,
          cargoObjetivo
        },
      }),
    })

    const result = await response.json()
    if (result.errors) {
      throw new Error(result.errors[0].message)
    }

    const data = result.data.generarContenidoCampaign
    form.value.subject = data.asunto
    form.value.body = data.contenido
  } catch (error: any) {
    alert('Error al generar contenido: ' + error.message)
  } finally {
    isGenerating.value = false
  }
}

// --- Manejar la selección de destinatarios ---
const handleApplyTargets = (ids: string[], users: any[]) => {
  selectedTargets.value = ids
  selectedTargetUsers.value = users
  showTargetModal.value = false
}

// --- Desplegar campaña ---
const deployCampaign = async () => {
  if (!form.value.name || selectedTargets.value.length === 0 || !form.value.subject || !form.value.body) {
    alert('Completa todos los campos obligatorios.')
    return
  }
  if (!selectedDay.value) {
    alert('Selecciona una fecha de envío.')
    return
  }

  const adminData = JSON.parse(localStorage.getItem('ciso_user') || '{}')
  const orgId = adminData.id_organizacion
  const adminId = adminData.id

  if (!orgId || !adminId) {
    alert('No se encontró información de organización o administrador. Vuelve a iniciar sesión.')
    return
  }

  const scheduledDate = new Date(currentYear.value, currentMonth.value, selectedDay.value)
  const isoDate = scheduledDate.toISOString()

  isDeploying.value = true
  try {
    const responseCampaign = await fetch('http://localhost:4000/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('ciso_token')}`,
      },
      body: JSON.stringify({
        query: `
          mutation CrearCampaign($input: CrearCampaignInput!, $organizacionId: ID!) {
            crearCampaign(input: $input, organizacionId: $organizacionId) {
              id
              nombre
              estado
            }
          }
        `,
        variables: {
          input: {
            nombre: form.value.name,
            tipo: form.value.vector === 'email' ? 'Phishing' : 'Smishing',
            estado: 'Programada',
            fecha_programada: isoDate,
            creado_por: adminId,
          },
          organizacionId: orgId,
        },
      }),
    })

    const resultCampaign = await responseCampaign.json()
    if (resultCampaign.errors) {
      throw new Error(resultCampaign.errors[0].message)
    }

    const campaignId = resultCampaign.data.crearCampaign.id
    alert(`Campaña "${resultCampaign.data.crearCampaign.nombre}" creada exitosamente. ID: ${campaignId}`)

    const asunto = form.value.subject
    const contenido = form.value.body
    let enviosExitosos = 0

    for (const targetId of selectedTargets.value) {
      const trackingCode = crypto.randomUUID()

      try {
        const responseEnvio = await fetch('http://localhost:4000/graphql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('ciso_token')}`,
          },
          body: JSON.stringify({
            query: `
              mutation CrearEnvio($input: CrearEnvioInput!) {
                crearEnvio(input: $input) {
                  id
                  estado
                }
              }
            `,
            variables: {
              input: {
                id_campana: campaignId,
                id_usuario_objetivo: targetId,
                asunto_generado: asunto,
                contenido_generado: contenido,
                tracking_code: trackingCode,
              },
            },
          }),
        })

        const resultEnvio = await responseEnvio.json()
        if (!resultEnvio.errors) {
          enviosExitosos++
        }
      } catch (error) {
        console.error(`Error en la petición para ${targetId}:`, error)
      }
    }

    alert(`${enviosExitosos} de ${selectedTargets.value.length} envíos creados correctamente.`)

    form.value = { name: '', vector: 'email', subject: '', body: '' }
    selectedTargets.value = []
    selectedTargetUsers.value = []
    step.value = 1

  } catch (error: any) {
    alert('Error al desplegar campaña: ' + error.message)
  } finally {
    isDeploying.value = false
  }
}

// Watcher para cargar OSINT al entrar al paso 2
watch(step, (newStep) => {
  if (newStep === 2) {
    loadOsintData()
  }
})
</script>

<style scoped>
/* Animaciones de entrada sencillas */
.animate-in {
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Ocultar flechas del select por defecto para mantener estética */
select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%238d90a0'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  background-size: 1em;
}
</style>