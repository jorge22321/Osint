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
              <div
                v-if="form.vector === 'sms'"
                class="mt-2 flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-amber-100"
              >
                <i class="fa-solid fa-mobile-screen mt-0.5 text-amber-400"></i>
                <div>
                  <p class="text-xs font-bold">Smishing requiere número telefónico</p>
                  <p class="mt-1 text-[11px] leading-5 text-amber-200/80">
                    Cada empleado debe tener un número con código de país, por ejemplo +51 999 999 999.
                    <span v-if="targetsWithoutPhone.length > 0" class="font-bold text-amber-300">
                      {{ targetsWithoutPhone.length }} seleccionado(s) todavía no tienen teléfono.
                    </span>
                  </p>
                </div>
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
            <div class="flex flex-col gap-2">
              <label class="text-[10px] font-bold text-[#8d90a0] uppercase tracking-widest">Capacitación después del clic</label>
              <select v-model="trainingTemplateId" class="rounded-lg border border-[#434655] bg-[#11131b] p-3 text-sm text-[#e1e2ed] outline-none focus:border-blue-500">
                <option value="">Lección base verificada</option>
                <option v-for="item in availableTemplates" :key="item.id" :value="item.id">{{ item.titulo }} · v{{ item.version }}</option>
              </select>
              <p class="text-xs text-[#8d90a0]">La versión elegida se conserva en la campaña. <router-link to="/app/training-library" class="text-blue-400 hover:underline">Editar plantillas</router-link></p>
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
                {{ isGenerating ? 'Preparando...' : 'Sugerir contenido' }}
              </button>
            </div>
          </div>
        </div>

        <div class="col-span-12 lg:col-span-8">
          <div class="bg-[#1d1f27] rounded-xl border border-[#434655] flex flex-col shadow-lg overflow-hidden h-full min-h-[450px]">
            
            <!-- TABS: Editor vs Vista Previa -->
            <div class="p-4 border-b border-[#434655] flex items-center gap-6 bg-[#181a20]">
              <button 
                @click="activeTab = 'editor'"
                :class="['text-[10px] font-bold pb-1 transition-all duration-300', activeTab === 'editor' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-[#8d90a0] hover:text-[#e1e2ed]']"
              >
                EDITOR
              </button>
              <button 
                @click="activeTab = 'preview'"
                :class="['text-[10px] font-bold pb-1 transition-all duration-300', activeTab === 'preview' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-[#8d90a0] hover:text-[#e1e2ed]']"
              >
                VISTA PREVIA
              </button>
              <div class="ml-auto flex items-center gap-2">
                <span class="text-[9px] text-[#8d90a0] font-bold uppercase">Vista editable</span>
              </div>
            </div>

            <!-- CONTENIDO DE LAS TABS -->
            <div class="p-6 flex-1 flex flex-col overflow-hidden relative">
              
              <!-- Tab 1: EDITOR -->
              <div v-if="activeTab === 'editor'" class="flex flex-col gap-4 h-full animate-in fade-in duration-300">
                <div class="flex flex-col gap-2">
                  <label class="text-[10px] text-[#8d90a0] font-bold uppercase">Asunto de la campaña</label>
                  <input 
                    v-model="form.subject"
                    class="w-full bg-[#11131b] border border-[#434655] rounded-lg p-3 text-sm text-[#e1e2ed] focus:border-blue-500 outline-none" 
                    type="text"
                    :disabled="form.vector === 'sms'"
                    :placeholder="form.vector === 'sms' ? 'No aplica para SMS' : 'Asunto del correo...'"
                  >
                </div>
                <div class="flex flex-col gap-2 flex-1">
                  <label class="text-[10px] text-[#8d90a0] font-bold uppercase">Cuerpo del Mensaje</label>
                  <div class="bg-[#11131b] border border-[#434655] rounded-lg flex flex-col h-full min-h-[200px]">
                    <textarea 
                      v-model="form.body"
                      class="flex-1 bg-transparent p-4 resize-none border-none focus:ring-0 text-sm leading-relaxed text-[#e1e2ed] outline-none"
                      placeholder="Escribe o genera el contenido aquí..."
                    ></textarea>
                  </div>
                </div>
              </div>

              <!-- Tab 2: VISTA PREVIA -->
              <div v-if="activeTab === 'preview'" class="h-full w-full flex items-center justify-center animate-in fade-in duration-300 bg-[#11131b] rounded-xl border border-[#434655] p-6 overflow-y-auto">
                
                <!-- PREVIEW: EMAIL -->
                <div v-if="form.vector === 'email'" class="w-full max-w-2xl bg-white rounded-xl text-[#202124] flex flex-col shadow-2xl overflow-hidden h-full">
                  <div class="bg-[#f2f2f2] px-4 py-3 border-b border-gray-300 flex items-center gap-2">
                    <div class="w-3 h-3 rounded-full bg-red-400"></div>
                    <div class="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <div class="w-3 h-3 rounded-full bg-green-400"></div>
                  </div>
                  <div class="p-6 border-b border-gray-200">
                    <div class="flex items-center gap-4 mb-4">
                      <div class="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg">
                        S
                      </div>
                      <div>
                        <p class="text-sm font-semibold">seguridad@<span class="text-gray-500 font-normal">tuempresa.com</span></p>
                        <p class="text-xs text-gray-500">Para: {{ selectedTargetUsers.length > 0 && selectedTargetUsers[0].email ? selectedTargetUsers[0].email : 'empleado@dominio.com' }}</p>
                      </div>
                    </div>
                    <h2 class="text-xl font-bold">{{ form.subject || '(Sin Asunto)' }}</h2>
                  </div>
                  <div class="p-6 text-sm leading-relaxed whitespace-pre-wrap flex-1 overflow-y-auto">
                    {{ form.body || '(El contenido de tu correo electrónico se mostrará aquí)' }}
                  </div>
                </div>

                <!-- PREVIEW: SMS -->
                <div v-if="form.vector === 'sms'" class="w-[300px] bg-[#f4f4f5] rounded-[2.5rem] border-[12px] border-[#27272a] h-[550px] shadow-2xl flex flex-col overflow-hidden relative">
                  <!-- Notch -->
                  <div class="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-[#27272a] rounded-b-xl z-10"></div>
                  
                  <div class="bg-[#f4f4f5] px-4 pt-10 pb-2 border-b border-gray-200 flex flex-col items-center">
                    <div class="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center mb-1">
                      <i class="fa-solid fa-user text-gray-500 text-xl"></i>
                    </div>
                    <p class="text-xs text-black font-semibold">Desconocido</p>
                  </div>
                  
                  <div class="flex-1 p-4 flex flex-col justify-end overflow-y-auto">
                    <div class="flex flex-col items-start gap-1">
                      <span class="text-[10px] text-gray-400 ml-2">Hoy {{ new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }}</span>
                      <div class="bg-[#e4e4e7] text-black px-4 py-3 rounded-2xl rounded-bl-sm text-[13px] leading-relaxed shadow-sm whitespace-pre-wrap max-w-[85%]">
                        {{ form.body || '(El contenido de tu SMS se mostrará aquí)' }}
                      </div>
                    </div>
                  </div>
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
                  <span class="font-bold text-sm">{{ currentMonthName }} {{ currentYear }}</span>
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
                <div class="mt-6 border-t border-[#434655] pt-5">
                  <label for="scheduled-time" class="mb-2 block text-[10px] font-bold uppercase tracking-widest text-[#8d90a0]">
                    Hora de envío
                  </label>
                  <div class="flex items-center gap-3 rounded-lg border border-[#434655] bg-[#1d1f27] px-4 py-3 focus-within:border-blue-500">
                    <i class="fa-regular fa-clock text-blue-400"></i>
                    <input
                      id="scheduled-time"
                      v-model="selectedTime"
                      type="time"
                      step="60"
                      class="w-full bg-transparent text-sm font-semibold text-[#e1e2ed] outline-none [color-scheme:dark]"
                    />
                  </div>
                  <p class="mt-2 text-[10px] text-[#8d90a0]">Zona horaria del navegador: {{ browserTimeZone }}. Horario permitido: {{ campaignSettings.hora_inicio }}–{{ campaignSettings.hora_fin }} ({{ campaignSettings.zona_horaria }}).</p>
                </div>
              </div>
            </div>

            <div class="flex flex-col justify-center items-center gap-6 border-l border-[#434655] pl-12 border-dashed">
              <div class="w-20 h-20 bg-[#32343d] rounded-full flex items-center justify-center border border-[#434655] shadow-inner">
                <i class="fa-solid fa-rocket text-3xl text-[#8d90a0]"></i>
              </div>
              <div class="text-center">
                <h4 class="text-xl font-bold text-[#e1e2ed] mb-2">{{ automaticDeliveryReady ? (publicUrlLocal ? 'Prueba local lista' : 'Lista para programar') : 'Envío no disponible' }}</h4>
                <p class="text-xs text-[#8d90a0] max-w-xs leading-relaxed">
                  {{ deliveryBlockReason }}
                </p>
                <div v-if="scheduledDateLabel" class="mt-4 rounded-lg border border-blue-500/20 bg-blue-500/10 px-4 py-3 text-xs text-blue-200">
                  <i class="fa-regular fa-calendar-check mr-2 text-blue-400"></i>
                  {{ scheduledDateLabel }}
                </div>
              </div>
              <button 
                @click="deployCampaign"
                :disabled="isDeploying || !automaticDeliveryReady || (publicUrlLocal && form.vector === 'sms')"
                class="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-[#0c0e16] font-extrabold text-sm rounded-xl flex items-center justify-center gap-3 shadow-2xl shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <i :class="['fa-solid fa-paper-plane', isDeploying ? 'animate-pulse' : '']"></i>
                {{ isDeploying ? 'Programando...' : !automaticDeliveryReady ? 'Envío no disponible' : publicUrlLocal && form.vector === 'sms' ? 'Smishing no disponible en localhost' : publicUrlLocal ? 'Programar prueba local' : 'Programar campaña' }}
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
      :requires-phone="form.vector === 'sms'"
      @close="showTargetModal = false"
      @apply="handleApplyTargets"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import SelectTargetsModal from '../components/modals/SelectTargetsModal.vue'
