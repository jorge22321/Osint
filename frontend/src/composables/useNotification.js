import { reactive } from 'vue'

const defaultTitles = {
  success: 'Operación completada',
  error: 'No se pudo completar',
  warning: 'Revisa la información',
  info: 'Aviso'
}

const state = reactive({
  visible: false,
  type: 'info',
  title: '',
  message: '',
  confirmText: 'Aceptar',
  cancelText: 'Cancelar',
  showCancel: false,
  showInput: false,
  inputValue: '',
  inputPlaceholder: '',
  resolver: null
})

const finishCurrent = (result) => {
  if (state.resolver) state.resolver(result)
  state.resolver = null
  state.visible = false
}

export const showNotice = ({
  type = 'info',
  title,
  message,
  confirmText = 'Aceptar',
  cancelText = 'Cancelar',
  showCancel = false,
  showInput = false,
  inputPlaceholder = '',
  inputValue = ''
}) => {
  if (state.visible) finishCurrent(null)

  Object.assign(state, {
    visible: true,
    type,
    title: title || defaultTitles[type] || defaultTitles.info,
    message,
    confirmText,
    cancelText,
    showCancel,
    showInput,
    inputPlaceholder,
    inputValue
  })

  return new Promise(resolve => {
    state.resolver = resolve
  })
}

export const promptNotice = (message, options = {}) => showNotice({
  type: 'info',
  title: 'Ingresar información',
  confirmText: 'Continuar',
  showCancel: true,
  showInput: true,
  message,
  ...options
})

export const useNotification = () => ({ state, showNotice, promptNotice, finishCurrent })
