<!--src/components/appointments/AppointmentForm.vue -->
<template>
    <form @submit.prevent="handleSubmit">
      <div v-if="isEditing" class="alert alert-info mb-3">
        <i class="bi bi-info-circle me-2"></i>
        En mode d'édition, seul le statut peut être modifié. Pour modifier d'autres informations, veuillez supprimer ce rendez-vous et en créer un nouveau.
      </div>
      
      <div class="row mb-3">
        <div class="col-md-6">
          <div class="mb-3">
            <label for="date" class="form-label">Date</label>
            <input 
              type="date" 
              class="form-control" 
              id="date" 
              v-model="formData.date"
              required
              :disabled="isEditing"
            >
          </div>
        </div>
        <div class="col-md-6">
          <div class="mb-3">
            <label for="time" class="form-label">Time</label>
            <input 
              type="time" 
              class="form-control" 
              id="time" 
              v-model="formData.time"
              required
              :disabled="isEditing"
            >
          </div>
        </div>
      </div>
      
      <div class="mb-3">
        <label for="client" class="form-label">Client</label>
        <select 
          class="form-select" 
          id="client" 
          v-model="formData.UtilisateurId"
          required
          :disabled="isEditing"
        >
          <option value="">Select a client</option>
          <option v-for="client in clients" :key="client.id" :value="client.id">
            {{ client.prenom }} {{ client.nom }} - {{ client.telephone }}
          </option>
        </select>
      </div>
      
      <div class="mb-3">
        <label for="barber" class="form-label">Barber</label>
        <select 
          class="form-select" 
          id="barber" 
          v-model="formData.BarbierId"
          required
          @change="loadBarbierServices"
          :disabled="isEditing"
        >
          <option value="">Select a barber</option>
          <option v-for="barbier in barbiers" :key="barbier.id" :value="barbier.id">
            {{ barbier.nom }}
          </option>
        </select>
      </div>
      
      <div class="mb-3">
        <label for="service" class="form-label">Service</label>
        <select 
          class="form-select" 
          id="service" 
          v-model="formData.ServiceId"
          required
          :disabled="isEditing || !formData.BarbierId || loadingServices"
        >
          <option value="">Select a service</option>
          <option v-for="service in filteredServices" :key="service.id" :value="service.id">
            {{ service.nom }} - {{ service.duree }}min - {{ service.prix }}DA
          </option>
        </select>
        
        <div v-if="loadingServices" class="text-muted mt-2">
          <div class="spinner-border spinner-border-sm me-1" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          Loading services...
        </div>
      </div>
      
      <div class="mb-3">
        <label for="status" class="form-label">Status</label>
        <select 
          class="form-select" 
          id="status" 
          v-model="formData.statut"
          required
        >
          <option value="confirmé">Confirmed</option>
          <option value="annulé">Cancelled</option>
          <option value="terminé">Completed</option>
        </select>
      </div>
      
      <div class="d-flex justify-content-end">
        <button type="button" class="btn btn-secondary me-2" @click="$emit('cancel')">
          Cancel
        </button>
        <button type="submit" class="btn btn-primary" :disabled="loading">
          <span v-if="loading" class="spinner-border spinner-border-sm me-1"></span>
          {{ isEditing ? 'Update' : 'Create' }}
        </button>
      </div>
    </form>
  </template>
  
  <script>
  import { ref, computed, watch } from 'vue'
  import { useStore } from 'vuex'
  
  export default {
    name: 'AppointmentForm',
    props: {
        appointment: {
    type: Object,
    default: () => ({
      date: '',
      time: '',
      UtilisateurId: '',
      BarbierId: '',
      ServiceId: '',
      statut: 'confirmé'
    })
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
      isEditing: {
        type: Boolean,
        default: false
      },
      loading: {
        type: Boolean,
        default: false
      }
    },
    emits: ['submit', 'cancel'],
    setup(props, { emit }) {
      const store = useStore()
      const loadingServices = ref(false)
      
      const formData = ref({
        date: '',
        time: '',
        UtilisateurId: '',
        BarbierId: '',
        ServiceId: '',
        statut: 'confirmé'
      })
      
      // Initialize form with appointment data if editing
      watch(() => props.appointment, (appointment) => {
        if (appointment) {
          const date = new Date(appointment.date)
          
          formData.value = {
            ...formData.value,
            date: date.toISOString().split('T')[0],
            time: date.toTimeString().split(' ')[0].slice(0, 5),
            UtilisateurId: appointment.UtilisateurId || '',
            BarbierId: appointment.BarbierId || '',
            ServiceId: appointment.ServiceId || '',
            statut: appointment.statut || 'confirmé'
          }
        }
      }, { immediate: true })
      
      const filteredServices = computed(() => {
  if (!formData.value.BarbierId) return []
  
  const availableServices = props.services.filter(service => 
    service && service.BarberId === formData.value.BarbierId
  )
  
  return availableServices.length > 0 ? availableServices : []
})
      
      const loadBarbierServices = async () => {
        if (!formData.value.BarbierId) return
        
        loadingServices.value = true
        try {
          await store.dispatch('services/fetchBarbierServices', formData.value.BarbierId)
        } catch (error) {
          console.error('Error loading barber services:', error)
        } finally {
          loadingServices.value = false
        }
      }
      
      const handleSubmit = () => {
        // Convert date and time to ISO string
        const dateTime = new Date(`${formData.value.date}T${formData.value.time}:00`)
        
        const appointmentData = {
          date: dateTime.toISOString(),
          UtilisateurId: parseInt(formData.value.UtilisateurId),
          BarbierId: parseInt(formData.value.BarbierId),
          ServiceId: parseInt(formData.value.ServiceId),
          statut: formData.value.statut
        }
        
        emit('submit', appointmentData)
      }
      
      return {
        formData,
        filteredServices,
        loadingServices,
        loadBarbierServices,
        handleSubmit
      }
    }
  }
  </script>