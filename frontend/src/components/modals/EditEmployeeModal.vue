<template>
  <div class="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#11131b]/80 backdrop-blur-sm" @click.self="$emit('close')">
    <div class="w-full max-w-xl rounded-xl border border-[#434655] bg-[#282a32] shadow-2xl">
      <div class="flex items-center justify-between border-b border-[#434655] px-8 py-6">
        <div>
          <h2 class="text-xl font-bold text-[#e1e2ed]">Editar empleado</h2>
          <p class="mt-1 text-sm text-[#8d90a0]">Actualiza sus datos y el número usado para campañas de smishing.</p>
        </div>
        <button type="button" class="h-8 w-8 rounded-lg text-[#c3c6d7] hover:bg-[#32343d]" @click="$emit('close')">
          <i class="fas fa-xmark"></i>
        </button>
      </div>

      <form class="grid grid-cols-1 gap-5 px-8 py-7 md:grid-cols-2" @submit.prevent="save">
        <label class="space-y-2">
          <span class="text-xs font-bold uppercase tracking-widest text-[#c3c6d7]">Nombre</span>
          <input v-model.trim="form.nombre" required class="field" type="text" />
        </label>
        <label class="space-y-2">
          <span class="text-xs font-bold uppercase tracking-widest text-[#c3c6d7]">Correo</span>
          <input v-model.trim="form.email" required class="field" type="email" />
        </label>
        <label class="space-y-2 md:col-span-2">
          <span class="text-xs font-bold uppercase tracking-widest text-[#c3c6d7]">Teléfono para smishing</span>
          <input v-model.trim="form.telefono" class="field" type="tel" placeholder="+51999999999" />
          <span class="block text-xs text-[#8d90a0]">Usa código de país. Ejemplo para Perú: +51 seguido del número.</span>
        </label>
        <label class="space-y-2">
          <span class="text-xs font-bold uppercase tracking-widest text-[#c3c6d7]">Departamento</span>
          <input v-model.trim="form.departamento" required class="field" type="text" />
        </label>
        <label class="space-y-2">
          <span class="text-xs font-bold uppercase tracking-widest text-[#c3c6d7]">Cargo</span>
          <input v-model.trim="form.cargo" required class="field" type="text" />
        </label>

        <div class="flex justify-end gap-3 border-t border-[#434655] pt-5 md:col-span-2">
          <button type="button" class="rounded-lg border border-[#434655] px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-[#e1e2ed] hover:bg-[#32343d]" @click="$emit('close')">Cancelar</button>
          <button type="submit" class="rounded-lg bg-blue-600 px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-white hover:bg-blue-500">Guardar cambios</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { showNotice } from '@/composables/useNotification'
import { isValidInternationalPhone, normalizePhone } from '@/utils/phone'

const props = defineProps<{
  employee: {
    id: string
    name: string
    email: string
    phone: string
    department: string
    role: string
  }
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', employee: { nombre: string; email: string; telefono: string; departamento: string; cargo: string }): void
}>()

const form = reactive({
  nombre: props.employee.name,
  email: props.employee.email,
  telefono: props.employee.phone,
  departamento: props.employee.department,
  cargo: props.employee.role,
})

const save = () => {
  if (!isValidInternationalPhone(form.telefono)) {
    showNotice({ type: 'warning', message: 'El teléfono debe usar formato internacional, por ejemplo +51999999999.' })
    return
  }
  emit('save', { ...form, telefono: normalizePhone(form.telefono), email: form.email.toLowerCase() })
}
</script>

<style scoped>
.field {
  width: 100%;
  border: 1px solid #434655;
  border-radius: 0.5rem;
  background: #191b23;
  padding: 0.75rem;
  color: #e1e2ed;
  outline: none;
}
.field:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgb(59 130 246 / 20%);
}
</style>
