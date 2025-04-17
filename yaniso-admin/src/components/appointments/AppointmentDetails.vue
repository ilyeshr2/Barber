<!--src/components/appointments/AppointmentDetails.vue -->
<template>
    <div class="appointment-details">
      <div v-if="!appointment" class="alert alert-warning">
        Appointment not found or has been deleted.
      </div>
      
      <div v-else>
        <div class="card">
          <div class="card-header">
            <div class="d-flex justify-content-between align-items-center">
              <h5 class="mb-0">Appointment #{{ appointment.id }}</h5>
              <span :class="getStatusBadgeClass(appointment.statut)">
                {{ appointment.statut }}
              </span>
            </div>
          </div>
          
          <div class="card-body">
            <div class="row mb-3">
              <div class="col-md-6">
                <h6 class="text-muted">Date & Time</h6>
                <p class="mb-0">{{ formatDateTime(appointment.date) }}</p>
              </div>
              <div class="col-md-6">
                <h6 class="text-muted">Status</h6>
                <p class="mb-0">{{ appointment.statut }}</p>
              </div>
            </div>
            
            <hr>
            
            <div class="row mb-3">
              <div class="col-md-6">
                <h6 class="text-muted">Client</h6>
                <p class="mb-0">{{ getClientName(appointment.UtilisateurId) }}</p>
                <small class="text-muted">{{ getClientPhone(appointment.UtilisateurId) }}</small>
              </div>
              <div class="col-md-6">
                <h6 class="text-muted">Barber</h6>
                <p class="mb-0">{{ getBarbierName(appointment.BarbierId) }}</p>
              </div>
            </div>
            
            <hr>
            
            <div class="row mb-3">
              <div class="col-md-6">
                <h6 class="text-muted">Service</h6>
                <p class="mb-0">{{ getServiceName(appointment.ServiceId) }}</p>
                <small class="text-muted">{{ getServiceDuration(appointment.ServiceId) }} minutes</small>
              </div>
              <div class="col-md-6">
                <h6 class="text-muted">Price</h6>
                <p class="mb-0 fs-5 fw-bold">{{ getServicePrice(appointment.ServiceId) }} CAD</p>
              </div>
            </div>
            
            <hr>
            
            <div class="mb-3">
              <h6 class="text-muted">Timeline</h6>
              <ul class="list-group list-group-flush">
                <li class="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <i class="bi bi-calendar-plus text-primary me-2"></i>
                    Created
                  </div>
                  <span class="text-muted">{{ formatDate(appointment.createdAt) }}</span>
                </li>
                <li v-if="appointment.statut !== 'confirmé'" class="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <i :class="appointment.statut === 'terminé' ? 'bi bi-check-circle text-success' : 'bi bi-x-circle text-danger'" class="me-2"></i>
                    {{ appointment.statut === 'terminé' ? 'Completed' : 'Cancelled' }}
                  </div>
                  <span class="text-muted">{{ formatDate(appointment.updatedAt) }}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { formatDate, formatTime, formatDateTime } from '@/utils/format'
  
  export default {
    name: 'AppointmentDetails',
    props: {
      appointment: {
        type: Object,
        default: null
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
      }
    },
    methods: {
      formatDate,
      formatTime,
      formatDateTime,
      
      getClientName(clientId) {
        const client = this.clients.find(c => c.id === clientId)
        return client ? `${client.prenom} ${client.nom}` : 'Unknown'
      },
      
      getClientPhone(clientId) {
        const client = this.clients.find(c => c.id === clientId)
        return client ? client.telephone : ''
      },
      
      getBarbierName(barbierId) {
        const barbier = this.barbiers.find(b => b.id === barbierId)
        return barbier ? barbier.nom : 'Unknown'
      },
      
      getServiceName(serviceId) {
        const service = this.services.find(s => s.id === serviceId)
        return service ? service.nom : 'Unknown'
      },
      
      getServiceDuration(serviceId) {
        const service = this.services.find(s => s.id === serviceId)
        return service ? service.duree : 0
      },
      
      getServicePrice(serviceId) {
        const service = this.services.find(s => s.id === serviceId)
        return service ? service.prix : 0
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