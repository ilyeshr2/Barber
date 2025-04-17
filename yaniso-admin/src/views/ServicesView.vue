<!--src/views/ServicesView.vue -->
<template>
    <div class="services-view">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h1>Gestion des Services</h1>
        <button class="btn btn-primary" @click="showAddModal">
          <i class="bi bi-plus"></i> Ajouter un Service
        </button>
      </div>
      
      <div class="mb-4">
        <div class="input-group">
          <span class="input-group-text">Filtrer par barbier</span>
          <select class="form-select" v-model="selectedBarbierId">
            <option value="">Tous les services</option>
            <option v-for="barbier in barbiers" :key="barbier.id" :value="barbier.id">
              {{ barbier.nom }}
            </option>
          </select>
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
        <div class="table-responsive">
          <table class="table table-hover">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Durée (min)</th>
                <th>Prix (CAD)</th>
                <th>Barbiers</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="service in filteredServices" :key="service.id">
                <td>{{ service.nom }}</td>
                <td>{{ service.duree }}</td>
                <td>{{ service.prix }} CAD</td>
                <td>
                  <div v-if="service.BarberIds && service.BarberIds.length > 0" class="dropdown">
                    <button class="btn btn-sm btn-info dropdown-toggle" type="button" :id="`barberDropdown-${service.id}`" data-bs-toggle="dropdown" aria-expanded="false">
                      {{ service.BarberIds.length }} Barbier(s)
                    </button>
                    <ul class="dropdown-menu" :aria-labelledby="`barberDropdown-${service.id}`">
                      <li v-for="barberId in service.BarberIds" :key="barberId">
                        <span class="dropdown-item">{{ getBarbierName(barberId) }}</span>
                      </li>
                    </ul>
                  </div>
                  <div v-else-if="service.BarberId">
                    <span class="badge bg-info text-dark">
                      {{ getBarbierName(service.BarberId) }}
                    </span>
                  </div>
                  <span v-else class="text-muted">Non assigné</span>
                </td>
                <td>
                  <button class="btn btn-sm btn-outline-secondary me-1" @click="editService(service)">
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button class="btn btn-sm btn-outline-danger" @click="confirmDeleteService(service)">
                    <i class="bi bi-trash"></i>
                  </button>
                </td>
              </tr>
              <tr v-if="filteredServices.length === 0">
                <td colspan="5" class="text-center">Aucun service trouvé</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <!-- Service Form Modal -->
      <div class="modal fade" id="serviceModal" tabindex="-1" aria-hidden="true" ref="serviceModal">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">{{ isEditing ? 'Modifier Service' : 'Ajouter Service' }}</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <ServiceForm 
                :service="currentService" 
                :is-editing="isEditing"
                :barbiers="barbiers"
                @submit="saveService" 
                @cancel="closeModal"
              />
            </div>
          </div>
        </div>
      </div>
      
      <!-- Delete Confirmation Modal -->
      <ConfirmModal
        ref="deleteModal"
        title="Confirmation de suppression"
        message="Êtes-vous sûr de vouloir supprimer ce service? Cette action est irréversible."
        confirm-button-text="Supprimer"
        confirm-button-variant="danger"
        @confirm="deleteService"
      />
    </div>
  </template>
  
  <script>
  import { ref, computed, onMounted } from 'vue'
  import { useStore } from 'vuex'
  import { Modal } from 'bootstrap'
  import ServiceForm from '@/components/services/ServiceForm.vue'
  import ConfirmModal from '@/components/common/ConfirmModal.vue'
  
  export default {
    name: 'ServicesView',
    components: {
      ServiceForm,
      ConfirmModal
    },
    setup() {
      const store = useStore()
      const serviceModal = ref(null)
      const deleteModal = ref(null)
      const currentService = ref(null)
      const serviceToDelete = ref(null)
      const isEditing = ref(false)
      const selectedBarbierId = ref('')
      
      const loading = computed(() => store.getters['services/loading'])
      const error = computed(() => store.getters['services/error'])
      const services = computed(() => store.getters['services/allServices'])
      const barbiers = computed(() => store.getters['barbiers/barbiers'])
      
      const filteredServices = computed(() => {
        if (!selectedBarbierId.value) {
          return services.value
        }
        return services.value.filter(service => service.BarberIds && service.BarberIds.includes(parseInt(selectedBarbierId.value)))
      })
      
      onMounted(async () => {
        await store.dispatch('barbiers/fetchBarbiers')
        await store.dispatch('services/fetchAllServices')
      })
      
      const showAddModal = () => {
        isEditing.value = false
        currentService.value = {
          nom: '',
          duree: 30,
          prix: 500,
          BarberIds: barbiers.value.length > 0 ? [barbiers.value[0].id] : []
        }
        
        const modal = new Modal(serviceModal.value)
        modal.show()
      }
      
      const editService = (service) => {
        isEditing.value = true
        currentService.value = { ...service }
        
        const modal = new Modal(serviceModal.value)
        modal.show()
      }
      
      const closeModal = () => {
        const modal = Modal.getInstance(serviceModal.value)
        if (modal) {
          modal.hide()
        }
      }
      
      const saveService = async (serviceData) => {
        try {
          if (isEditing.value) {
            await store.dispatch('services/updateService', {
              id: currentService.value.id,
              data: serviceData
            })
          } else {
            await store.dispatch('services/createService', serviceData)
          }
          
          closeModal()
        } catch (error) {
          console.error('Error saving service:', error)
        }
      }
      
      const confirmDeleteService = (service) => {
        serviceToDelete.value = service
        deleteModal.value.show()
      }
      
      const deleteService = async () => {
        if (serviceToDelete.value) {
          try {
            await store.dispatch('services/deleteService', serviceToDelete.value.id)
          } catch (error) {
            console.error('Error deleting service:', error)
          }
        }
      }
      
      const getBarbierName = (barbierId) => {
        const barbier = barbiers.value.find(b => b.id === barbierId)
        return barbier ? barbier.nom : 'Inconnu'
      }
      
      return {
        serviceModal,
        deleteModal,
        currentService,
        isEditing,
        loading,
        error,
        services,
        barbiers,
        selectedBarbierId,
        filteredServices,
        showAddModal,
        editService,
        closeModal,
        saveService,
        confirmDeleteService,
        deleteService,
        getBarbierName
      }
    }
  }
  </script>

<style scoped>
.barber-badge {
  display: inline-block;
}

.badge {
  font-size: 0.8rem;
  font-weight: normal;
}

.table td {
  vertical-align: middle;
}
</style>