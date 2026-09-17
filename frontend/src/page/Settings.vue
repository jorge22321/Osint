<template>
  <div class="mx-auto max-w-6xl space-y-6 px-5 py-8 text-[#e1e2ed]">
    <div>
      <p class="text-[10px] font-bold uppercase tracking-[0.25em] text-blue-400">Administración</p>
      <h1 class="mt-2 text-3xl font-bold text-white">Configuración</h1>
      <p class="mt-2 text-sm text-[#8d90a0]">Controla las integraciones, los enlaces y las reglas de tus campañas sin exponer credenciales.</p>
    </div>

    <div v-if="loading" class="rounded-2xl border border-[#434655] bg-[#1d1f27] p-10 text-center text-sm text-[#8d90a0]">Cargando configuración...</div>
    <div v-else-if="loadError" class="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-sm text-red-200">
      {{ loadError }} <button class="ml-3 font-bold underline" @click="load">Reintentar</button>
    </div>
    <template v-else>
      <div v-if="!overview.backendAutomationReady" class="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 text-sm text-amber-100">
        <p class="font-bold">Envíos programados y enlaces individuales aún no disponibles</p>
        <p class="mt-1 text-xs leading-5 text-amber-200">Configura la clave secreta de Supabase solo en backend/.env y reinicia Docker. Puedes editar la configuración y las plantillas mientras tanto.</p>
      </div>
      <div v-if="overview.publicUrlLocal" class="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 text-sm text-amber-100">
        <p class="font-bold">Enlace disponible solo en esta computadora</p>
        <p class="mt-1 text-xs leading-5 text-amber-200">PUBLIC_BASE_URL apunta a localhost. Puedes programar pruebas por correo, pero sus enlaces de capacitación solo abrirán en esta misma computadora. Los SMS no se pueden programar con este enlace.</p>
      </div>
      <section class="grid gap-5 lg:grid-cols-2">
        <article v-for="provider in providers" :key="provider.key" class="rounded-2xl border border-[#434655] bg-[#1d1f27] p-6 shadow-xl shadow-black/10">
          <div class="flex items-start justify-between gap-4">
            <div class="flex items-center gap-3">
              <span class="flex h-11 w-11 items-center justify-center rounded-xl border border-blue-500/30 bg-blue-500/10 text-blue-400"><i :class="provider.icon"></i></span>
              <div><h2 class="font-bold text-white">{{ provider.title }}</h2><p class="text-xs text-[#8d90a0]">{{ provider.subtitle }}</p></div>
            </div>
            <span class="rounded-full border px-3 py-1 text-[10px] font-bold uppercase" :class="statusClass(provider.state)">{{ provider.state }}</span>
          </div>
          <p class="mt-5 min-h-10 text-xs leading-5 text-[#c3c6d7]">{{ provider.detail }}</p>
          <div v-if="provider.key === 'sms'" class="mt-4">
            <label class="mb-2 block text-[10px] font-bold uppercase tracking-widest text-[#8d90a0]">Empleado para SMS de prueba</label>
            <select v-model="testTargetId" class="w-full rounded-lg border border-[#434655] bg-[#11131b] px-3 py-2 text-sm text-white outline-none focus:border-blue-500">
              <option value="">Selecciona un empleado con teléfono</option>
              <option v-for="target in phoneTargets" :key="target.id" :value="target.id">{{ target.nombre }} · {{ target.telefono }}</option>
            </select>
          </div>
          <div class="mt-5 flex flex-wrap gap-2">
            <button :disabled="busy" class="rounded-lg border border-[#434655] bg-[#32343d] px-4 py-2 text-xs font-bold text-white hover:bg-[#434655] disabled:opacity-50" @click="checkProvider(provider.key)">Comprobar conexión</button>
            <button :disabled="busy || (provider.key === 'sms' && !testTargetId)" class="rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-500 disabled:opacity-50" @click="sendTest(provider.key)">Enviar prueba autorizada</button>
          </div>
        </article>
      </section>

      <section class="rounded-2xl border border-[#434655] bg-[#1d1f27] p-6">
        <div class="flex flex-col justify-between gap-5 md:flex-row md:items-center">
          <div class="min-w-0">
            <p class="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-400">Enlaces de capacitación</p>
            <h2 class="mt-2 text-lg font-bold text-white">{{ overview.publicUrlLocal ? 'Vista previa local' : 'Enlace de acceso' }}</h2>
            <p class="mt-2 break-all font-mono text-xs text-[#c3c6d7]">{{ overview.publicUrl }}</p>
            <p class="mt-2 max-w-3xl text-xs leading-5 text-[#c3c6d7]">{{ overview.publicUrlLocal ? 'Abre la vista previa en esta computadora. El acceso desde otros dispositivos se configurará cuando decidas publicar la plataforma.' : 'Comprueba el enlace desde otro dispositivo antes de enviar una campaña. La vista previa no registra resultados.' }}</p>
          </div>
          <button class="shrink-0 rounded-lg border border-[#434655] bg-[#32343d] px-4 py-2 text-xs font-bold text-white hover:bg-[#434655]" @click="copyDemoLink">Copiar vista previa</button>
        </div>
      </section>

      <section class="grid gap-5 lg:grid-cols-3">
        <form class="rounded-2xl border border-[#434655] bg-[#1d1f27] p-6 lg:col-span-2" @submit.prevent="save">
          <h2 class="text-lg font-bold text-white">Campañas y capacitación</h2>
          <p class="mt-1 text-xs text-[#8d90a0]">Estas reglas se aplican al crear nuevas campañas.</p>
          <div class="mt-6 grid gap-4 sm:grid-cols-2">
            <label class="space-y-2 text-xs text-[#c3c6d7]">Nombre mostrado de la organización<input v-model.trim="settings.nombre_mostrado" maxlength="120" class="field" placeholder="Mi organización"></label>
            <label class="space-y-2 text-xs text-[#c3c6d7]">Zona horaria<input v-model.trim="settings.zona_horaria" list="timezones" required class="field" placeholder="America/Lima"><datalist id="timezones"><option value="America/Lima"/><option value="America/Bogota"/><option value="America/Mexico_City"/><option value="America/Santiago"/><option value="UTC"/></datalist></label>
            <label class="space-y-2 text-xs text-[#c3c6d7]">Enviar desde<input v-model="settings.hora_inicio" type="time" required class="field"></label>
            <label class="space-y-2 text-xs text-[#c3c6d7]">Enviar hasta<input v-model="settings.hora_fin" type="time" required class="field"></label>
            <label class="space-y-2 text-xs text-[#c3c6d7]">Máximo de destinatarios por campaña<input v-model.number="settings.limite_destinatarios" type="number" min="1" max="10000" required class="field"></label>
            <label class="space-y-2 text-xs text-[#c3c6d7]">Puntaje mínimo para aprobar<input v-model.number="settings.nota_minima" type="number" min="0" max="100" required class="field"></label>
          </div>
          <label class="mt-5 flex items-center gap-3 rounded-lg border border-[#434655] bg-[#11131b] p-4 text-xs text-[#c3c6d7]"><input v-model="settings.permitir_borradores_ia" type="checkbox" class="accent-blue-500">Permitir sugerencias de contenido para capacitación; siempre requieren revisión antes de publicarse.</label>
          <div class="mt-6 flex justify-end"><button :disabled="busy" class="rounded-lg bg-blue-600 px-5 py-3 text-xs font-bold uppercase text-white hover:bg-blue-500 disabled:opacity-50">Guardar configuración</button></div>
        </form>
        <div class="space-y-5">
          <article class="rounded-2xl border border-[#434655] bg-[#1d1f27] p-6">
            <h2 class="font-bold text-white">Administradores</h2>
            <p class="mt-1 text-xs text-[#8d90a0]">Acceso a esta organización</p>
            <div v-for="admin in overview.admins" :key="admin.id" class="mt-4 border-t border-[#434655] pt-3 text-xs"><p class="font-semibold text-white">{{ admin.nombre }}</p><p class="text-[#8d90a0]">{{ admin.email }} · {{ admin.rol }}</p></div>
          </article>
          <article class="rounded-2xl border border-[#434655] bg-[#1d1f27] p-6">
            <h2 class="font-bold text-white">Registro de cambios</h2>
            <p v-if="!overview.audit.length" class="mt-3 text-xs text-[#8d90a0]">Aún no hay cambios registrados.</p>
            <div v-for="entry in overview.audit" :key="entry.id" class="mt-4 border-t border-[#434655] pt-3 text-xs"><p class="font-semibold text-white">{{ entry.accion }}</p><p class="mt-1 text-[#8d90a0]">{{ entry.admin_nombre }} · {{ formatDate(entry.creado_en) }}</p></div>
          </article>
        </div>
      </section>
      <p class="text-xs text-[#8d90a0]">Las credenciales permanecen en el servidor; esta pantalla no las muestra ni permite copiarlas.</p>
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { graphqlRequest } from '@/utils/graphqlRequest'
import { showNotice } from '@/composables/useNotification'

