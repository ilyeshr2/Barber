<!--src/App.vue -->
<template>
  <div id="app">
    <Navbar v-if="isAuthenticated" />
    <div class="main-container">
      <Sidebar v-if="isAuthenticated" />
      <main class="content">
        <router-view />
      </main>
    </div>
    <Footer v-if="isAuthenticated" />
  </div>
</template>

<script>
import { computed, onMounted, watch } from 'vue'
import { useStore } from 'vuex'
import Navbar from './components/common/Navbar.vue'
import Sidebar from './components/common/Sidebar.vue'
import Footer from './components/common/Footer.vue'

export default {
  name: 'App',
  components: {
    Navbar,
    Sidebar,
    Footer
  },
  setup() {
    const store = useStore()
    
    const isAuthenticated = computed(() => store.getters['auth/isAuthenticated'])
    
    onMounted(() => {
      store.dispatch('auth/checkAuth')
    })
    
    // Watch for authentication changes and load salon info when authenticated
    watch(isAuthenticated, (newValue) => {
      if (newValue) {
        // Load salon info for global use
        store.dispatch('salon/fetchSalonInfo').catch(error => {
          console.error('Error loading salon info:', error)
        })
      }
    }, { immediate: true })
    
    return {
      isAuthenticated
    }
  }
}
</script>

<style lang="scss">
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-container {
  display: flex;
  flex: 1;
}

.content {
  flex: 1;
  padding: 20px;
  background-color: #f8f9fa;
}
</style>