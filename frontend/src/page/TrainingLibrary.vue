<template>
  <div class="mx-auto max-w-7xl space-y-6 px-5 py-8 text-[#e1e2ed]">
    <div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p class="text-[10px] font-bold uppercase tracking-[0.25em] text-blue-400">Centro de concientización</p><h1 class="mt-2 text-3xl font-bold text-white">Plantillas de capacitación</h1><p class="mt-2 text-sm text-[#8d90a0]">Crea lecciones, revisa sugerencias de contenido y publícalas cuando estén listas.</p></div><button class="rounded-lg bg-blue-600 px-5 py-3 text-xs font-bold uppercase text-white hover:bg-blue-500" @click="newTemplate">Nueva plantilla</button></div>
    <div v-if="error" class="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">{{ error }}</div>
    <div class="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
      <aside class="rounded-2xl border border-[#434655] bg-[#1d1f27] p-5"><div class="flex items-center justify-between"><h2 class="font-bold text-white">Biblioteca</h2><span class="text-xs text-[#8d90a0]">{{ templates.length }}</span></div><p v-if="loading" class="mt-5 text-xs text-[#8d90a0]">Cargando...</p><p v-else-if="!templates.length" class="mt-5 text-xs leading-5 text-[#8d90a0]">Todavía no hay plantillas. Crea una desde el contenido base.</p><button v-for="item in templates" :key="item.id" class="mt-3 w-full rounded-xl border p-4 text-left transition hover:border-blue-500" :class="selectedId === item.id ? 'border-blue-500 bg-blue-500/10' : 'border-[#434655] bg-[#11131b]'" @click="openTemplate(item)"><p class="text-sm font-bold text-white">{{ item.titulo }}</p><p class="mt-2 text-[10px] text-[#8d90a0]">{{ item.canal }} · {{ item.estado }} · v{{ item.version }}</p><p class="mt-1 text-[10px] text-[#8d90a0]">{{ item.origen === 'IA' ? 'Contenido sugerido' : 'Manual' }}</p></button></aside>
      <div v-if="content" class="space-y-5">
        <section class="rounded-2xl border border-[#434655] bg-[#1d1f27] p-6"><div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-start"><div><p class="text-[10px] font-bold uppercase tracking-wider text-blue-400">Editor · {{ selectedId ? `versión ${version}` : 'nueva' }}</p><h2 class="mt-2 text-xl font-bold text-white">{{ selectedId ? 'Editar plantilla' : 'Crear plantilla' }}</h2><p class="mt-1 text-xs text-[#8d90a0]">Las campañas ya lanzadas conservan su propia copia, aunque cambies esta plantilla.</p></div><span class="rounded-full border px-3 py-1 text-[10px] font-bold" :class="state === 'Publicada' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' : 'border-amber-500/30 bg-amber-500/10 text-amber-300'">{{ state }}</span></div><div class="mt-6 grid gap-4 sm:grid-cols-2"><label class="text-xs text-[#c3c6d7]">Nombre interno<input v-model.trim="title" maxlength="150" class="field" placeholder="Ej. Enlaces urgentes de finanzas"></label><label class="text-xs text-[#c3c6d7]">Canal<select v-model="channel" :disabled="!!selectedId" class="field disabled:opacity-60" @change="channelChanged"><option>Phishing</option><option>Smishing</option></select></label></div></section>
        <section class="rounded-2xl border border-[#434655] bg-[#1d1f27] p-6"><div class="flex items-center gap-3"><i class="fa-solid fa-wand-magic-sparkles text-blue-400"></i><div><h3 class="font-bold text-white">Asistente de contenido</h3><p class="text-xs text-[#8d90a0]">Genera una sugerencia a partir de un tema general. No incluyas nombres, correos o teléfonos.</p></div></div><div class="mt-4 flex flex-col gap-3 sm:flex-row"><input v-model.trim="aiTopic" maxlength="120" class="field !mt-0 flex-1" placeholder="Ej. urgencia falsa en una entrega de paquetería"><button :disabled="busy || !aiTopic" class="rounded-lg border border-blue-500/50 bg-blue-500/10 px-5 py-2 text-xs font-bold text-blue-300 hover:bg-blue-500/20 disabled:opacity-40" @click="generateDraft">{{ busy ? 'Generando...' : 'Sugerir borrador' }}</button></div></section>
        <section class="rounded-2xl border border-[#434655] bg-[#1d1f27] p-6"><h3 class="font-bold text-white">Microlección</h3><div class="mt-5 space-y-4"><label class="block text-xs text-[#c3c6d7]">Título que verá el empleado<input v-model.trim="content.title" maxlength="150" class="field"></label><label class="block text-xs text-[#c3c6d7]">Explicación<textarea v-model.trim="content.introduction" rows="4" maxlength="2000" class="field resize-y"></textarea></label><label class="block text-xs text-[#c3c6d7]">Puntaje mínimo para aprobar<input v-model.number="content.passScore" type="number" min="0" max="100" class="field max-w-32"></label></div><div class="mt-6 flex items-center justify-between"><h4 class="text-xs font-bold uppercase tracking-wider text-[#8d90a0]">Señales de alerta</h4><button :disabled="content.signals.length >= 5" class="text-xs font-bold text-blue-400 disabled:opacity-40" @click="content.signals.push({ title: '', description: '' })">+ Añadir</button></div><div v-for="(signal, index) in content.signals" :key="index" class="mt-3 grid gap-2 rounded-lg border border-[#434655] bg-[#11131b] p-4 sm:grid-cols-[1fr_2fr_auto]"><input v-model.trim="signal.title" maxlength="100" class="field !mt-0" placeholder="Señal"><input v-model.trim="signal.description" maxlength="500" class="field !mt-0" placeholder="Explicación"><button :disabled="content.signals.length <= 1" aria-label="Quitar señal" class="text-red-400 disabled:opacity-30" @click="content.signals.splice(index, 1)"><i class="fa-solid fa-trash"></i></button></div></section>
        <section class="rounded-2xl border border-[#434655] bg-[#1d1f27] p-6"><div class="flex items-center justify-between"><div><h3 class="font-bold text-white">Cuestionario</h3><p class="mt-1 text-xs text-[#8d90a0]">Marca una respuesta correcta por pregunta. Revisa todo el contenido antes de publicarlo.</p></div><button :disabled="content.questions.length >= 5" class="text-xs font-bold text-blue-400 disabled:opacity-40" @click="addQuestion">+ Pregunta</button></div><div v-for="(question, qIndex) in content.questions" :key="question.id" class="mt-5 rounded-xl border border-[#434655] bg-[#11131b] p-5"><div class="flex items-start gap-3"><span class="mt-3 text-xs font-bold text-blue-400">{{ qIndex + 1 }}.</span><input v-model.trim="question.text" maxlength="500" class="field !mt-0 flex-1" placeholder="Escribe la pregunta"><button :disabled="content.questions.length <= 3" aria-label="Quitar pregunta" class="mt-3 text-red-400 disabled:opacity-30" @click="content.questions.splice(qIndex, 1)"><i class="fa-solid fa-trash"></i></button></div><div v-for="option in question.options" :key="option.value" class="mt-3 flex items-center gap-3"><input v-model="question.correctValue" type="radio" :name="question.id" :value="option.value" class="accent-blue-500" :aria-label="`Respuesta correcta: ${option.label}`"><input v-model.trim="option.label" maxlength="240" class="field !mt-0 flex-1" placeholder="Opción de respuesta"></div><p class="mt-3 text-[10px] text-[#8d90a0]">Selecciona el círculo junto a la respuesta correcta.</p></div></section>
        <div class="flex flex-wrap justify-end gap-3"><button :disabled="busy" class="rounded-lg border border-[#434655] bg-[#32343d] px-5 py-3 text-xs font-bold uppercase text-white hover:bg-[#434655] disabled:opacity-50" @click="save('Borrador')">Guardar borrador</button><button :disabled="busy" class="rounded-lg bg-blue-600 px-5 py-3 text-xs font-bold uppercase text-white hover:bg-blue-500 disabled:opacity-50" @click="publish">Publicar plantilla</button></div>
      </div>
      <div v-else class="flex min-h-80 items-center justify-center rounded-2xl border border-[#434655] bg-[#1d1f27] p-10 text-center text-sm text-[#8d90a0]">Selecciona una plantilla o crea una nueva.</div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { graphqlRequest } from '@/utils/graphqlRequest'
import { showNotice } from '@/composables/useNotification'
const templates = ref([])
const loading = ref(false)
const busy = ref(false)
const error = ref('')
const selectedId = ref(null)
const version = ref(1)
const title = ref('')
const channel = ref('Phishing')
const state = ref('Borrador')
const origin = ref('Manual')
const content = ref(null)
const aiTopic = ref('')
async function loadTemplates() {
  loading.value = true; error.value = ''
  try { templates.value = (await graphqlRequest(`query { trainingTemplates { id titulo canal contenidoJson origen estado version creado_en actualizado_en } }`)).trainingTemplates }
  catch (cause) { error.value = cause.message } finally { loading.value = false }
}
async function newTemplate() {
  try {
    const data = await graphqlRequest(`query($canal: String!) { defaultTrainingContent(canal: $canal) }`, { canal: channel.value })
    content.value = JSON.parse(data.defaultTrainingContent); title.value = ''; selectedId.value = null; state.value = 'Borrador'; origin.value = 'Manual'; version.value = 1
  } catch (cause) { showNotice({ type: 'error', message: cause.message }) }
}
function openTemplate(item) {
  selectedId.value = item.id; title.value = item.titulo; channel.value = item.canal; state.value = item.estado; origin.value = item.origen; version.value = item.version; content.value = JSON.parse(item.contenidoJson)
}
async function channelChanged() { if (!selectedId.value) await newTemplate() }
function addQuestion() {
  const id = `q${Date.now()}`
  content.value.questions.push({ id, text: '', options: [{ value: 'a', label: '' }, { value: 'b', label: '' }, { value: 'c', label: '' }], correctValue: 'a' })
}
async function generateDraft() {
  busy.value = true
  try {
    const data = await graphqlRequest(`mutation($canal: String!, $tema: String!) { generateTrainingDraft(canal: $canal, tema: $tema) }`, { canal: channel.value, tema: aiTopic.value })
    content.value = JSON.parse(data.generateTrainingDraft); origin.value = 'IA'; state.value = 'Borrador'; title.value = content.value.title
    showNotice({ type: 'info', title: 'Borrador preparado', message: 'Revisa la explicación, todas las preguntas y sus respuestas correctas antes de publicarlo.' })
  } catch (cause) { showNotice({ type: 'error', message: cause.message }) } finally { busy.value = false }
}
async function save(newState) {
  if (!content.value || !title.value.trim()) { showNotice({ type: 'warning', message: 'Escribe el nombre interno y completa la lección.' }); return }
  busy.value = true
  try {
    const input = { ...(selectedId.value ? { id: selectedId.value } : {}), titulo: title.value, canal: channel.value, contenidoJson: JSON.stringify(content.value), estado: newState, origen: origin.value }
    const data = await graphqlRequest(`mutation($input: TrainingTemplateInput!) { saveTrainingTemplate(input: $input) { id titulo canal contenidoJson origen estado version creado_en actualizado_en } }`, { input })
    selectedId.value = data.saveTrainingTemplate.id; version.value = data.saveTrainingTemplate.version; state.value = data.saveTrainingTemplate.estado
    await loadTemplates()
    showNotice({ type: 'success', message: newState === 'Publicada' ? 'Plantilla publicada. Ya puedes seleccionarla en una campaña.' : 'Borrador guardado.' })
  } catch (cause) { showNotice({ type: 'error', message: cause.message }) } finally { busy.value = false }
}
async function publish() {
  const approved = await showNotice({ type: 'warning', title: 'Publicar capacitación', message: 'Confirma que revisaste la lección y cada respuesta correcta. Las campañas nuevas podrán usar esta versión.', confirmText: 'Publicar', showCancel: true })
  if (approved) await save('Publicada')
}
onMounted(loadTemplates)
</script>
<style scoped>
.field { display: block; width: 100%; margin-top: .5rem; border: 1px solid #434655; border-radius: .5rem; background: #11131b; padding: .7rem .8rem; color: white; outline: none; }
.field:focus { border-color: #3b82f6; }
</style>