const loading = ref(true)
const loadError = ref('')
const busy = ref(false)
const overview = ref(null)
const targets = ref([])
const testTargetId = ref('')
const settings = reactive({ nombre_mostrado: '', zona_horaria: 'America/Lima', hora_inicio: '08:00', hora_fin: '18:00', limite_destinatarios: 100, nota_minima: 67, permitir_borradores_ia: true })
const checks = reactive({ email: null, sms: null })
const phoneTargets = computed(() => targets.value.filter(target => target.telefono))
const providers = computed(() => [
  { key: 'email', title: 'Correo electrónico', subtitle: 'Gmail / SMTP', icon: 'fa-solid fa-envelope', state: checks.email?.state || (overview.value?.emailConfigured ? 'Configurado' : 'Sin configurar'), detail: checks.email?.detail || 'Comprueba la conexión. Una aceptación SMTP no garantiza la entrega final.' },
  { key: 'sms', title: 'SMS', subtitle: 'Twilio', icon: 'fa-solid fa-comment-sms', state: checks.sms?.state || (overview.value?.smsConfigured ? 'Configurado' : 'Sin configurar'), detail: checks.sms?.detail || 'Comprueba si la cuenta permite mensajes personalizados antes de lanzar smishing.' }
])
const statusClass = state => state === 'Conectado' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' : state === 'Cuenta de prueba' || state === 'Configurado' ? 'border-amber-500/30 bg-amber-500/10 text-amber-300' : 'border-red-500/30 bg-red-500/10 text-red-300'
const formatDate = value => value ? new Date(value).toLocaleString('es-PE') : '—'

