<!--src/components/common/Navbar.vue -->
<template>
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
      <div class="container-fluid">
        <a class="navbar-brand" href="#">
          <img v-if="salonInfo && salonInfo.logo_url" 
               :src="formatImageUrl(salonInfo.logo_url)" 
               alt="Salon Logo" 
               height="30" 
               class="d-inline-block align-top">
          <img v-else
               src="@/assets/logo.png" 
               alt="Default Logo" 
               height="30" 
               class="d-inline-block align-top">
          {{ salonInfo ? salonInfo.name : 'Admin Dashboard' }}
        </a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav ms-auto">
            <li class="nav-item">
              <span class="nav-link">{{ user.prenom }} {{ user.nom }}</span>
            </li>
            <li class="nav-item">
              <button class="btn btn-outline-light ms-2" @click="logout">Logout</button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  </template>
  
  <script>
  import { computed, onMounted } from 'vue'
  import { useStore } from 'vuex'
  import { useRouter } from 'vue-router'
  import { formatImageUrl } from '@/utils/imageHelpers'
  
  export default {
    name: 'Navbar',
    setup() {
      const store = useStore()
      const router = useRouter()
      
      const user = computed(() => store.getters['auth/user'])
      const salonInfo = computed(() => store.getters['salon/salonInfo'])
      
      onMounted(async () => {
        // Fetch salon info if not already loaded
        if (!salonInfo.value) {
          try {
            await store.dispatch('salon/fetchSalonInfo')
          } catch (error) {
            console.error('Error loading salon info:', error)
          }
        }
      })
      
      const logout = () => {
        store.dispatch('auth/logout')
        router.push('/login')
      }
      
      return {
        user,
        salonInfo,
        formatImageUrl,
        logout
      }
    }
  }
  </script>