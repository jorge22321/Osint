<template>
  <aside class="fixed left-0 top-0 h-screen w-56 border-r border-[#434655] bg-[#1d1f27] z-50 flex flex-col font-sans">
    <div class="px-5 py-6">
      <h1 class="text-xl font-bold text-blue-500">CISO Analytics</h1>
      <p class="text-xs text-[#c3c6d7] opacity-70 mt-1">Consola de Admin</p>
    </div>

    <nav class="flex-1 px-3 space-y-1 overflow-y-auto custom-scrollbar">
      
      <router-link 
        to="/app/dashboard" 
        class="flex items-center gap-3 px-3 py-2 text-[#c3c6d7] hover:text-[#e1e2ed] hover:bg-[#32343d] rounded-lg active:scale-95 transition-all"
        active-class="!bg-[#3f465c] !text-[#adb4ce]"
      >
        <i class="fa-solid fa-chart-pie w-5 text-center"></i>
        <span class="text-sm font-medium">Panel Principal</span>
      </router-link>
      
      <router-link 
        to="/app/campaigns" 
        class="flex items-center gap-3 px-3 py-2 text-[#c3c6d7] hover:text-[#e1e2ed] hover:bg-[#32343d] rounded-lg active:scale-95 transition-all"
        active-class="!bg-[#3f465c] !text-[#adb4ce]"
      >
        <i class="fa-solid fa-bullhorn w-5 text-center"></i>
        <span class="text-sm font-medium">Campañas</span>
      </router-link>
      
      <router-link 
        to="/app/employees" 
        class="flex items-center gap-3 px-3 py-2 text-[#c3c6d7] hover:text-[#e1e2ed] hover:bg-[#32343d] rounded-lg active:scale-95 transition-all"
        active-class="!bg-[#3f465c] !text-[#adb4ce]"
      >
        <i class="fa-solid fa-users w-5 text-center"></i>
        <span class="text-sm font-medium">Empleados</span>
      </router-link>
      
      <router-link 
        to="/app/osint-logs" 
        class="flex items-center gap-3 px-3 py-2 text-[#c3c6d7] hover:text-[#e1e2ed] hover:bg-[#32343d] rounded-lg active:scale-95 transition-all"
        active-class="!bg-[#3f465c] !text-[#adb4ce]"
      >
        <i class="fa-solid fa-shield-halved w-5 text-center"></i>
        <span class="text-sm font-medium">Logs OSINT</span>
      </router-link>
      
      <a href="#" class="flex items-center gap-3 px-3 py-2 text-[#c3c6d7] hover:text-[#e1e2ed] hover:bg-[#32343d] transition-colors rounded-lg active:scale-95">
        <i class="fa-solid fa-gear w-5 text-center"></i>
        <span class="text-sm font-medium">Configuración</span>
      </a>
    </nav>

    <div class="p-4 border-t border-[#434655] flex items-center justify-between bg-[#191b22]">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-full bg-[#32343d] flex items-center justify-center overflow-hidden border border-[#434655]">
          <i class="fa-solid fa-user text-xs text-[#c3c6d7]"></i>
        </div>
        <div>
          <p class="text-[11px] font-bold text-[#e1e2ed] uppercase truncate w-24" :title="adminName">{{ adminName }}</p>
          <p class="text-[9px] text-[#c3c6d7] uppercase tracking-widest">{{ adminRole }}</p>
        </div>
      </div>
      
      <button 
        @click="handleLogout" 
        class="w-8 h-8 flex items-center justify-center rounded-lg text-[#c3c6d7] hover:text-red-400 hover:bg-red-500/10 transition-colors"
        title="Cerrar Sesión"
      >
        <i class="fa-solid fa-right-from-bracket"></i>
      </button>
    </div>
  </aside>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Variables reactivas para mostrar la info del usuario
const adminName = ref('Cargando...')
const adminRole = ref('...')

// Al montar el componente, leemos los datos del LocalStorage
onMounted(() => {
  try {
    const userData = JSON.parse(localStorage.getItem('ciso_user'))
    if (userData) {
      adminName.value = userData.nombre || 'Admin'
      adminRole.value = userData.rol || 'Analista'
    }
  } catch (error) {
    console.error("Error leyendo datos del usuario", error)
  }
})

// Función para cerrar sesión de forma segura
const handleLogout = () => {
  // 1. Limpiamos las credenciales almacenadas
  localStorage.removeItem('ciso_token')
  localStorage.removeItem('ciso_user')
  
  // 2. Redirigimos al Login (el guardián de rutas validará que ya no hay token)
  router.push({ name: 'Login' })
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: #1d1f27;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #434655;
  border-radius: 2px;
}
</style>