<template>
  <Teleport to="body">
    <Transition name="notice">
      <div
        v-if="state.visible"
        class="fixed inset-0 z-[9999] flex items-center justify-center bg-[#07080d]/80 px-4 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="titleId"
        @mousedown.self="cancel"
      >
        <div class="w-full max-w-md overflow-hidden rounded-2xl border border-[#434655] bg-[#1d1f27] shadow-2xl shadow-black/60">
          <div class="h-1 w-full" :class="accentClass"></div>

          <div class="p-6">
            <div class="flex items-start gap-4">
              <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border" :class="iconContainerClass">
                <i :class="iconClass"></i>
              </div>

              <div class="min-w-0 flex-1">
                <h3 :id="titleId" class="text-base font-semibold text-white">{{ state.title }}</h3>
                <p class="mt-2 whitespace-pre-line text-sm leading-6 text-[#c3c6d7]">{{ state.message }}</p>
              </div>

              <button type="button" class="text-[#8d90a0] transition hover:text-white" aria-label="Cerrar" @click="cancel">
                <i class="fa-solid fa-xmark"></i>
              </button>
            </div>

            <input
              v-if="state.showInput"
              ref="inputElement"
              v-model.trim="state.inputValue"
              class="mt-5 w-full rounded-lg border border-[#434655] bg-[#11131b] px-4 py-3 font-mono text-sm text-white outline-none transition placeholder:text-[#8d90a0] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              :placeholder="state.inputPlaceholder"
              @keyup.enter="confirm"
            />

            <div class="mt-6 flex justify-end gap-3">
              <button
                v-if="state.showCancel"
                type="button"
                class="rounded-lg border border-[#434655] bg-[#32343d] px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#e1e2ed] transition hover:bg-[#434655]"
                @click="cancel"
              >
                {{ state.cancelText }}
              </button>
              <button
                type="button"
                class="rounded-lg px-5 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-lg transition hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                :class="buttonClass"
                :disabled="state.showInput && !state.inputValue"
                @click="confirm"
              >
                {{ state.confirmText }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useNotification } from '@/composables/useNotification'

const { state, finishCurrent } = useNotification()
const inputElement = ref(null)
const titleId = 'global-notification-title'

const styles = {
  success: {
    accent: 'bg-emerald-500',
    container: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
    icon: 'fa-solid fa-circle-check text-xl',
    button: 'bg-emerald-600 shadow-emerald-500/20'
  },
  error: {
    accent: 'bg-red-500',
    container: 'border-red-500/30 bg-red-500/10 text-red-400',
    icon: 'fa-solid fa-triangle-exclamation text-xl',
    button: 'bg-red-600 shadow-red-500/20'
  },
  warning: {
    accent: 'bg-amber-500',
    container: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
    icon: 'fa-solid fa-circle-exclamation text-xl',
    button: 'bg-amber-600 shadow-amber-500/20'
  },
  info: {
    accent: 'bg-blue-500',
    container: 'border-blue-500/30 bg-blue-500/10 text-blue-400',
    icon: 'fa-solid fa-circle-info text-xl',
    button: 'bg-blue-600 shadow-blue-500/20'
  }
}

const currentStyle = computed(() => styles[state.type] || styles.info)
const accentClass = computed(() => currentStyle.value.accent)
const iconContainerClass = computed(() => currentStyle.value.container)
const iconClass = computed(() => currentStyle.value.icon)
const buttonClass = computed(() => currentStyle.value.button)

const confirm = () => finishCurrent(state.showInput ? state.inputValue : true)
const cancel = () => finishCurrent(null)
const onKeydown = event => {
  if (event.key === 'Escape' && state.visible) cancel()
}

watch(() => state.visible, async visible => {
  if (visible && state.showInput) {
    await nextTick()
    inputElement.value?.focus()
  }
})

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))
</script>

<style scoped>
.notice-enter-active,
.notice-leave-active {
  transition: opacity 180ms ease;
}
.notice-enter-active > div,
.notice-leave-active > div {
  transition: transform 180ms ease, opacity 180ms ease;
}
.notice-enter-from,
.notice-leave-to {
  opacity: 0;
}
.notice-enter-from > div,
.notice-leave-to > div {
  opacity: 0;
  transform: translateY(12px) scale(0.98);
}
</style>
