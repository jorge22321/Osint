//frontend/src/page/Login.vue 
<template>
  <div class="min-h-screen flex flex-col md:flex-row bg-[#11131b] text-[#e1e2ed] selection:bg-blue-500/30 selection:text-blue-400 overflow-hidden font-sans">
    
    <section 
      class="relative w-full md:w-1/2 flex items-center justify-center bg-[#191b23] p-6 md:p-10 overflow-hidden"
      @mousemove="handleMouseMove"
    >
      <div class="absolute inset-0 cyber-grid opacity-40"></div>
      <div class="absolute inset-0 bg-gradient-to-tr from-[#0c0e16]/80 via-transparent to-blue-500/5"></div>
      
      <div 
        class="pointer-events-none absolute w-[300px] h-[300px] bg-blue-500/10 blur-[100px] rounded-full transition-transform duration-300 ease-out"
        :style="{ transform: `translate(${glowX}px, ${glowY}px)` }"
      ></div>

      <div class="relative z-10 max-w-md">
        <div class="flex items-center gap-3 mb-8">
          <div class="p-2 bg-blue-600 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.3)] w-12 h-12">
            <i class="fa-solid fa-shield-halved text-white text-2xl"></i>
          </div>
          <h1 class="text-2xl font-semibold text-white tracking-tight">CISO Analytics</h1>
        </div>
        
        <h2 class="text-3xl md:text-4xl font-bold text-white mb-6 leading-tight">
          Asegura tu <span class="text-blue-400">perímetro</span> digital.
        </h2>
        
        <p class="text-sm md:text-base text-[#c3c6d7] max-w-sm mb-12">
          Plataforma de inteligencia de amenazas de grado empresarial y simulación de phishing diseñada para el SOC moderno.
        </p>
        
        <div class="grid grid-cols-2 gap-4 opacity-60">
          <div class="flex items-center gap-2">
            <i class="fa-solid fa-circle-check text-blue-400"></i>
            <span class="text-[10px] uppercase tracking-widest font-bold">OSINT en tiempo real</span>
          </div>
          <div class="flex items-center gap-2">
            <i class="fa-solid fa-circle-check text-blue-400"></i>
            <span class="text-[10px] uppercase tracking-widest font-bold">Simulaciones con IA</span>
          </div>
        </div>
      </div>
    </section>

    <section class="w-full md:w-1/2 flex items-center justify-center bg-white text-slate-900 p-6 md:p-10">
      <div class="w-full max-w-[340px] flex flex-col space-y-6 animate-in fade-in slide-in-from-right-4 duration-700">
        
        <div class="space-y-1">
          <h3 class="text-xl font-semibold text-slate-900">Bienvenido de nuevo</h3>
          <p class="text-sm text-slate-500">Accede a tu panel de seguridad</p>
        </div>

        <form class="space-y-4" @submit.prevent="handleLogin">
          <div class="space-y-1 group">
            <label class="text-[11px] text-slate-700 uppercase tracking-wider font-bold" for="email">Correo Laboral</label>
            <div class="relative group-focus-within:scale-[1.01] transition-transform">
              <i class="fa-solid fa-envelope absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors"></i>
              <input 
                v-model="form.email"
                class="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all text-sm text-slate-900 placeholder:text-slate-400" 
                id="email" 
                placeholder="nombre@empresa.com" 
                type="email"
                required
              />
            </div>
          </div>

          <div class="space-y-1 group">
            <div class="flex justify-between items-center">
              <label class="text-[11px] text-slate-700 uppercase tracking-wider font-bold" for="password">Contraseña</label>
              <a class="text-xs text-blue-600 hover:underline font-semibold" href="#">¿Olvidaste tu contraseña?</a>
            </div>
            <div class="relative group-focus-within:scale-[1.01] transition-transform">
              <i class="fa-solid fa-lock absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors"></i>
              <input 
                v-model="form.password"
                class="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all text-sm text-slate-900 placeholder:text-slate-400" 
                id="password" 
                placeholder="••••••••" 
                type="password"
                required
              />
            </div>
          </div>


          <div 
            v-if="errorMessage" 
            class="p-3 mb-2 text-sm text-red-400 bg-red-950/50 border border-red-900/50 rounded-md animate-in fade-in"
          >
            <i class="fa-solid fa-triangle-exclamation mr-2"></i>
            {{ errorMessage }}
          </div>
          <button type="submit" class="w-full mt-2 py-2.5 px-4 bg-blue-600 text-white text-sm font-semibold rounded-md hover:bg-blue-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-md shadow-blue-600/20">
            Iniciar Sesión
            <i class="fa-solid fa-arrow-right"></i>
          </button>
        </form>

    

      
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
// Estado del formulario
const form = reactive({
  email: '',
  password: ''
})

// Estados para feedback visual de la interfaz
const loading = ref(false)
const errorMessage = ref('')

// Efecto visual del destello (Glow)
const glowX = ref(0)
const glowY = ref(0)

const handleMouseMove = (event) => {
  const rect = event.currentTarget.getBoundingClientRect()
  glowX.value = event.clientX - rect.left - 150
  glowY.value = event.clientY - rect.top - 150
}

// Conexión real con el Backend Hexagonal
const handleLogin = async () => {
  loading.value = true
  errorMessage.value = ''

  // Estructura exacta de la Mutation que espera nuestro Apollo Server
  const queryGraphQL = {
    query: `
      mutation LoginAdmin($email: String!, $contrasena: String!) {
        loginAdmin(email: $email, contrasena: $contrasena) {
          token
          admin {
            id
            id_organizacion
            nombre
            email
            rol
          }
        }
      }
    `,
    variables: {
      email: form.email,
      contrasena: form.password
    }
  }

  try {
    const response = await fetch('http://localhost:4000/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(queryGraphQL)
    })

    const resultado = await response.json()

    // Manejo de errores devueltos por GraphQL/Supabase
    if (resultado.errors && resultado.errors.length > 0) {
      errorMessage.value = resultado.errors[0].message
    } else {
      const authData = resultado.data.loginAdmin
      
      console.log('¡Login Exitoso! ')
      console.log('Token JWT:', authData.token)
      console.log('Datos del Admin:', authData.admin)

      // 1. Guardamos el token de sesión de Supabase de forma segura
      localStorage.setItem('ciso_token', authData.token)
      localStorage.setItem('ciso_user', JSON.stringify(authData.admin))

      router.push('/app/dashboard')
      alert(`Bienvenido de nuevo, ${authData.admin.nombre}`)
    }

  } catch (error) {
    console.error('Error de red:', error)
    errorMessage.value = 'No se pudo establecer conexión con el servidor de seguridad.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.cyber-grid {
  background-image: 
    linear-gradient(to right, rgba(67, 70, 85, 0.1) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(67, 70, 85, 0.1) 1px, transparent 1px);
  background-size: 30px 30px; 
}
/* Ya no necesitamos el CSS de Material Symbols aquí */
</style>