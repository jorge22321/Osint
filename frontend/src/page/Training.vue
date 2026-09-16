<template>
  <main class="min-h-screen bg-[#11131b] px-4 py-10 text-[#e1e2ed] sm:px-6">
    <div class="mx-auto max-w-4xl">
      <div class="mb-8 flex items-center gap-3">
        <div class="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-500/30 bg-blue-500/10">
          <i class="fa-solid fa-shield-halved text-blue-400"></i>
        </div>
        <div>
          <p class="text-xs font-bold uppercase tracking-[0.25em] text-blue-400">Plataforma OSINT</p>
          <p class="text-sm text-[#8d90a0]">Centro de concientización</p>
        </div>
      </div>

      <div v-if="isLoading" class="rounded-2xl border border-[#434655] bg-[#1d1f27] p-12 text-center">
        <i class="fa-solid fa-spinner animate-spin text-2xl text-blue-400"></i>
        <p class="mt-4 text-sm text-[#c3c6d7]">Preparando tu capacitación...</p>
      </div>

      <div v-else-if="loadError" class="rounded-2xl border border-red-500/30 bg-red-500/10 p-10 text-center">
        <i class="fa-solid fa-link-slash text-3xl text-red-400"></i>
        <h1 class="mt-4 text-xl font-bold text-white">Enlace no disponible</h1>
        <p class="mt-2 text-sm text-red-200">{{ loadError }}</p>
      </div>

      <template v-else>
        <section class="overflow-hidden rounded-2xl border border-amber-500/30 bg-[#1d1f27] shadow-2xl shadow-black/30">
          <div class="h-1.5 bg-amber-500"></div>
          <div class="p-7 sm:p-10">
            <div class="flex flex-col gap-6 sm:flex-row sm:items-center">
              <div class="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-500/10">
                <i class="fa-solid fa-triangle-exclamation text-4xl text-amber-400"></i>
              </div>
              <div>
                <p class="text-xs font-bold uppercase tracking-[0.2em] text-amber-400">Simulación controlada</p>
                <h1 class="mt-2 text-3xl font-bold text-white">Este enlace era una prueba de {{ channelName }}</h1>
                <p class="mt-3 max-w-2xl text-sm leading-6 text-[#c3c6d7]">
                  No se comprometió tu cuenta ni tu dispositivo. Esta actividad forma parte del programa interno de seguridad y busca ayudarte a reconocer señales de ingeniería social.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section class="mt-6 grid gap-4 md:grid-cols-3">
          <article v-for="signal in warningSignals" :key="signal.title" class="rounded-xl border border-[#434655] bg-[#1d1f27]/80 p-5">
            <i :class="signal.icon" class="text-lg text-blue-400"></i>
            <h2 class="mt-3 text-sm font-bold text-white">{{ signal.title }}</h2>
            <p class="mt-2 text-xs leading-5 text-[#c3c6d7]">{{ signal.description }}</p>
          </article>
        </section>

        <section class="mt-6 rounded-2xl border border-[#434655] bg-[#1d1f27] p-6 sm:p-8">
          <div class="flex items-start justify-between gap-4">
            <div>
              <p class="text-xs font-bold uppercase tracking-[0.2em] text-blue-400">Microlección</p>
              <h2 class="mt-2 text-xl font-bold text-white">Comprueba lo aprendido</h2>
              <p class="mt-2 text-sm text-[#c3c6d7]">Responde las tres preguntas. Necesitas al menos 67 puntos para aprobar.</p>
            </div>
            <span v-if="training.estado === 'Completado'" class="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400">
              Completado: {{ training.puntaje }}%
            </span>
          </div>

          <form class="mt-7 space-y-7" @submit.prevent="submitTraining">
            <fieldset v-for="(question, questionIndex) in questions" :key="question.id">
              <legend class="mb-3 text-sm font-semibold text-white">{{ questionIndex + 1 }}. {{ question.text }}</legend>
              <label v-for="option in question.options" :key="option.value" class="mb-2 flex cursor-pointer items-start gap-3 rounded-lg border border-[#434655] bg-[#11131b] px-4 py-3 text-sm text-[#c3c6d7] transition hover:border-blue-500/60">
                <input v-model="answers[question.id]" type="radio" :name="question.id" :value="option.value" class="mt-0.5 accent-blue-500" />
                <span>{{ option.label }}</span>
              </label>
            </fieldset>

            <button type="submit" :disabled="isSubmitting" class="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold uppercase tracking-wider text-white transition hover:bg-blue-500 disabled:opacity-50 sm:w-auto">
              <i :class="isSubmitting ? 'fa-solid fa-spinner animate-spin' : 'fa-solid fa-graduation-cap'"></i>
              {{ isSubmitting ? 'Guardando...' : 'Finalizar capacitación' }}
            </button>
          </form>
        </section>
      </template>
    </div>
  </main>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import { showNotice } from '@/composables/useNotification'

