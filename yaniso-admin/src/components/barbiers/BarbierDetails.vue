<!--src/components/barbiers/Barbierdetails.vue -->
<template>
    <div class="barber-details">
      <div v-if="loading" class="text-center">
        <Loader message="Loading barber details..." />
      </div>
      
      <div v-else-if="error" class="alert alert-danger">
        {{ error }}
        <button class="btn btn-sm btn-outline-danger ms-2" @click="$emit('refresh')">
          <i class="bi bi-arrow-clockwise"></i> Retry
        </button>
      </div>
      
      <div v-else-if="!barbier" class="alert alert-warning">
        Barber not found. The barber may have been deleted.
      </div>
      
      <div v-else>
        <div class="card mb-4">
          <div class="row g-0">
            <div class="col-md-4">
              <img 
                :src="getBarbierImage()" 
                class="img-fluid rounded-start" 
                alt="Barber photo"
                style="height: 300px; object-fit: cover; width: 100%;"
              >
            </div>
            <div class="col-md-8">
              <div class="card-body">
                <h4 class="card-title">{{ barbier.nom }}</h4>
                
                <div class="d-flex align-items-center mb-3">
                  <div class="me-3">
                    <span class="fs-4 fw-bold text-warning">{{ (barbier.note !== null && barbier.note !== undefined && !isNaN(Number(barbier.note))) ? Number(barbier.note).toFixed(1) : '0.0' }}</span>
                    <i class="bi bi-star-fill text-warning"></i>
                  </div>
                  <span class="text-muted">({{ barbier.nombreAvis }} reviews)</span>
                </div>
                
                <div class="mb-3">
                  <h5>Services</h5>
                  <div v-if="loadingServices">
                    <div class="d-flex justify-content-center">
                      <div class="spinner-border spinner-border-sm text-primary" role="status">
                        <span class="visually-hidden">Loading...</span>
                      </div>
                      <span class="ms-2">Loading services...</span>
                    </div>
                  </div>
                  <div v-else-if="servicesError" class="alert alert-danger">
                    {{ servicesError }}
                  </div>
                  <div v-else-if="services.length === 0" class="alert alert-info">
                    This barber has no services. <a href="#" @click.prevent="$emit('add-service')">Add a service</a>
                  </div>
                  <ul v-else class="list-group">
                    <li v-for="service in services" :key="service.id" class="list-group-item d-flex justify-content-between align-items-center">
                      <div>
                        <span class="fw-bold">{{ service.nom }}</span>
                        <small class="d-block text-muted">{{ service.duree }} min</small>
                      </div>
                      <span class="badge bg-primary rounded-pill">{{ service.prix }} CAD</span>
                    </li>
                  </ul>
                </div>
                
                <div class="d-flex justify-content-end">
                  <button class="btn btn-outline-secondary me-2" @click="$emit('back')">
                    <i class="bi bi-arrow-left"></i> Back
                  </button>
                  <button class="btn btn-primary me-2" @click="$emit('edit')">
                    <i class="bi bi-pencil"></i> Edit
                  </button>
                  <button class="btn btn-danger" @click="$emit('delete')">
                    <i class="bi bi-trash"></i> Delete
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
    name: 'BarbierDetails',
    components: {
      Loader
    },
    props: {
      barbier: {
        type: Object,
        default: null
      },
      loading: {
        type: Boolean,
        default: false
      },
      error: {
        type: String,
        default: null
      },
      services: {
        type: Array,
        default: () => []
      },
      loadingServices: {
        type: Boolean,
        default: false
      },
      servicesError: {
        type: String,
        default: null
      }
    },
    emits: ['refresh', 'edit', 'delete', 'back', 'add-service'],
    methods: {
      getBarbierImage() {
        // Check if the photo URL is valid, otherwise use a default image
        if (this.barbier.photoUrl && !this.barbier.photoUrl.includes('imgur')) {
          return this.barbier.photoUrl
        }
        // Return a default image based on barber ID
        return `/images/barber-${(this.barbier.id % 5) + 1}.jpg`
      }
    }
  }
  </script>