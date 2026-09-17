<template>
  <div class="mx-auto max-w-7xl space-y-6 px-5 py-8 text-[#e1e2ed]">
    <div class="flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div><p class="text-[10px] font-bold uppercase tracking-[0.25em] text-blue-400">Campañas</p><h1 class="mt-2 text-3xl font-bold text-white">Historial de envíos</h1><p class="mt-2 text-sm text-[#8d90a0]">Cada intento, la respuesta del proveedor y el avance de capacitación en un solo lugar.</p></div>
      <select v-model="campaignId" class="w-full rounded-lg border border-[#434655] bg-[#1d1f27] px-4 py-3 text-sm text-white outline-none focus:border-blue-500 md:w-80" @change="loadHistory(0)"><option value="">Selecciona una campaña</option><option v-for="campaign in campaigns" :key="campaign.id" :value="campaign.id">{{ campaign.nombre }} · {{ campaign.tipo }}</option></select>
    </div>

    <div class="grid gap-3 sm:grid-cols-3">
      <div v-for="metric in metrics" :key="metric.label" class="rounded-xl border border-[#434655] bg-[#1d1f27] p-5"><p class="text-[10px] font-bold uppercase tracking-widest text-[#8d90a0]">{{ metric.label }}</p><p class="mt-2 text-2xl font-bold text-white">{{ metric.value }}</p></div>
    </div>
    <div v-if="error" class="rounded-xl border border-red-500/30 bg-red-500/10 p-5 text-sm text-red-200">{{ error }}</div>
    <div class="overflow-hidden rounded-2xl border border-[#434655] bg-[#1d1f27] shadow-xl shadow-black/10">
      <div class="flex items-center justify-between border-b border-[#434655] px-5 py-4"><h2 class="font-bold text-white">Destinatarios <span class="text-[#8d90a0]">({{ total }})</span></h2><button :disabled="!campaignId || loading" class="text-xs font-bold text-blue-400 hover:text-blue-300 disabled:opacity-50" @click="loadHistory(offset)">Actualizar</button></div>
      <div v-if="loading" class="p-10 text-center text-sm text-[#8d90a0]">Cargando historial...</div>
      <div v-else-if="!campaignId" class="p-10 text-center text-sm text-[#8d90a0]">Selecciona una campaña para ver sus envíos.</div>
      <div v-else-if="!items.length" class="p-10 text-center text-sm text-[#8d90a0]">Esta campaña todavía no tiene envíos registrados.</div>
      <div v-else class="overflow-x-auto">
        <table class="min-w-full text-left text-xs"><thead class="bg-[#191b22] text-[10px] uppercase tracking-wider text-[#8d90a0]"><tr><th class="px-5 py-4">Empleado</th><th class="px-5 py-4">Intento</th><th class="px-5 py-4">Estado</th><th class="px-5 py-4">Proveedor</th><th class="px-5 py-4">Capacitación</th><th class="px-5 py-4">Detalle</th></tr></thead>
          <tbody><tr v-for="item in items" :key="item.id" class="border-t border-[#343744] hover:bg-[#282a32]/60"><td class="px-5 py-4"><p class="font-semibold text-white">{{ item.empleado }}</p><p class="mt-1 text-[#8d90a0]">{{ item.destino }}</p></td><td class="px-5 py-4 text-[#c3c6d7]"><p>{{ formatDate(item.fecha_envio) }}</p><p class="mt-1 text-[#8d90a0]">{{ item.intentos }} intento(s)</p></td><td class="px-5 py-4"><span class="rounded-full border px-2.5 py-1 font-bold" :class="statusClass(item.estado)">{{ item.estado }}</span></td><td class="px-5 py-4"><p>{{ providerLabel(item) }}</p><p v-if="item.provider_error_code" class="mt-1 text-red-300">Código {{ item.provider_error_code }}</p></td><td class="px-5 py-4"><p>{{ item.capacitacion_estado || 'Pendiente' }}</p><p v-if="item.puntaje != null" class="mt-1 text-blue-400">{{ item.puntaje }} puntos</p></td><td class="px-5 py-4"><button class="font-bold text-blue-400 hover:text-blue-300" @click="selected = item">Ver</button></td></tr></tbody>
        </table>
      </div>
      <div v-if="campaignId && total > 50" class="flex items-center justify-between border-t border-[#434655] px-5 py-4 text-xs text-[#8d90a0]"><span>{{ offset + 1 }}–{{ Math.min(offset + 50, total) }} de {{ total }}</span><div class="flex gap-2"><button :disabled="offset === 0" class="rounded border border-[#434655] px-3 py-2 disabled:opacity-40" @click="loadHistory(Math.max(0, offset - 50))">Anterior</button><button :disabled="offset + 50 >= total" class="rounded border border-[#434655] px-3 py-2 disabled:opacity-40" @click="loadHistory(offset + 50)">Siguiente</button></div></div>
    </div>

    <div v-if="selected" class="fixed inset-0 z-50 flex items-center justify-center bg-[#07080d]/80 px-4 backdrop-blur-sm" role="dialog" aria-modal="true" @mousedown.self="selected = null">
      <div class="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[#434655] bg-[#1d1f27] p-6 shadow-2xl">
        <div class="flex items-start justify-between gap-4"><div><p class="text-[10px] font-bold uppercase tracking-wider text-blue-400">Detalle de envío</p><h3 class="mt-2 text-xl font-bold text-white">{{ selected.empleado }}</h3></div><button aria-label="Cerrar" class="text-[#8d90a0] hover:text-white" @click="selected = null"><i class="fa-solid fa-xmark"></i></button></div>
        <div class="mt-5 grid gap-3 text-xs sm:grid-cols-2"><p><span class="text-[#8d90a0]">Canal:</span> {{ selected.canal }}</p><p><span class="text-[#8d90a0]">Estado:</span> {{ selected.estado }}</p><p><span class="text-[#8d90a0]">Clic:</span> {{ formatDate(selected.fecha_click) }}</p><p><span class="text-[#8d90a0]">Capacitación:</span> {{ selected.capacitacion_estado || 'Pendiente' }}</p></div>
        <div v-if="selected.provider_error_code" class="mt-5 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-xs text-red-200"><p class="font-bold">Error {{ selected.provider_error_code }}</p><p class="mt-1">{{ selected.provider_error_message || 'El proveedor rechazó el envío.' }}</p></div>
        <div class="mt-5"><p class="text-[10px] font-bold uppercase tracking-wider text-[#8d90a0]">Contenido enviado o intentado</p><p v-if="selected.asunto" class="mt-2 text-sm font-bold text-white">{{ selected.asunto }}</p><pre class="mt-3 max-h-64 overflow-auto whitespace-pre-wrap break-words rounded-lg border border-[#434655] bg-[#11131b] p-4 font-sans text-xs leading-5 text-[#c3c6d7]">{{ selected.contenido }}</pre></div>
        <div class="mt-6 border-t border-[#434655] pt-5"><h4 class="text-sm font-bold text-white">Formulario de capacitación</h4><p class="mt-1 text-xs text-[#8d90a0]">{{ selected.capacitacion_estado === 'Completado' ? `Completado el ${formatDate(selected.fecha_completado)} · ${selected.puntaje} puntos` : 'Todavía no hay respuestas del empleado.' }}</p><div v-for="(answer, index) in selected.respuestas" :key="index" class="mt-3 rounded-lg border border-[#434655] bg-[#11131b] p-4 text-xs"><p class="font-semibold text-white">{{ index + 1 }}. {{ answer.pregunta }}</p><p class="mt-2" :class="answer.correcta === false ? 'text-amber-300' : answer.correcta === true ? 'text-emerald-400' : 'text-[#8d90a0]'">{{ answer.respuesta || 'Sin responder' }}<span v-if="answer.correcta !== null"> · {{ answer.correcta ? 'Correcta' : 'Incorrecta' }}</span></p></div></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { graphqlRequest } from '@/utils/graphqlRequest'
const campaigns = ref([])
const campaignId = ref('')
const items = ref([])
const total = ref(0)
const offset = ref(0)
const loading = ref(false)
const error = ref('')
const selected = ref(null)
const metrics = computed(() => [
  { label: 'Destinatarios', value: total.value },
  { label: 'Aceptados o entregados en esta página', value: items.value.filter(item => ['Aceptado', 'Enviado', 'Entregado', 'Abierto', 'Clickeado'].includes(item.estado)).length },
  { label: 'Fallidos en esta página', value: items.value.filter(item => item.estado === 'Fallido').length }
])
const formatDate = value => value ? new Date(value).toLocaleString('es-PE') : '—'
const statusClass = value => value === 'Fallido' ? 'border-red-500/30 bg-red-500/10 text-red-300' : value === 'Entregado' || value === 'Clickeado' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' : 'border-blue-500/30 bg-blue-500/10 text-blue-300'
const providerLabel = item => ({ accepted: 'Aceptado por proveedor', queued: 'En cola del proveedor', sending: 'Enviando', sent: 'Enviado al operador', delivered: 'Entregado', failed: 'Fallido', undelivered: 'No entregado' }[item.provider_status] || item.provider_status || 'Sin confirmación')
async function loadHistory(newOffset = 0) {
  if (!campaignId.value) { items.value = []; total.value = 0; return }
  loading.value = true; error.value = ''; offset.value = newOffset
  try {
    const data = await graphqlRequest(`query($id: ID!, $limit: Int!, $offset: Int!) { campaignHistory(campaignId: $id, limit: $limit, offset: $offset) { total items { id empleado destino canal estado fecha_envio fecha_click provider_status provider_error_code provider_error_message intentos asunto contenido capacitacion_estado puntaje fecha_completado respuestas { pregunta respuesta correcta } } } }`, { id: campaignId.value, limit: 50, offset: newOffset })
    items.value = data.campaignHistory.items; total.value = data.campaignHistory.total
  } catch (cause) { error.value = cause.message } finally { loading.value = false }
}
onMounted(async () => {
  try {
    const admin = JSON.parse(localStorage.getItem('ciso_user') || '{}')
    const data = await graphqlRequest(`query($org: ID!) { campaigns(organizacionId: $org) { id nombre tipo } }`, { org: admin.id_organizacion })
    campaigns.value = data.campaigns
    const requested = new URLSearchParams(location.search).get('campaign')
    campaignId.value = campaigns.value.find(item => item.id === requested)?.id || campaigns.value[0]?.id || ''
    if (campaignId.value) await loadHistory()
  } catch (cause) { error.value = cause.message }
})
</script>