const route = useRoute()
const isLoading = ref(true)
const isSubmitting = ref(false)
const loadError = ref('')
const training = reactive({ tipo: 'Phishing', estado: 'En Curso', puntaje: null })
const answers = reactive({ q1: '', q2: '', q3: '' })

const channelName = computed(() => training.tipo === 'Smishing' ? 'smishing por SMS' : 'phishing por correo')

const warningSignals = computed(() => training.tipo === 'Smishing' ? [
  { icon: 'fa-solid fa-mobile-screen', title: 'Número inesperado', description: 'Desconfía de remitentes desconocidos o números que intentan parecer oficiales.' },
  { icon: 'fa-solid fa-clock', title: 'Urgencia artificial', description: 'Los atacantes presionan para que actúes antes de verificar el mensaje.' },
  { icon: 'fa-solid fa-link', title: 'Enlace sospechoso', description: 'No abras enlaces acortados o dominios que no reconozcas.' }
] : [
  { icon: 'fa-solid fa-at', title: 'Remitente alterado', description: 'Comprueba el dominio completo y no sólo el nombre visible del remitente.' },
  { icon: 'fa-solid fa-clock', title: 'Urgencia artificial', description: 'Pausar y verificar evita decisiones impulsivas ante una falsa emergencia.' },
  { icon: 'fa-solid fa-link', title: 'Destino diferente', description: 'Revisa la dirección real del enlace antes de abrirlo.' }
])

const questions = [
  {
    id: 'q1',
    text: '¿Qué debes hacer antes de abrir un enlace inesperado?',
    options: [
      { value: 'abrir', label: 'Abrirlo rápidamente para comprobar su contenido.' },
      { value: 'verificar', label: 'Verificar el remitente y el dominio por un canal confiable.' },
      { value: 'reenviar', label: 'Reenviarlo a un compañero para que lo pruebe.' }
    ]
  },
  {
    id: 'q2',
    text: '¿Cuál es una señal frecuente de ingeniería social?',
    options: [
      { value: 'urgencia', label: 'Una solicitud urgente que amenaza con consecuencias inmediatas.' },
      { value: 'firma', label: 'Que el mensaje incluya una firma corporativa.' },
      { value: 'horario', label: 'Que el mensaje llegue durante el horario laboral.' }
    ]
  },
  {
    id: 'q3',
    text: '¿Qué haces si sospechas que un correo o SMS es fraudulento?',
    options: [
      { value: 'responder', label: 'Responder pidiendo más información.' },
      { value: 'borrar', label: 'Borrarlo sin avisar a nadie.' },
      { value: 'reportar', label: 'No interactuar y reportarlo al equipo de seguridad.' }
    ]
  }
]

const loadTraining = async () => {
  try {
    const response = await fetch(`/api/training/${encodeURIComponent(route.params.token)}`)
    const data = await response.json()
    if (!response.ok) throw new Error(data.message)
    Object.assign(training, data)
  } catch (error) {
    loadError.value = error.message || 'No se pudo cargar la capacitación.'
  } finally {
    isLoading.value = false
  }
}

const submitTraining = async () => {
  const respuestas = [answers.q1, answers.q2, answers.q3]
  if (respuestas.some(answer => !answer)) {
    showNotice({ type: 'warning', message: 'Responde todas las preguntas antes de finalizar.' })
    return
  }

  isSubmitting.value = true
  try {
    const response = await fetch(`/api/training/${encodeURIComponent(route.params.token)}/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ respuestas })
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.message)
    Object.assign(training, { estado: data.estado, puntaje: data.puntaje })
    showNotice({
      type: data.aprobado ? 'success' : 'warning',
      title: data.aprobado ? 'Capacitación aprobada' : 'Capacitación completada',
      message: `Tu resultado fue ${data.puntaje} de 100.${data.aprobado ? ' Aplicaste correctamente las prácticas de seguridad.' : ' Repasa las señales de alerta e inténtalo nuevamente.'}`
    })
  } catch (error) {
    showNotice({ type: 'error', message: error.message || 'No se pudo guardar la capacitación.' })
  } finally {
    isSubmitting.value = false
  }
}

onMounted(loadTraining)
</script>
