<!--src/views/BarbierServicesView.vue -->
<template>
  <div class="barber-services-view">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1>Services for {{ barbier ? barbier.nom : 'Loading...' }}</h1>
      <div>
        <button class="btn btn-outline-secondary me-2" @click="goBack">
          <i class="bi bi-arrow-left"></i> Back to Barbers
        </button>
        <button class="btn btn-primary" @click="showAddModal" :disabled="!barbier">
          <i class="bi bi-plus"></i> Add Service
        </button>
      </div>
    </div>
    
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>
    
    <div v-else-if="error" class="alert alert-danger">
      {{ error }}
      <button class="btn btn-sm btn-outline-danger ms-2" @click="loadBarbierAndServices">
        <i class="bi bi-arrow-clockwise"></i> Retry
      </button>
    </div>
    
    <div v-else-if="!barbier" class="alert alert-warning">
      Barber not found. The barber may have been deleted.
      <button class="btn btn-outline-secondary ms-3" @click="goBack">Go Back</button>
    </div>
      
      <div v-else>
    <!-- Barber Info Card -->
    <div class="card mb-4">
      <div class="row g-0">
        <div class="col-md-2">
          <img 
            :src="getBarbierImage()" 
            class="img-fluid rounded-start" 
            alt="Barber photo"
            style="height: 150px; width: 100%; object-fit: cover;"
          >
        </div>
        <div class="col-md-10">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
              <h4 class="card-title mb-0">{{ barbier ? barbier.nom : 'Unknown Barber' }}</h4>
              <div v-if="barbier">
                <span class="badge bg-warning text-dark me-2">
                  {{ (barbier.note !== null && barbier.note !== undefined) ? barbier.note.toFixed(1) : '0.0' }} <i class="bi bi-star-fill"></i>
                </span>
                <span class="text-muted">{{ barbier.nombreAvis }} reviews</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
        
        <!-- Services List -->
        <div class="card">
          <div class="card-header">
            <h5 class="mb-0">Services</h5>
          </div>
          <div class="card-body">
            <div v-if="loadingServices" class="text-center py-4">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
              <p class="mt-2 text-muted">Loading services...</p>
            </div>
            
            <div v-else-if="servicesError" class="alert alert-danger">
              {{ servicesError }}
              <button class="btn btn-sm btn-outline-danger ms-2" @click="loadBarbierServices">
                <i class="bi bi-arrow-clockwise"></i> Retry
              </button>
            </div>
            
            <div v-else-if="services.length === 0" class="text-center py-4">
              <div class="alert alert-info">
                <i class="bi bi-info-circle me-2"></i>
                This barber has no services. Add a service using the button above.
              </div>
            </div>
            
            <div v-else class="table-responsive">
              <table class="table table-hover">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Duration (min)</th>
                    <th>Price (DA)</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="service in services" :key="service.id">
                    <td>{{ service.nom }}</td>
                    <td>{{ service.duree }}</td>
                    <td>{{ service.prix }}</td>
                    <td>
                      <button class="btn btn-sm btn-outline-secondary me-1" @click="editService(service)">
                        <i class="bi bi-pencil"></i>
                      </button>
                      <button class="btn btn-sm btn-outline-danger" @click="confirmDeleteService(service)">
                        <i class="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      
    <!-- Service Form Modal -->
    <div class="modal fade" id="serviceModal" tabindex="-1" aria-hidden="true" ref="serviceModal">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ isEditing ? 'Edit Service' : 'Add Service' }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <ServiceForm 
              :service="currentService" 
              :is-editing="isEditing"
              :barbiers="barbier ? [barbier] : []"
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
        title="Confirm Deletion"
        message="Are you sure you want to delete this service? This action cannot be undone."
        confirm-button-text="Delete"
        confirm-button-variant="danger"
        @confirm="deleteService"
      />
    </div>
  </template>
  
  <script>
  import { ref, computed, onMounted } from 'vue'
  import { useStore } from 'vuex'
  import { useRoute, useRouter } from 'vue-router'
  import { Modal } from 'bootstrap'
  import ServiceForm from '@/components/services/ServiceForm.vue'
  import ConfirmModal from '@/components/common/ConfirmModal.vue'
  import Loader from '@/components/common/Loader.vue'
  import { formatBarberImageUrl } from '@/utils/imageHelpers'
  
  export default {
    name: 'BarbierServicesView',
    components: {
      ServiceForm,
      ConfirmModal,
      Loader
    },
    setup() {
      const store = useStore()
      const route = useRoute()
      const router = useRouter()
      const serviceModal = ref(null)
      const deleteModal = ref(null)
      const currentService = ref(null)
      const serviceToDelete = ref(null)
      const isEditing = ref(false)
      
      const barbierId = computed(() => parseInt(route.params.id))

      
      const loading = computed(() => store.getters['barbiers/loading'])
      const error = computed(() => store.getters['barbiers/error'])
      const barbier = computed(() => store.getters['barbiers/currentBarbier'] || null)
      
      const loadingServices = computed(() => store.getters['services/loading'])
      const servicesError = computed(() => store.getters['services/error'])
      const services = computed(() => store.getters['services/barbierServices'](barbierId.value) || [])
      
      onMounted(() => {
        loadBarbierAndServices()
      })
      
      const loadBarbierAndServices = async () => {
        try {
          await store.dispatch('barbiers/fetchBarbierById', barbierId.value)
          await loadBarbierServices()
        } catch (error) {
          console.error('Error loading barber and services:', error)
        }
      }
      
      const loadBarbierServices = async () => {
        try {
          await store.dispatch('services/fetchBarbierServices', barbierId.value)
        } catch (error) {
          console.error('Error loading barber services:', error)
        }
      }
      
      const goBack = () => {
        router.push('/barbiers')
      }
      
      const getBarbierImage = () => {
        if (!barbier.value) return '/images/default-barber.jpg'
        return formatBarberImageUrl(barbier.value, barbierId.value)
      }
      
      const showAddModal = () => {
        if (!barbier.value) return
        
        isEditing.value = false
        currentService.value = {
          nom: '',
          duree: 30,
          prix: 500,
          BarberId: barbier.value.id
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
      
      return {
        barbierId,
        loading,
        error,
        barbier,
        loadingServices,
        servicesError,
        services,
        serviceModal,
        deleteModal,
        currentService,
        isEditing,
        loadBarbierAndServices,
        loadBarbierServices,
        goBack,
        getBarbierImage,
        showAddModal,
        editService,
        closeModal,
        saveService,
        confirmDeleteService,
        deleteService
      }
    }
  }
  </script>