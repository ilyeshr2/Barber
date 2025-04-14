//src/router/index.js 
import { createRouter, createWebHistory } from 'vue-router'
import AuthService from '@/services/auth.service'

const routes = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/Dashboard.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/barbiers',
    name: 'Barbiers',
    component: () => import('@/views/BarbiersView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/barbiers/:id/services',
    name: 'BarbierServices',
    component: () => {
        try {
          return import('@/views/BarbierServicesView.vue')
        } catch (e) {
          console.warn('BarbierServicesView not found, using fallback')
          return import('@/views/Dashboard.vue')
        }
      },
    meta: { requiresAuth: true }
  },
  {
    path: '/services',
    name: 'Services',
    component: () => import('@/views/ServicesView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/appointments',
    name: 'Appointments',
    component: () => import('@/views/AppointmentsView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/clients',
    name: 'Clients',
    component: () => import('@/views/ClientsView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/salon',
    name: 'SalonSettings',
    component: () => import('@/views/SalonSettings.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/publications',
    name: 'Publications',
    component: () => import('@/views/PublicationsView.vue'),
    meta: { requiresAuth: true }
  },
  // Not Found Page
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard to protect routes
router.beforeEach((to, from, next) => {
    const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
    const isAuthenticated = AuthService.isAuthenticated()
    
    if (requiresAuth && !isAuthenticated) {
      next('/login')
    } else if (to.path === '/login' && isAuthenticated) {
      next('/dashboard')
    } else {
      next()
    }
  })

export default router