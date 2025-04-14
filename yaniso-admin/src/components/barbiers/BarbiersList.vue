<!--src/components/barbiers/BarbierList.vue -->
<template>
    <div class="barbers-list">
      <div v-if="loading" class="text-center">
        <Loader message="Loading barbers..." />
      </div>
      
      <div v-else-if="error" class="alert alert-danger">
        {{ error }}
        <button class="btn btn-sm btn-outline-danger ms-2" @click="$emit('refresh')">
          <i class="bi bi-arrow-clockwise"></i> Retry
        </button>
      </div>
      
      <div v-else-if="barbiers.length === 0" class="text-center p-4">
        <div class="alert alert-info">
          <i class="bi bi-info-circle me-2"></i>
          No barbers found. Add your first barber to get started!
        </div>
        <button class="btn btn-primary mt-3" @click="$emit('add')">
          <i class="bi bi-plus"></i> Add Barber
        </button>
      </div>
      
      <div v-else class="row">
        <div v-for="barbier in barbiers" :key="barbier.id" class="col-md-4 mb-4">
          <div class="card h-100">
            <div class="position-relative">
              <img 
                :src="getBarbierImage(barbier)" 
                class="card-img-top" 
                alt="Barber photo"
                style="height: 250px; object-fit: cover;"
              >
              <div class="position-absolute top-0 end-0 m-2">
                <span class="badge bg-warning text-dark">
                  {{ (barbier.note !== null && barbier.note !== undefined) ? barbier.note.toFixed(1) : '0.0' }} <i class="bi bi-star-fill"></i>
                </span>
              </div>
            </div>
            <div class="card-body">
              <h5 class="card-title">{{ barbier.nom }}</h5>
              <p class="card-text text-muted">{{ barbier.nombreAvis }} reviews</p>
            </div>
            <div class="card-footer bg-white">
              <div class="d-flex justify-content-between">
                <button class="btn btn-sm btn-outline-primary" @click="$emit('view-services', barbier.id)">
                  <i class="bi bi-scissors me-1"></i> Services
                </button>
                <div>
                  <button class="btn btn-sm btn-outline-secondary me-1" @click="$emit('edit', barbier)">
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button class="btn btn-sm btn-outline-danger" @click="$emit('delete', barbier)">
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import Loader from '@/components/common/Loader.vue'
  
  export default {
    name: 'BarbiersList',
    components: {
      Loader
    },
    props: {
      barbiers: {
        type: Array,
        required: true
      },
      loading: {
        type: Boolean,
        default: false
      },
      error: {
        type: String,
        default: null
      }
    },
    emits: ['refresh', 'add', 'edit', 'delete', 'view-services'],
    methods: {
      getBarbierImage(barbier) {
        // Check if the photo URL is valid, otherwise use a default image
        if (barbier.photoUrl && !barbier.photoUrl.includes('imgur')) {
          return barbier.photoUrl
        }
        // Return a default image based on barber ID to ensure different barbers have different images
        return `/images/barber-${(barbier.id % 5) + 1}.jpg`
      }
    }
  }
  </script>