import { GRAPHQL_URL } from '@/config/api'
import { showNotice } from '@/composables/useNotification'
import { graphqlRequest } from '@/utils/graphqlRequest'

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
const activeTab = ref<'editor' | 'preview'>('editor') // NUEVO ESTADO PARA LAS TABS

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
const targetsWithoutPhone = computed(() => selectedTargetUsers.value.filter((user: any) => !user.telefono?.trim()))

// --- Datos del administrador y organización ---
const admin = computed(() => {
  try { return JSON.parse(localStorage.getItem('ciso_user') || '{}') } 
  catch { return { id_organizacion: '', nombre: 'Admin' } }
})
const organizacionId = computed(() => admin.value.id_organizacion || '')

// --- Datos OSINT (para el panel e IA) ---
const organizationDomain = ref('')
const exposedEmails = ref<string[]>([])
const latestOsintLogId = ref<string>('') 

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
const getDefaultScheduledTime = () => {
  const date = new Date(Date.now() + 30 * 60 * 1000)
  date.setMinutes(Math.ceil(date.getMinutes() / 15) * 15, 0, 0)
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}
const selectedTime = ref(getDefaultScheduledTime())
const browserTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Hora local'
const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
const currentMonthName = computed(() => monthNames[currentMonth.value])
const selectedDateTime = computed(() => {
  if (!selectedDay.value || !selectedTime.value) return null
  const [hour, minute] = selectedTime.value.split(':').map(Number)
  const date = new Date(currentYear.value, currentMonth.value, selectedDay.value, hour, minute, 0, 0)
  return Number.isNaN(date.getTime()) ? null : date
})
const trainingTemplateId = ref('')
const trainingTemplates = ref<any[]>([])
const campaignSettings = ref({ zona_horaria: 'America/Lima', hora_inicio: '08:00', hora_fin: '18:00', limite_destinatarios: 100 })
const backendAutomationReady = ref(false)
const publicUrlLocal = ref(true)
const automaticDeliveryReady = computed(() => backendAutomationReady.value)
const deliveryBlockReason = computed(() => !backendAutomationReady.value
  ? 'Falta configurar la clave secreta de Supabase en el servidor. Revisa Configuración.'
  : publicUrlLocal.value && form.value.vector === 'sms'
    ? 'Un teléfono no puede abrir un enlace localhost de esta PC. Puedes preparar la campaña, pero no programar SMS con este enlace.'
    : publicUrlLocal.value
      ? 'Los correos se enviarán de verdad en la fecha elegida. Abre el enlace de capacitación desde esta misma PC; en otro dispositivo, localhost no funcionará.'
      : 'Los mensajes quedarán en cola y se enviarán en la fecha y hora seleccionadas.')
