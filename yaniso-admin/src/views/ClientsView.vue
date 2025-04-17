<!--src/views/clientsView.vue -->
<template>
    <div class="clients-view">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h1>Clients Management</h1>
        <button class="btn btn-primary" @click="showAddModal">
          <i class="bi bi-plus"></i> Add Client
        </button>
      </div>
      
      <!-- Search and filter section -->
      <div class="card mb-4">
        <div class="card-body">
          <div class="row">
            <div class="col-md-8">
              <div class="input-group">
                <span class="input-group-text"><i class="bi bi-search"></i></span>
                <input 
                  type="text" 
                  class="form-control" 
                  placeholder="Search by name or phone number" 
                  v-model="searchQuery"
                >
              </div>
            </div>
            <div class="col-md-4">
              <div class="d-grid">
                <button class="btn btn-outline-secondary" @click="searchQuery = ''">
                  <i class="bi bi-x-circle me-1"></i> Clear
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div v-if="loading" class="text-center py-5">
        <Loader message="Loading clients..." />
      </div>
      
      <div v-else-if="error" class="alert alert-danger">
        {{ error }}
        <button class="btn btn-sm btn-outline-danger ms-2" @click="loadClients">
          <i class="bi bi-arrow-clockwise"></i> Retry
        </button>
      </div>
      
      <div v-else-if="filteredClients.length === 0" class="text-center p-4">
        <div class="alert alert-info">
          <i class="bi bi-info-circle me-2"></i>
          {{ searchQuery ? 'No clients match your search criteria.' : 'No clients found. Add your first client to get started!' }}
        </div>
        <button v-if="!searchQuery" class="btn btn-primary mt-3" @click="showAddModal">
          <i class="bi bi-plus"></i> Add Client
        </button>
      </div>
      
      <div v-else class="card">
        <div class="table-responsive">
          <table class="table table-hover">
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Gender</th>
                <th>Date of Birth</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="client in filteredClients" :key="client.id">
                <td>{{ client.prenom }} {{ client.nom }}</td>
                <td>{{ client.telephone }}</td>
                <td>{{ client.email || '-' }}</td>
                <td>{{ client.genre }}</td>
                <td>{{ formatDate(client.dateNaissance) }}</td>
                <td>
                  <div class="btn-group">
                    <button class="btn btn-sm btn-outline-primary me-1" @click="viewClientAppointments(client)">
                      <i class="bi bi-calendar2-check"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-secondary me-1" @click="editClient(client)">
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" @click="confirmDeleteClient(client)">
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <!-- Client Form Modal -->
      <div class="modal fade" id="clientModal" tabindex="-1" aria-hidden="true" ref="clientModal">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">{{ isEditing ? 'Edit Client' : 'Add Client' }}</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="saveClient">
                <div class="row mb-3">
                  <div class="col-md-6">
                    <label for="prenom" class="form-label">First Name</label>
                    <input type="text" class="form-control" id="prenom" v-model="clientForm.prenom" required>
                  </div>
                  <div class="col-md-6">
                    <label for="nom" class="form-label">Last Name</label>
                    <input type="text" class="form-control" id="nom" v-model="clientForm.nom" required>
                  </div>
                </div>
                
                <div class="mb-3">
                  <label for="telephone" class="form-label">Phone Number</label>
                  <input type="tel" class="form-control" id="telephone" v-model="clientForm.telephone" required>
                </div>
                
                <div class="mb-3">
                  <label for="email" class="form-label">Email (optional)</label>
                  <input type="email" class="form-control" id="email" v-model="clientForm.email">
                </div>
                
                <div class="row mb-3">
                  <div class="col-md-6">
                    <label for="genre" class="form-label">Gender</label>
                    <select class="form-select" id="genre" v-model="clientForm.genre" required>
                      <option value="Homme">Male</option>
                      <option value="Femme">Female</option>
                      <option value="Autre">Other</option>
                    </select>
                  </div>
                  <div class="col-md-6">
                    <label for="dateNaissance" class="form-label">Date of Birth</label>
                    <input type="date" class="form-control" id="dateNaissance" v-model="clientForm.dateNaissance" required>
                  </div>
                </div>
                
                <div v-if="isEditing" class="mb-3">
                  <label for="motDePasse" class="form-label">New Password (leave empty to keep current)</label>
                  <input type="password" class="form-control" id="motDePasse" v-model="clientForm.motDePasse">
                  <div class="form-text">Enter a new password only if you want to change it.</div>
                </div>
                
                <div v-else class="mb-3">
                  <label for="motDePasse" class="form-label">Password</label>
                  <input type="password" class="form-control" id="motDePasse" v-model="clientForm.motDePasse" required>
                </div>
                
                <div class="d-flex justify-content-end">
                  <button type="button" class="btn btn-secondary me-2" @click="closeModal">
                    Cancel
                  </button>
                  <button type="submit" class="btn btn-primary" :disabled="saving">
                    <span v-if="saving" class="spinner-border spinner-border-sm me-1"></span>
                    {{ isEditing ? 'Update' : 'Add' }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Appointments Modal -->
      <div class="modal fade" id="appointmentsModal" tabindex="-1" aria-hidden="true" ref="appointmentsModal">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">{{ selectedClient ? `${selectedClient.prenom} ${selectedClient.nom}'s Appointments` : 'Appointments' }}</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <div v-if="loadingAppointments" class="text-center py-4">
                <Loader message="Loading appointments..." />
              </div>
              
              <div v-else-if="appointmentsError" class="alert alert-danger">
                {{ appointmentsError }}
                <button class="btn btn-sm btn-outline-danger ms-2" @click="loadClientAppointments">
                  <i class="bi bi-arrow-clockwise"></i> Retry
                </button>
              </div>
              
              <div v-else-if="clientAppointments.length === 0" class="text-center py-4">
                <div class="alert alert-info">
                  <i class="bi bi-info-circle me-2"></i>
                  This client has no appointments.
                </div>
                <button class="btn btn-primary mt-2" @click="createAppointmentForClient">
                  <i class="bi bi-plus"></i> Create Appointment
                </button>
              </div>
              
              <div v-else>
                <div class="table-responsive">
                  <table class="table table-hover">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Barber</th>
                        <th>Service</th>
                        <th>Status</th>
                        <th>Price</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr 
                        v-for="appointment in clientAppointments" 
                        :key="appointment.id"
                        :class="getStatusClass(appointment.statut)"
                      >
                        <td>{{ formatDate(appointment.date) }}</td>
                        <td>{{ formatTime(appointment.date) }}</td>
                        <td>{{ getBarbierName(appointment.BarbierId) }}</td>
                        <td>{{ getServiceName(appointment.ServiceId) }}</td>
                        <td>
                          <span :class="getStatusBadgeClass(appointment.statut)">
                            {{ appointment.statut }}
                          </span>
                        </td>
                        <td>{{ getServicePrice(appointment.ServiceId) }} CAD</td>
                        <td>
                          <button class="btn btn-sm btn-outline-primary" @click="updateAppointmentStatus(appointment)">
                            <i class="bi bi-pencil-fill"></i>
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                <div class="d-flex justify-content-end mt-3">
                  <button class="btn btn-primary" @click="createAppointmentForClient">
                    <i class="bi bi-plus"></i> Create New Appointment
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Delete Confirmation Modal -->
      <ConfirmModal
        ref="deleteModal"
        title="Confirm Deletion"
        message="Are you sure you want to delete this client? This will also delete all their appointments. This action cannot be undone."
        confirm-button-text="Delete"
        confirm-button-variant="danger"
        @confirm="deleteClient"
      />
      
      <!-- Status Update Modal -->
      <div class="modal fade" id="statusUpdateModal" tabindex="-1" aria-hidden="true" ref="statusUpdateModal">
        <div class="modal-dialog modal-sm">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Update Appointment Status</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="saveAppointmentStatus">
                <div class="mb-3">
                  <label for="appointmentStatus" class="form-label">Status</label>
                  <select 
                    class="form-select" 
                    id="appointmentStatus" 
                    v-model="appointmentStatusForm.statut"
                    required
                  >
                    <option value="confirmé">Confirmed</option>
                    <option value="annulé">Cancelled</option>
                    <option value="terminé">Completed</option>
                  </select>
                </div>
                
                <div class="d-grid gap-2">
                  <button type="submit" class="btn btn-primary" :disabled="updatingStatus">
                    <span v-if="updatingStatus" class="spinner-border spinner-border-sm me-1"></span>
                    Update Status
                  </button>
                  <button type="button" class="btn btn-outline-secondary" @click="closeStatusUpdateModal">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, computed, onMounted } from 'vue'
  import { useStore } from 'vuex'
  import { useRouter } from 'vue-router'
  import { Modal } from 'bootstrap'
  import { formatDate, formatTime } from '@/utils/format'
  import Loader from '@/components/common/Loader.vue'
  import ConfirmModal from '@/components/common/ConfirmModal.vue'
  import { notify } from '@/utils/notification'
  
  export default {
    name: 'ClientsView',
    components: {
      Loader,
      ConfirmModal
    },
    setup() {
      const store = useStore()
      const router = useRouter()
      const clientModal = ref(null)
      const appointmentsModal = ref(null)
      const deleteModal = ref(null)
      const statusUpdateModal = ref(null)
      const searchQuery = ref('')
      const selectedClient = ref(null)
      const clientToDelete = ref(null)
      const isEditing = ref(false)
      const saving = ref(false)
      const loadingAppointments = ref(false)
      const appointmentsError = ref(null)
      const clientAppointments = ref([])
      const appointmentStatusForm = ref({
        statut: 'confirmé',
        appointmentId: null
      })
      const updatingStatus = ref(false)
      
      const clientForm = ref({
        prenom: '',
        nom: '',
        telephone: '',
        email: '',
        genre: 'Homme',
        dateNaissance: '',
        motDePasse: ''
      })
      
      const loading = computed(() => store.getters['clients/loading'])
      const error = computed(() => store.getters['clients/error'])
      const clients = computed(() => store.getters['clients/clients'])
      const barbiers = computed(() => store.getters['barbiers/barbiers'])
      const services = computed(() => store.getters['services/allServices'])
      
      const filteredClients = computed(() => {
        if (!searchQuery.value) return clients.value
        
        const query = searchQuery.value.toLowerCase()
        return clients.value.filter(client => 
          client.nom.toLowerCase().includes(query) || 
          client.prenom.toLowerCase().includes(query) || 
          client.telephone.includes(query)
        )
      })
      
      onMounted(async () => {
        await Promise.all([
          loadClients(),
          store.dispatch('barbiers/fetchBarbiers'),
          store.dispatch('services/fetchAllServices')
        ])
      })
      
      const loadClients = async () => {
        try {
          await store.dispatch('clients/fetchClients')
        } catch (error) {
          console.error('Error loading clients:', error)
        }
      }
      
      const showAddModal = () => {
        isEditing.value = false
        clientForm.value = {
          prenom: '',
          nom: '',
          telephone: '',
          email: '',
          genre: 'Homme',
          dateNaissance: '',
          motDePasse: ''
        }
        
        const modal = new Modal(clientModal.value)
        modal.show()
      }
      
      const editClient = (client) => {
        isEditing.value = true
        selectedClient.value = client
        clientForm.value = {
          ...client,
          dateNaissance: client.dateNaissance ? new Date(client.dateNaissance).toISOString().split('T')[0] : '',
          motDePasse: '' // Clear password field when editing
        }
        
        const modal = new Modal(clientModal.value)
        modal.show()
      }
      
      const closeModal = () => {
        const modal = Modal.getInstance(clientModal.value)
        if (modal) {
          modal.hide()
        }
      }
      
      const saveClient = async () => {
        saving.value = true
        
        try {
          const clientData = { ...clientForm.value }
          
          // If editing and no new password provided, remove the password field
          if (isEditing.value && !clientData.motDePasse) {
            delete clientData.motDePasse
          }
          
          if (isEditing.value) {
            await store.dispatch('clients/updateClient', {
              id: selectedClient.value.id,
              data: clientData
            })
            notify.success('Client updated successfully')
          } else {
            await store.dispatch('clients/createClient', clientData)
            notify.success('Client created successfully')
          }
          
          closeModal()
          loadClients() // Reload clients after saving
        } catch (error) {
          console.error('Error saving client:', error)
          // Check for specific error messages
          if (error.message && error.message.includes('phone number already exists')) {
            notify.error('This phone number is already registered. Please use a different phone number.')
          } else {
            notify.error(error.message || 'Error saving client information')
          }
        } finally {
          saving.value = false
        }
      }
      
      const confirmDeleteClient = (client) => {
        clientToDelete.value = client
        deleteModal.value.show()
      }
      
      const deleteClient = async () => {
        if (clientToDelete.value) {
          try {
            await store.dispatch('clients/deleteClient', clientToDelete.value.id)
            notify.success('Client deleted successfully')
          } catch (error) {
            console.error('Error deleting client:', error)
            if (error.message && error.message.includes('upcoming appointments')) {
              notify.error('Cannot delete client with upcoming appointments. Please cancel all appointments first.')
            } else {
              notify.error(error.message || 'Error deleting client')
            }
          }
        }
      }
      
      const viewClientAppointments = async (client) => {
        selectedClient.value = client
        
        const modal = new Modal(appointmentsModal.value)
        modal.show()
        
        await loadClientAppointments()
      }
      
      const loadClientAppointments = async () => {
        if (!selectedClient.value) return
        
        loadingAppointments.value = true
        appointmentsError.value = null
        
        try {
          const appointments = await store.dispatch('clients/fetchClientAppointments', selectedClient.value.id)
          clientAppointments.value = appointments || []
        } catch (error) {
          console.error('Error loading client appointments:', error)
          appointmentsError.value = 'Failed to load appointments'
        } finally {
          loadingAppointments.value = false
        }
      }
      
      const createAppointmentForClient = () => {
        // Close the current modal
        const modal = Modal.getInstance(appointmentsModal.value)
        if (modal) {
          modal.hide()
        }
        
        // Navigate to appointments page with client pre-selected
        router.push({
          path: '/appointments',
          query: { clientId: selectedClient.value.id, action: 'new' }
        })
      }
      
      const getBarbierName = (barbierId) => {
        const barbier = barbiers.value.find(b => b.id === barbierId)
        return barbier ? barbier.nom : 'Unknown'
      }
      
      const getServiceName = (serviceId) => {
        const service = services.value.find(s => s.id === serviceId)
        return service ? service.nom : 'Unknown'
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
      
      const updateAppointmentStatus = (appointment) => {
        // Set the current appointment status form data
        appointmentStatusForm.value = {
          statut: appointment.statut,
          appointmentId: appointment.id
        }
        
        // Show the modal
        const modal = new Modal(statusUpdateModal.value)
        modal.show()
      }
      
      const saveAppointmentStatus = async () => {
        updatingStatus.value = true
        
        try {
          await store.dispatch('appointments/updateAppointmentStatus', {
            id: appointmentStatusForm.value.appointmentId,
            status: appointmentStatusForm.value.statut
          })
          notify.success('Appointment status updated successfully')
          closeStatusUpdateModal()
          loadClientAppointments() // Reload appointments after updating
        } catch (error) {
          console.error('Error updating appointment status:', error)
          notify.error(error.message || 'Error updating appointment status')
        } finally {
          updatingStatus.value = false
        }
      }
      
      const closeStatusUpdateModal = () => {
        const modal = Modal.getInstance(statusUpdateModal.value)
        if (modal) {
          modal.hide()
        }
      }
      
      return {
        searchQuery,
        loading,
        error,
        clients,
        filteredClients,
        clientModal,
        appointmentsModal,
        deleteModal,
        statusUpdateModal,
        selectedClient,
        isEditing,
        saving,
        clientForm,
        loadingAppointments,
        appointmentsError,
        clientAppointments,
        appointmentStatusForm,
        updatingStatus,
        formatDate,
        formatTime,
        loadClients,
        showAddModal,
        editClient,
        closeModal,
        saveClient,
        confirmDeleteClient,
        deleteClient,
        viewClientAppointments,
        loadClientAppointments,
        createAppointmentForClient,
        getBarbierName,
        getServiceName,
        getServicePrice,
        getStatusClass,
        getStatusBadgeClass,
        updateAppointmentStatus,
        saveAppointmentStatus,
        closeStatusUpdateModal
      }
    }
  }
  </script>