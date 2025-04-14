<!--src/views/NotFound.vue -->
<template>
    <div class="not-found">
      <div class="container text-center py-5">
        <h1 class="display-1 text-primary">404</h1>
        <h2 class="mb-4">Page Not Found</h2>
        <p class="lead mb-5">The page you are looking for doesn't exist or has been moved.</p>
        <button class="btn btn-primary btn-lg" @click="goHome">
          <i class="bi bi-house-door me-2"></i> Go to Dashboard
        </button>
      </div>
    </div>
  </template>
  
  <script>
  import { useRouter } from 'vue-router'
  
  export default {
    name: 'NotFound',
    setup() {
      const router = useRouter()
      
      const goHome = () => {
        router.push('/dashboard')
      }
      
      return {
        goHome
      }
    }
  }
  </script>
  
  <style scoped>
  .not-found {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f8f9fa;
  }
  </style>