const availableTemplates = computed(() => trainingTemplates.value.filter(item => item.estado === 'Publicada' && item.canal === (form.value.vector === 'sms' ? 'Smishing' : 'Phishing')))
const scheduledDateLabel = computed(() => selectedDateTime.value?.toLocaleString('es-PE', {
  dateStyle: 'full',
  timeStyle: 'short'
}) || '')

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
    showNotice({ type: 'warning', message: 'Por favor, ingresa un nombre para la campaña.' })
    return
  }
  if (step.value === 1 && selectedTargets.value.length === 0) {
    showNotice({ type: 'warning', message: 'Selecciona al menos un empleado objetivo.' })
    return
  }
  if (step.value === 1 && selectedTargets.value.length > campaignSettings.value.limite_destinatarios) {
    showNotice({ type: 'warning', message: `La campaña supera el límite de ${campaignSettings.value.limite_destinatarios} destinatarios configurado.` })
    return
  }
  if (step.value === 1 && form.value.vector === 'sms' && targetsWithoutPhone.value.length > 0) {
    showNotice({ type: 'warning', message: `${targetsWithoutPhone.value.length} empleado(s) no tienen teléfono para smishing. Agrégalo antes de continuar.` })
    return
  }
  if (step.value === 2 && (!form.value.body.trim() || (form.value.vector === 'email' && !form.value.subject.trim()))) {
    showNotice({ type: 'warning', message: 'Completa el contenido y, para correo, también el asunto antes de programar.' })
    return
  }
  step.value++
}

