<!--src/components/appointments/AppointmentsList.vue -->
<template>
    <div class="appointments-list">
      <div v-if="loading" class="text-center py-5">
        <Loader message="Loading appointments..." />
      </div>
      
      <div v-else-if="error" class="alert alert-danger">
        {{ error }}
        <button class="btn btn-sm btn-outline-danger ms-2" @click="$emit('refresh')">
          <i class="bi bi-arrow-clockwise"></i> Retry
        </button>
      </div>
      
      <div v-else-if="appointments.length === 0" class="text-center p-4">
        <div class="alert alert-info">
          <i class="bi bi-info-circle me-2"></i>
          No appointments found for the selected filters.
        </div>
      </div>
      
      <div v-else class="table-responsive">
        <table class="table table-hover">
          <thead>
            <tr>
              <th>Date</th>
              <th>Time</th>
              <th>Client</th>
              <th>Barber</th>
              <th>Service</th>
              <th>Price</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="appointment in appointments" 
              :key="appointment.id"
              :class="getStatusClass(appointment.statut)"
            >
              <td>{{ formatDate(appointment.date) }}</td>
              <td>{{ formatTime(appointment.date) }}</td>
              <td>{{ getClientName(appointment.UtilisateurId) }}</td>
              <td>{{ getBarbierName(appointment.BarbierId) }}</td>
              <td>{{ getServiceName(appointment.ServiceId) }}</td>
              <td>{{ getServicePrice(appointment.ServiceId) }} DA</td>
              <td>
                <span :class="getStatusBadgeClass(appointment.statut)">
                  {{ appointment.statut }}
                </span>
              </td>
              <td>
                <div class="btn-group">
                  <button class="btn btn-sm btn-outline-info me-1" @click="$emit('view', appointment)">
                    <i class="bi bi-eye"></i>
                  </button>
                  <button class="btn btn-sm btn-outline-secondary me-1" @click="$emit('edit', appointment)">
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button 
                    v-if="appointment.statut === 'confirmé'"
                    class="btn btn-sm btn-outline-success me-1" 
                    @click="$emit('complete', appointment)"
                  >
                    <i class="bi bi-check-circle"></i>
                  </button>
                  <button 
                    v-if="appointment.statut === 'confirmé'"
                    class="btn btn-sm btn-outline-warning me-1" 
                    @click="$emit('cancel', appointment)"
                  >
                    <i class="bi bi-x-circle"></i>
                  </button>
                  <button class="btn btn-sm btn-outline-danger" @click="$emit('delete', appointment)">
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </template>
  
  <script>
  import Loader from '@/components/common/Loader.vue'
  import { formatDate, formatTime } from '@/utils/format'
  
  export default {
    name: 'AppointmentsList',
    components: {
      Loader
    },
    props: {
      appointments: {
        type: Array,
        required: true
      },
      barbiers: {
        type: Array,
        required: true
      },
      services: {
        type: Array,
        required: true
      },
      clients: {
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
    emits: ['refresh', 'view', 'edit', 'complete', 'cancel', 'delete'],
    methods: {
      formatDate,
      formatTime,
      
      getClientName(clientId) {
        const client = this.clients.find(c => c.id === clientId)
        return client ? `${client.prenom} ${client.nom}` : 'Unknown'
      },
      
      getBarbierName(barbierId) {
        const barbier = this.barbiers.find(b => b.id === barbierId)
        return barbier ? barbier.nom : 'Unknown'
      },
      
      getServiceName(serviceId) {
        const service = this.services.find(s => s.id === serviceId)
        return service ? service.nom : 'Unknown'
      },
      
      getServicePrice(serviceId) {
        const service = this.services.find(s => s.id === serviceId)
        return service ? service.prix : 0
      },
      
      getStatusClass(status) {
        switch (status) {
          case 'annulé': return 'table-danger'
          case 'terminé': return 'table-success'
          default: return ''
        }
      },
      
      getStatusBadgeClass(status) {
        switch (status) {
          case 'confirmé': return 'badge bg-primary'
          case 'annulé': return 'badge bg-danger'
          case 'terminé': return 'badge bg-success'
          default: return 'badge bg-secondary'
        }
      }
    }
  }
  </script>