// frontend/src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import Login from '../page/Login.vue'
import DashboardLayout from '../layout/DashboardLayout.vue'
import Dashboard from '../page/Dashboard.vue' 
import Campaigns from '../page/Campaigns.vue'
import Employees from '../page/Employees.vue'
import OsintLogs from '../page/OsintLogs.vue'
import Training from '../page/Training.vue'
import Settings from '../page/Settings.vue'
import SendHistory from '../page/SendHistory.vue'
import TrainingLibrary from '../page/TrainingLibrary.vue'

const routes = [
  {
    path: '/',
    name: 'Login',
    component: Login
  },
  {
    path: '/training/:token',
    name: 'Training',
    component: Training
  },
  {
    path: '/app',
    component: DashboardLayout,
    // Agregamos esto para marcar que todas las rutas hijas requieren login
    meta: { requiresAuth: true }, 
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: Dashboard
      },
      {
        path: 'campaigns', 
        name: 'Campaigns',
        component: Campaigns
      },
      {
        path: 'employees',
        name: 'Employees',
        component: Employees
      },
      {
        path: 'osint-logs',
        name: 'OsintLogs',
        component: OsintLogs
      },
      { path: 'send-history', name: 'SendHistory', component: SendHistory },
      { path: 'training-library', name: 'TrainingLibrary', component: TrainingLibrary },
      { path: 'settings', name: 'Settings', component: Settings }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// === GUARDIÁN DE RUTAS (SEGURIDAD JWT) ===
router.beforeEach((to, from, next) => {
  // Verificamos si existe el token guardado en el localStorage
  const isAuthenticated = !!localStorage.getItem('ciso_token')

  if (to.meta.requiresAuth && !isAuthenticated) {
    // Si intenta ir a /app/* y NO tiene token, lo pateamos al Login
    next({ name: 'Login' })
  } else if (to.name === 'Login' && isAuthenticated) {
    // Si intenta ir al Login pero YA está logueado, lo mandamos al Dashboard
    next({ name: 'Dashboard' })
  } else {
    // Si todo está correcto, lo dejamos pasar
    next()
  }
})

export default router