async function load() {
  loading.value = true; loadError.value = ''
  try {
    const admin = JSON.parse(localStorage.getItem('ciso_user') || '{}')
    const [config, employees] = await Promise.all([
      graphqlRequest(`query { settingsOverview { settings { nombre_mostrado zona_horaria hora_inicio hora_fin limite_destinatarios nota_minima permitir_borradores_ia } publicUrl publicUrlLocal emailConfigured smsConfigured backendAutomationReady admins { id nombre email rol } audit { id accion detalle admin_nombre creado_en } } }`),
      graphqlRequest(`query($org: ID!) { usuarios(organizacionId: $org) { id nombre telefono } }`, { org: admin.id_organizacion })
    ])
    overview.value = config.settingsOverview
    Object.assign(settings, overview.value.settings)
    settings.hora_inicio = settings.hora_inicio.slice(0, 5)
    settings.hora_fin = settings.hora_fin.slice(0, 5)
    targets.value = employees.usuarios
  } catch (error) { loadError.value = error.message } finally { loading.value = false }
}
async function checkProvider(provider) {
  busy.value = true
  try {
    const data = await graphqlRequest(`mutation($provider: String!) { checkDeliveryProvider(provider: $provider) { provider state detail } }`, { provider })
    checks[provider] = data.checkDeliveryProvider
    showNotice({ type: checks[provider].state === 'Conectado' ? 'success' : 'warning', title: providers.value.find(item => item.key === provider)?.title, message: checks[provider].detail })
  } catch (error) { showNotice({ type: 'error', message: error.message }) } finally { busy.value = false }
}
async function sendTest(provider) {
  const target = targets.value.find(item => item.id === testTargetId.value)
  const destination = provider === 'sms' ? `${target?.nombre || ''} (${target?.telefono || ''})` : 'tu correo de administrador'
  const approved = await showNotice({ type: 'warning', title: 'Confirmar envío de prueba', message: `Se enviará un ${provider === 'sms' ? 'SMS' : 'correo'} real a ${destination}. Puede consumir saldo o unidades del proveedor.`, confirmText: 'Enviar prueba', showCancel: true })
  if (!approved) return
  busy.value = true
  try {
    const data = await graphqlRequest(`mutation($provider: String!, $targetId: ID) { sendAuthorizedTest(provider: $provider, targetId: $targetId) { accepted state detail } }`, { provider, targetId: provider === 'sms' ? testTargetId.value : null })
    showNotice({ type: data.sendAuthorizedTest.accepted ? 'success' : 'error', title: data.sendAuthorizedTest.state, message: data.sendAuthorizedTest.detail })
    await load()
  } catch (error) { showNotice({ type: 'error', message: error.message }) } finally { busy.value = false }
}
async function save() {
  busy.value = true
  try {
    await graphqlRequest(`mutation($input: OrganizationSettingsInput!) { saveOrganizationSettings(input: $input) { zona_horaria } }`, { input: { ...settings } })
    await load()
    window.dispatchEvent(new Event('settings-updated'))
    showNotice({ type: 'success', message: 'La configuración se guardó y se aplicará a las nuevas campañas.' })
  } catch (error) { showNotice({ type: 'error', message: error.message }) } finally { busy.value = false }
}
async function copyDemoLink() {
  try { await navigator.clipboard.writeText(`${overview.value.publicUrl}/training/demo`); showNotice({ type: 'info', title: 'Enlace copiado', message: overview.value.publicUrlLocal ? 'Ábrelo en esta computadora. La vista previa no registra resultados.' : 'Compruébalo desde otro dispositivo. La vista previa no registra resultados.' }) }
  catch { showNotice({ type: 'error', message: 'No se pudo copiar el enlace; revisa los permisos del navegador.' }) }
}
onMounted(load)
</script>

<style scoped>
.field { display: block; width: 100%; margin-top: .5rem; border: 1px solid #434655; border-radius: .5rem; background: #11131b; padding: .7rem .8rem; color: white; outline: none; }
.field:focus { border-color: #3b82f6; }
</style>
