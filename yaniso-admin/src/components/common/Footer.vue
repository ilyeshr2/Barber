<!--src/components/common/Footer.vue -->
<template>
    <footer class="footer">
      <div class="container">
        <div class="d-flex justify-content-between align-items-center py-3 border-top">
          <div class="col-md-4 d-flex align-items-center">
            <span class="text-muted">© {{ currentYear }} Yaniso Studio</span>
          </div>
          <div class="col-md-4 text-center">
            <span class="text-muted">Admin Panel v1.0.0</span>
          </div>
          <div class="col-md-4 text-end">
            <a href="#" class="text-muted me-3">Terms</a>
            <a href="#" class="text-muted">Privacy Policy</a>
          </div>
        </div>
      </div>
    </footer>
  </template>
  
  <script>
  import { computed } from 'vue'
  
  export default {
    name: 'Footer',
    setup() {
      const currentYear = computed(() => new Date().getFullYear())
      
      return {
        currentYear
      }
    }
  }
  </script>
  
  <style scoped>
  .footer {
    background-color: #f8f9fa;
    padding: 0;
    margin-top: auto;
  }
  </style>