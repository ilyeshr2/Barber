<!--src/views/AppointmentView.vue -->
<template>
    <div class="appointments-view">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h1>Gestion des Rendez-vous</h1>
        <div>
          <button class="btn btn-outline-secondary me-2" @click="toggleView">
            <i :class="calendarView ? 'bi bi-list' : 'bi bi-calendar3'"></i>
            {{ calendarView ? 'Vue Liste' : 'Vue Calendrier' }}
          </button>
          <button class="btn btn-primary" @click="showAddModal">
            <i class="bi bi-plus"></i> Nouveau Rendez-vous
          </button>
        </div>
      </div>
      
      <div class="filters mb-4">
        <div class="row">
          <div class="col-md-3">
            <div class="input-group">
              <span class="input-group-text">Date</span>
              <input 
                type="date" 
                class="form-control" 
                v-model="filters.date"
              >
            </div>
          </div>
          <div class="col-md-3">
            <div class="input-group">
              <span class="input-group-text">Barbier</span>
              <select class="form-select" v-model="filters.barbierId">
                <option value="">Tous</option>
                <option v-for="barbier in barbiers" :key="barbier.id" :value="barbier.id">
                  {{ barbier.nom }}
                </option>
              </select>
            </div>
          </div>
          <div class="col-md-3">
            <div class="input-group">
              <span class="input-group-text">Statut</span>
              <select class="form-select" v-model="filters.statut">
                <option value="">Tous</option>
                <option value="confirmé">Confirmé</option>
                <option value="annulé">Annulé</option>
                <option value="terminé">Terminé</option>
              </select>
            </div>
          </div>
          <div class="col-md-3">
            <button class="btn btn-outline-secondary w-100" @click="resetFilters">
              Réinitialiser les filtres
            </button>
          </div>
        </div>
      </div>
      
      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
      
      <div v-else-if="error" class="alert alert-danger">
        {{ error }}
      </div>
      
      <div v-else>
        <!-- Calendar View -->
        <AppointmentCalendar 
          v-if="calendarView" 
          :appointments="filteredAppointments"
          :barbiers="barbiers"
          @edit="editAppointment"
          @view="viewAppointmentDetails"
          @delete="confirmDeleteAppointment"
        />
        
        <!-- List View -->
        <div v-else class="table-responsive">
          <table class="table table-hover">
            <thead>
              <tr>
                <th>Date</th>
                <th>Heure</th>
                <th>Client</th>
                <th>Barbier</th>
                <th>Service</th>
                <th>Prix</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="appointment in filteredAppointments" :key="appointment.id" :class="getStatusClass(appointment.statut)">
                <td>{{ formatDate(appointment.date) }}</td>
                <td>{{ formatTime(appointment.date) }}</td>
                <td>{{ getClientName(appointment) }}</td>
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
                    <button class="btn btn-sm btn-outline-info me-1" @click="viewAppointmentDetails(appointment)">
                      <i class="bi bi-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-secondary me-1" @click="editAppointment(appointment)">
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" @click="confirmDeleteAppointment(appointment)">
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="filteredAppointments.length === 0">
                <td colspan="8" class="text-center">Aucun rendez-vous trouvé</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <!-- Appointment Form Modal -->
      <div class="modal fade" id="appointmentModal" tabindex="-1" ref="appointmentModal">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">{{ isEditing ? 'Modifier Rendez-vous' : 'Nouveau Rendez-vous' }}</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" tabindex="0"></button>
            </div>
            <div class="modal-body">
              <AppointmentForm 
                :appointment="currentAppointment" 
                :is-editing="isEditing"
                :barbiers="barbiers"
                :services="services"
                :clients="clients"
                @submit="saveAppointment" 
                @cancel="closeModal"
              />
            </div>
          </div>
        </div>
      </div>
      
      <!-- Appointment Details Modal -->
      <div class="modal fade" id="appointmentDetailsModal" tabindex="-1" ref="appointmentDetailsModal">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Détails du Rendez-vous</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" tabindex="0"></button>
            </div>
            <div class="modal-body">
              <AppointmentDetails 
                v-if="currentAppointment"
                :appointment="currentAppointment"
                :barbiers="barbiers"
                :services="services"
                :clients="clients"
              />
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" tabindex="0">Fermer</button>
              <button type="button" class="btn btn-primary" @click="editAppointmentFromDetails" tabindex="0">Modifier le statut</button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Delete Confirmation Modal -->
      <ConfirmModal
        ref="deleteModal"
        title="Confirmation de suppression"
        message="Êtes-vous sûr de vouloir supprimer ce rendez-vous? Cette action est irréversible."
        confirm-button-text="Supprimer"
        confirm-button-variant="danger"
        @confirm="deleteAppointment"
      />
    </div>
  </template>
  
  <script>
  import { ref, computed, onMounted } from 'vue'
  import { useStore } from 'vuex'
  import { Modal } from 'bootstrap'
  import { formatDate, formatTime } from '@/utils/format'
  import { notify } from '@/utils/notification'
  import AppointmentCalendar from '@/components/appointments/AppointmentCalendar.vue'
  import AppointmentForm from '@/components/appointments/AppointmentForm.vue'
  import AppointmentDetails from '@/components/appointments/AppointmentDetails.vue'
  import ConfirmModal from '@/components/common/ConfirmModal.vue'
  
  export default {
    name: 'AppointmentsView',
    components: {
      AppointmentCalendar,
      AppointmentForm,
      AppointmentDetails,
      ConfirmModal
    },
    setup() {
      const store = useStore()
      const appointmentModal = ref(null)
      const appointmentDetailsModal = ref(null)
      const deleteModal = ref(null)
      const currentAppointment = ref(null)
      const appointmentToDelete = ref(null)
      const isEditing = ref(false)
      const calendarView = ref(false)
      
      const filters = ref({
        date: '',
        barbierId: '',
        statut: ''
      })
      
      const loading = computed(() => store.getters['appointments/loading'])
      const error = computed(() => store.getters['appointments/error'])
      const appointments = computed(() => store.getters['appointments/appointments'])
      const barbiers = computed(() => store.getters['barbiers/barbiers'])
      const services = computed(() => store.getters['services/allServices'])
      const clients = computed(() => store.getters['clients/clients'])
      
      const filteredAppointments = computed(() => {
        return appointments.value.filter(appointment => {
          // Filter by date
          if (filters.value.date) {
            const appointmentDate = new Date(appointment.date).toISOString().split('T')[0]
            if (appointmentDate !== filters.value.date) {
              return false
            }
          }
          
          // Filter by barbierId
          if (filters.value.barbierId && appointment.BarbierId !== parseInt(filters.value.barbierId)) {
            return false
          }
          
          // Filter by status
          if (filters.value.statut && appointment.statut !== filters.value.statut) {
            return false
          }
          
          return true
        })
      })
      
      onMounted(async () => {
        await Promise.all([
          store.dispatch('barbiers/fetchBarbiers'),
          store.dispatch('services/fetchAllServices'),
          store.dispatch('clients/fetchClients'),
          store.dispatch('appointments/fetchAppointments')
        ])
      })
      
      const toggleView = () => {
        calendarView.value = !calendarView.value
      }
      
      const resetFilters = () => {
        filters.value = {
          date: '',
          barbierId: '',
          statut: ''
        }
      }
      
      const showAddModal = () => {
        isEditing.value = false
        const today = new Date()
        today.setMinutes(Math.ceil(today.getMinutes() / 30) * 30)
        
        currentAppointment.value = {
          date: today.toISOString(),
          statut: 'confirmé',
          UtilisateurId: null,
          BarbierId: null,
          ServiceId: null
        }
        
        const modal = new Modal(appointmentModal.value)
        modal.show()
      }
      
      const editAppointment = (appointment) => {
        isEditing.value = true
        currentAppointment.value = { ...appointment }
        
        // Close details modal if open
        const detailsModal = Modal.getInstance(appointmentDetailsModal.value)
        if (detailsModal) {
          detailsModal.hide()
        }
        
        const modal = new Modal(appointmentModal.value)
        modal.show()
      }
      
      const editAppointmentFromDetails = () => {
        // Close details modal
        const detailsModal = Modal.getInstance(appointmentDetailsModal.value)
        if (detailsModal) {
          detailsModal.hide()
        }
        
        // Open edit modal
        isEditing.value = true
        const modal = new Modal(appointmentModal.value)
        modal.show()
      }
      
      const viewAppointmentDetails = (appointment) => {
        currentAppointment.value = { ...appointment }
        
        const modal = new Modal(appointmentDetailsModal.value)
        modal.show()
      }
      
      const closeModal = () => {
        const modal = Modal.getInstance(appointmentModal.value)
        if (modal) {
          modal.hide()
        }
      }
      
      const saveAppointment = async (appointmentData) => {
        try {
          if (isEditing.value) {
            // In edit mode, we can only update the status currently
            // Check if only the status has changed
            if (appointmentData.statut !== currentAppointment.value.statut) {
              await store.dispatch('appointments/updateAppointment', {
                id: currentAppointment.value.id,
                data: appointmentData
              })
              notify.success('Statut du rendez-vous mis à jour avec succès')
            } else {
              // If other fields were changed, show a warning that only status updates are supported
              notify.warning('Seule la mise à jour du statut est prise en charge pour le moment. Les autres champs ne seront pas modifiés.')
              
              // Update status only
              if (appointmentData.statut !== currentAppointment.value.statut) {
                await store.dispatch('appointments/updateAppointment', {
                  id: currentAppointment.value.id,
                  data: { statut: appointmentData.statut }
                })
                notify.success('Statut du rendez-vous mis à jour avec succès')
              }
            }
          } else {
            await store.dispatch('appointments/createAppointment', appointmentData)
            notify.success('Rendez-vous créé avec succès')
          }
          
          closeModal()
          // Refresh the appointments list after saving
          store.dispatch('appointments/fetchAppointments')
        } catch (error) {
          console.error('Error saving appointment:', error)
          notify.error(error.message || 'Erreur lors de l\'enregistrement du rendez-vous')
        }
      }
      
      const confirmDeleteAppointment = (appointment) => {
        appointmentToDelete.value = appointment
        deleteModal.value.show()
      }
      
      const deleteAppointment = async () => {
        if (appointmentToDelete.value) {
          try {
            await store.dispatch('appointments/deleteAppointment', appointmentToDelete.value.id)
            notify.success('Rendez-vous supprimé avec succès')
          } catch (error) {
            console.error('Error deleting appointment:', error)
            notify.error(error.message || 'Erreur lors de la suppression du rendez-vous')
          }
        }
      }
      
      const getClientName = (appointment) => {
        const client = clients.value.find(c => c.id === appointment.UtilisateurId)
        return client ? `${client.prenom} ${client.nom}` : 'Inconnu'
      }
      
      const getBarbierName = (barbierId) => {
        const barbier = barbiers.value.find(b => b.id === barbierId)
        return barbier ? barbier.nom : 'Inconnu'
      }
      
      const getServiceName = (serviceId) => {
        const service = services.value.find(s => s.id === serviceId)
        return service ? service.nom : 'Inconnu'
      }
      
      const getServicePrice = (serviceId) => {
        const service = services.value.find(s => s.id === serviceId)
        return service ? service.prix : 0
      }
      
      const getStatusClass = (status) => {
        switch (status) {
          case 'annulé': return 'table-danger'
          case 'terminé': return 'table-success'
          default: return ''
        }
      }
      
      const getStatusBadgeClass = (status) => {
        switch (status) {
          case 'confirmé': return 'badge bg-primary'
          case 'annulé': return 'badge bg-danger'
          case 'terminé': return 'badge bg-success'
          default: return 'badge bg-secondary'
        }
      }
      
      return {
        appointmentModal,
        appointmentDetailsModal,
        deleteModal,
        currentAppointment,
        isEditing,
        loading,
        error,
        calendarView,
        filters,
        appointments,
        filteredAppointments,
        barbiers,
        services,
        clients,
        toggleView,
        resetFilters,
        showAddModal,
        editAppointment,
        editAppointmentFromDetails,
        viewAppointmentDetails,
        closeModal,
        saveAppointment,
        confirmDeleteAppointment,
        deleteAppointment,
        getClientName,
        getBarbierName,
        getServiceName,
        getServicePrice,
        getStatusClass,
        getStatusBadgeClass,
        formatDate,
        formatTime
      }
    }
  }
  </script>
  
  <style scoped>
  .table td, .table th {
    vertical-align: middle;
  }
  </style>