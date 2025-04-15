<!--src/components/common/Sidebar.vue -->
<template>
  <div class="sidebar bg-dark text-white">
    <div class="salon-info py-3 px-3 mb-2 border-bottom border-secondary">
      <h5 class="mb-0 text-center text-white">{{ salonName }}</h5>
    </div>
    <ul class="nav flex-column">
      <li class="nav-item">
        <router-link to="/dashboard" class="nav-link">
          <i class="bi bi-speedometer2"></i> Dashboard
        </router-link>
      </li>
      <li class="nav-item">
        <router-link to="/barbiers" class="nav-link">
          <i class="bi bi-people"></i> Barbiers
        </router-link>
      </li>
      <li class="nav-item">
        <router-link to="/services" class="nav-link">
          <i class="bi bi-scissors"></i> Services
        </router-link>
      </li>
      <li class="nav-item">
        <router-link to="/appointments" class="nav-link">
          <i class="bi bi-calendar-check"></i> Rendez-vous
        </router-link>
      </li>
      <li class="nav-item">
        <router-link to="/clients" class="nav-link">
          <i class="bi bi-person-badge"></i> Clients
        </router-link>
      </li>
      <li class="nav-item">
        <router-link to="/publications" class="nav-link">
          <i class="bi bi-image"></i> Publications
        </router-link>
      </li>
      <li class="nav-item">
        <router-link to="/salon" class="nav-link">
          <i class="bi bi-shop"></i> Informations Salon
        </router-link>
      </li>
    </ul>
  </div>
</template>
  
<script>
import { computed } from 'vue'
import { useStore } from 'vuex'

export default {
  name: 'Sidebar',
  setup() {
    const store = useStore()
    
    const salonInfo = computed(() => store.getters['salon/salonInfo'])
    const salonName = computed(() => salonInfo.value?.name || 'Admin Dashboard')
    
    return {
      salonName
    }
  }
}
</script>
  
<style scoped lang="scss">
.sidebar {
  width: 250px;
  min-height: calc(100vh - 56px);
  
  .nav-link {
    color: #ddd;
    padding: 10px 15px;
    
    &:hover, &.router-link-active {
      background-color: rgba(255, 255, 255, 0.1);
      color: white;
    }
    
    i {
      margin-right: 8px;
    }
  }
}
</style>