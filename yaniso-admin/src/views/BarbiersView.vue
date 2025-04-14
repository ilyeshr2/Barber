<!--src/views/BarbiersView.vue -->
<template>
    <div class="barbiers-view">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h1>Gestion des Barbiers</h1>
        <button class="btn btn-primary" @click="showAddModal">
          <i class="bi bi-plus"></i> Ajouter un Barbier
        </button>
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
        <div class="row">
          <div v-for="barbier in barbiers" :key="barbier.id" class="col-md-4 mb-4">
            <BarbierCard 
              :barbier="barbier" 
              @edit="editBarbier" 
              @delete="confirmDeleteBarbier"
              @view-services="viewBarbierServices"
            />
          </div>
        </div>
      </div>
      
    <!-- Barbier Form Modal -->
    <div class="modal fade" id="barbierModal" tabindex="-1" aria-hidden="true" ref="barbierModal">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ isEditing ? 'Modifier Barbier' : 'Ajouter Barbier' }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <BarbierForm 
              :barbier="currentBarbier || {
                nom: '',
                photoUrl: '',
                note: 5.0,
                nombreAvis: 0,
                salonId: 1
              }" 
              :is-editing="isEditing" 
              @submit="saveBarbier" 
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
        message="Êtes-vous sûr de vouloir supprimer ce barbier? Cette action est irréversible."
        confirm-button-text="Supprimer"
        confirm-button-variant="danger"
        @confirm="deleteBarbier"
      />
    </div>
  </template>
  
  <script>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { Modal } from 'bootstrap'
import BarbierCard from '@/components/barbiers/BarbierCard.vue'
import BarbierForm from '@/components/barbiers/BarbierForm.vue'
import ConfirmModal from '@/components/common/ConfirmModal.vue'

export default {
  name: 'BarbiersView',
  components: {
    BarbierCard,
    BarbierForm,
    ConfirmModal
  },
  setup() {
      const store = useStore()
      const router = useRouter()
      const barbierModal = ref(null)
      const deleteModal = ref(null)
      const currentBarbier = ref(null)
      const barbierToDelete = ref(null)
      const isEditing = ref(false)
      
      const loading = computed(() => store.getters['barbiers/loading'])
      const error = computed(() => store.getters['barbiers/error'])
      const barbiers = computed(() => store.getters['barbiers/barbiers'])
      
      onMounted(async () => {
        await store.dispatch('barbiers/fetchBarbiers')
      })
      
      const showAddModal = () => {
        isEditing.value = false
        currentBarbier.value = {
          nom: '',
          photoUrl: '',
          note: 5.0,
          nombreAvis: 0,
          salonId: 1
        }
        
        const modal = new Modal(barbierModal.value)
        modal.show()
      }
      
      const editBarbier = (barbier) => {
        isEditing.value = true
        currentBarbier.value = { ...barbier }
        
        const modal = new Modal(barbierModal.value)
        modal.show()
      }
      
      const closeModal = () => {
        const modal = Modal.getInstance(barbierModal.value)
        if (modal) {
          modal.hide()
        }
      }
      
      const saveBarbier = async (barbierData) => {
        try {
          if (isEditing.value) {
            await store.dispatch('barbiers/updateBarbier', {
              id: currentBarbier.value.id,
              data: barbierData
            })
          } else {
            await store.dispatch('barbiers/createBarbier', barbierData)
          }
          
          closeModal()
        } catch (error) {
          console.error('Error saving barbier:', error)
        }
      }
      
      const confirmDeleteBarbier = (barbier) => {
        barbierToDelete.value = barbier
        deleteModal.value.show()
      }
      
      const deleteBarbier = async () => {
        if (barbierToDelete.value) {
          try {
            await store.dispatch('barbiers/deleteBarbier', barbierToDelete.value.id)
          } catch (error) {
            console.error('Error deleting barbier:', error)
          }
        }
      }
      
      const viewBarbierServices = (barbierId) => {
      router.push(`/barbiers/${barbierId}/services`)
    }
      
      return {
        barbierModal,
        deleteModal,
        currentBarbier,
        isEditing,
        loading,
        error,
        barbiers,
        showAddModal,
        editBarbier,
        closeModal,
        saveBarbier,
        confirmDeleteBarbier,
        deleteBarbier,
        viewBarbierServices
      }
    }
  }
  </script>