<!--src/components/common/Navbar.vue -->
<template>
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
      <div class="container-fluid">
        <a class="navbar-brand" href="#">
          <img src="@/assets/logo.png" alt="Yaniso Studio Logo" height="30" class="d-inline-block align-top">
          Yaniso Studio Admin
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
  import { computed } from 'vue'
  import { useStore } from 'vuex'
  import { useRouter } from 'vue-router'
  
  export default {
    name: 'Navbar',
    setup() {
      const store = useStore()
      const router = useRouter()
      
      const user = computed(() => store.getters['auth/user'])
      
      const logout = () => {
        store.dispatch('auth/logout')
        router.push('/login')
      }
      
      return {
        user,
        logout
      }
    }
  }
  </script>