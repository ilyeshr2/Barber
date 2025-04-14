<!--src/views/Login.vue -->
<template>
    <div class="login-container">
      <div class="login-card">
        <div class="text-center mb-4">
          <img src="@/assets/logo.png" alt="Yaniso Studio Logo" height="80">
          <h2 class="mt-3">Admin Access</h2>
        </div>
  
        <div v-if="error" class="alert alert-danger">{{ error }}</div>
  
        <form @submit.prevent="handleLogin">
          <div class="mb-3">
            <label for="email" class="form-label">Email Address</label>
            <input
              type="email"
              id="email"
              v-model="email"
              class="form-control"
              required
            />
          </div>
  
          <div class="mb-3">
            <label for="password" class="form-label">Password</label>
            <input
              type="password"
              id="password"
              v-model="password"
              class="form-control"
              required
            />
          </div>
  
          <button
            type="submit"
            class="btn btn-primary w-100"
            :disabled="loading"
          >
            <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
            Login
          </button>
        </form>
      </div>
    </div>
  </template>
  
  <script>
  import { ref } from 'vue'
  import { useStore } from 'vuex'
  import { useRouter } from 'vue-router'
  
  export default {
    name: 'LoginView',
    setup() {
      const store = useStore()
      const router = useRouter()
  
      const email = ref('')
      const password = ref('')
      const loading = ref(false)
      const error = ref('')
  
      const handleLogin = async () => {
        loading.value = true
        error.value = ''
  
        try {
          await store.dispatch('auth/login', {
            email: email.value,
            password: password.value
          })
          router.push('/dashboard')
        } catch (err) {
          error.value = err.message || 'Failed to login. Please try again.'
        } finally {
          loading.value = false
        }
      }
  
      return {
        email,
        password,
        loading,
        error,
        handleLogin
      }
    }
  }
  </script>
  
  <style scoped>
  .login-container {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    background-color: #f8f9fa;
  }
  
  .login-card {
    width: 100%;
    max-width: 400px;
    padding: 30px;
    border-radius: 8px;
    background-color: white;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
  </style>