// --- Cargar datos OSINT al entrar al paso 2 ---
const loadOsintData = async () => {
  const activeDomain = getActiveTargetDomain() || 'Dominio no encontrado'
  organizationDomain.value = activeDomain
  latestOsintLogId.value = ''
  exposedEmails.value = []

  if (!organizacionId.value || !activeDomain || activeDomain === 'Dominio no encontrado') {
    exposedEmails.value = []
    return
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

    const logsResponse = await fetch(GRAPHQL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('ciso_token')}`,
      },
      body: JSON.stringify({
        query: `
          query LatestOsintLogs($organizacionId: ID!) {
            osintLogsPage(organizacionId: $organizacionId, limit: 100, offset: 0) {
              items { id fuente tipo_hallazgo detalle_json }
            }
          }
        `,
        variables: { organizacionId: organizacionId.value },
      }),
    })
    const logsResult = await logsResponse.json()
    if (logsResult.errors) throw new Error(logsResult.errors[0].message)
    const logs = logsResult.data?.osintLogsPage?.items || []
    const emails: string[] = []

    const relevantLogs = logs.filter((log: any) => {
      const detail = log.detalle_json || {}
      const email = String(detail.email || '').toLowerCase()
      const hosts = Array.isArray(detail.hostnames) ? detail.hostnames : []
      return email.endsWith(`@${activeDomain}`) || hosts.some((host: unknown) => {
        const normalized = String(host).toLowerCase()
        return normalized === activeDomain || normalized.endsWith(`.${activeDomain}`)
      }) || String(detail.dominio || detail.domain || '').toLowerCase() === activeDomain
    })
    latestOsintLogId.value = relevantLogs[0]?.id || ''

    relevantLogs.forEach((log: any) => {
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

// --- Generar contenido con IA ---
const generateContent = async () => {
  if (!latestOsintLogId.value) {
    showNotice({ type: 'warning', message: 'No se encontraron registros OSINT válidos para generar la campaña.' })
    return
  }

  isGenerating.value = true

  const primerUsuario = selectedTargetUsers.value[0] || {}
  const departamento = primerUsuario.departamento || 'General'
  const nombreObjetivo = primerUsuario.nombre || primerUsuario.nombre_completo || ''
  const cargoObjetivo = primerUsuario.cargo || primerUsuario.puesto || ''
  const tipoSimulacion = form.value.vector === 'sms' ? 'Smishing' : 'Phishing'

  try {
    const response = await fetch(GRAPHQL_URL, {
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
    showNotice({ type: 'error', message: `Error al generar contenido: ${error.message}` })
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
  if (!automaticDeliveryReady.value) {
    showNotice({ type: 'warning', title: 'Envío no disponible', message: deliveryBlockReason.value })
    return
  }
  if (publicUrlLocal.value && form.value.vector === 'sms') {
    showNotice({ type: 'warning', title: 'Smishing no disponible en localhost', message: deliveryBlockReason.value })
    return
  }
  if (!form.value.name || selectedTargets.value.length === 0 || !form.value.body) {
    showNotice({ type: 'warning', message: 'Completa todos los campos obligatorios.' })
    return
  }
  if (form.value.vector === 'email' && !form.value.subject) {
    showNotice({ type: 'warning', message: 'Completa el asunto para la campaña de email.' })
    return
  }
  const objetivosSinTelefono = selectedTargetUsers.value.filter((user: any) => !user.telefono)
  if (form.value.vector === 'sms' && objetivosSinTelefono.length > 0) {
    showNotice({
      type: 'warning',
      title: 'Faltan números telefónicos',
      message: `${objetivosSinTelefono.length} empleado(s) no tienen teléfono registrado. Agrégalo antes de desplegar una campaña de smishing.`
    })
    return
  }
  if (selectedTargets.value.length > campaignSettings.value.limite_destinatarios) {
    showNotice({ type: 'warning', message: `La campaña supera el límite de ${campaignSettings.value.limite_destinatarios} destinatarios configurado.` })
    return
  }
  if (!selectedDay.value) {
    showNotice({ type: 'warning', message: 'Selecciona una fecha de envío.' })
    return
  }
  if (!selectedTime.value) {
    showNotice({ type: 'warning', message: 'Selecciona la hora de envío.' })
    return
  }

  const adminData = JSON.parse(localStorage.getItem('ciso_user') || '{}')
  const orgId = adminData.id_organizacion
  const adminId = adminData.id

  if (!orgId || !adminId) {
    showNotice({ type: 'error', message: 'No se encontró información de organización o administrador. Vuelve a iniciar sesión.' })
    return
  }

  const scheduledDate = selectedDateTime.value
  if (!scheduledDate || scheduledDate.getTime() <= Date.now()) {
    showNotice({ type: 'warning', message: 'La fecha y hora de envío deben estar en el futuro.' })
    return
  }
  const orgTime = new Intl.DateTimeFormat('en-GB', { timeZone: campaignSettings.value.zona_horaria, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(scheduledDate)
  if (orgTime < campaignSettings.value.hora_inicio || orgTime > campaignSettings.value.hora_fin) {
    showNotice({ type: 'warning', message: `La hora elegida equivale a ${orgTime} en ${campaignSettings.value.zona_horaria}; debe estar entre ${campaignSettings.value.hora_inicio} y ${campaignSettings.value.hora_fin}.` })
    return
  }
  if (publicUrlLocal.value) {
    const confirmed = await showNotice({
      type: 'warning',
      title: 'Confirmar prueba local',
      message: `Se programarán ${selectedTargets.value.length} correo(s) reales. El enlace de capacitación contiene localhost y solo funcionará si el destinatario abre el correo en esta misma computadora. ¿Quieres continuar?`,
      confirmText: 'Programar prueba',
      showCancel: true
    })
    if (!confirmed) return
  }
  const isoDate = scheduledDate.toISOString()

  isDeploying.value = true
  try {
    const provider = form.value.vector === 'sms' ? 'sms' : 'email'
    const check = await graphqlRequest(`mutation($provider: String!) { checkDeliveryProvider(provider: $provider) { state detail } }`, { provider })
    if (check.checkDeliveryProvider.state !== 'Conectado') {
      throw new Error(`${provider === 'sms' ? 'Smishing' : 'Correo'} no disponible: ${check.checkDeliveryProvider.detail}`)
    }
    const responseCampaign = await fetch(GRAPHQL_URL, {
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
            trainingTemplateId: trainingTemplateId.value || null,
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
    const asunto = form.value.subject || ''
    const contenido = form.value.body
    let enviosPreparados = 0

    for (const targetId of selectedTargets.value) {
      const trackingCode = crypto.randomUUID()
      const targetUser = selectedTargetUsers.value.find((user: any) => user.id === targetId)
      const contactoDestino = form.value.vector === 'sms' ? targetUser?.telefono : targetUser?.email

      try {
        const responseEnvio = await fetch(GRAPHQL_URL, {
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
                vector: form.value.vector,
                contacto_destino: contactoDestino,
              },
            },
          }),
        })

        const resultEnvio = await responseEnvio.json()
        if (resultEnvio.errors) throw new Error(resultEnvio.errors[0].message)
        enviosPreparados++
      } catch (error) {
        console.error(`Error en la petición para ${targetId}:`, error)
      }
    }

    showNotice({
      type: enviosPreparados === selectedTargets.value.length ? 'success' : 'warning',
      title: 'Campaña desplegada',
      message: `La campaña "${resultCampaign.data.crearCampaign.nombre}" fue creada.\n${enviosPreparados} de ${selectedTargets.value.length} envíos quedaron preparados; esto no significa que hayan llegado.\nConsulta el Historial de envíos para ver cada estado.\nID: ${campaignId}`
    })

    form.value = { name: '', vector: 'email', subject: '', body: '' }
    selectedTargets.value = []
    selectedTargetUsers.value = []
    trainingTemplateId.value = ''
    activeTab.value = 'editor'
    selectedDay.value = null
    selectedTime.value = getDefaultScheduledTime()
    step.value = 1

  } catch (error: any) {
    showNotice({ type: 'error', message: `Error al desplegar campaña: ${error.message}` })
  } finally {
    isDeploying.value = false
  }
}

// Watcher para cargar OSINT al entrar al paso 2
watch(step, (newStep) => {
  if (newStep === 2) {
    loadOsintData()
    // Resetear a editor si regresamos al paso 2
    activeTab.value = 'editor'
  }
})

// Watcher para limpiar el asunto si cambian a SMS
watch(() => form.value.vector, (newVector) => {
  trainingTemplateId.value = ''
  if (newVector === 'sms') {
    form.value.subject = ''
  }
})

onMounted(async () => {
  try {
    const config = await graphqlRequest(`query { settingsOverview { backendAutomationReady publicUrlLocal settings { zona_horaria hora_inicio hora_fin limite_destinatarios } } }`)
    const settings = config.settingsOverview.settings
    backendAutomationReady.value = config.settingsOverview.backendAutomationReady
    publicUrlLocal.value = config.settingsOverview.publicUrlLocal
    campaignSettings.value = { ...settings, hora_inicio: settings.hora_inicio.slice(0, 5), hora_fin: settings.hora_fin.slice(0, 5) }
  } catch (error: any) {
    showNotice({ type: 'error', title: 'Configuración no disponible', message: 'No se pudieron cargar las reglas de campaña. Vuelve a intentarlo más tarde.' })
  }
  try {
    const library = await graphqlRequest(`query { trainingTemplates { id titulo canal estado version } }`)
    trainingTemplates.value = library.trainingTemplates
  } catch (error) {
    console.error('No se pudieron cargar las plantillas de capacitación:', error)
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
