<!--src/components/services/ServicesList.vue -->
<template>
    <div class="services-list">
      <div v-if="loading" class="text-center py-5">
        <Loader message="Loading services..." />
      </div>
      
      <div v-else-if="error" class="alert alert-danger">
        {{ error }}
        <button class="btn btn-sm btn-outline-danger ms-2" @click="$emit('refresh')">
          <i class="bi bi-arrow-clockwise"></i> Retry
        </button>
      </div>
      
      <div v-else-if="services.length === 0" class="text-center p-4">
        <div class="alert alert-info">
          <i class="bi bi-info-circle me-2"></i>
          No services found. Add your first service to get started!
        </div>
        <button class="btn btn-primary mt-3" @click="$emit('add')">
          <i class="bi bi-plus"></i> Add Service
        </button>
      </div>
      
      <div v-else>
        <div class="table-responsive">
          <table class="table table-hover">
            <thead>
              <tr>
                <th>Name</th>
                <th>Duration (min)</th>
                <th>Price (DA)</th>
                <th>Barber</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="service in services" :key="service.id">
                <td>{{ service.nom }}</td>
                <td>{{ service.duree }}</td>
                <td>{{ service.prix }}</td>
                <td>{{ getBarbierName(service.BarberId) }}</td>
                <td>
                  <button class="btn btn-sm btn-outline-secondary me-1" @click="$emit('edit', service)">
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button class="btn btn-sm btn-outline-danger" @click="$emit('delete', service)">
                    <i class="bi bi-trash"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import Loader from '@/components/common/Loader.vue'
  
  export default {
    name: 'ServicesList',
    components: {
      Loader
    },
    props: {
      services: {
        type: Array,
        required: true
      },
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
    emits: ['refresh', 'add', 'edit', 'delete'],
    methods: {
      getBarbierName(barbierId) {
        const barbier = this.barbiers.find(b => b.id === barbierId)
        return barbier ? barbier.nom : 'Unknown'
      }
    }
  }
  </script>