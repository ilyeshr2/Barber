<!--src/components/common/Loader.vue -->
<template>
    <div class="loader-container">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p v-if="message" class="mt-2 text-muted">{{ message }}</p>
    </div>
  </template>
  
  <script>
  export default {
    name: 'Loader',
    props: {
      message: {
        type: String,
        default: ''
      }
    }
  }
  </script>
  
  <style scoped>
  .loader-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 2rem;
    min-height: 200px;
  }
  </style>