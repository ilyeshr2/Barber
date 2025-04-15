// src/views/PublicationsView.vue - NEW FILE
<template>
  <div class="publications-view">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1>Gestion des Publications</h1>
      <button class="btn btn-primary" @click="showCreateModal">
        <i class="bi bi-plus"></i> Nouvelle Publication
      </button>
    </div>
    
    <div v-if="loading" class="text-center py-5">
      <Loader message="Chargement des publications..." />
    </div>
    
    <div v-else-if="error" class="alert alert-danger">
      {{ error }}
      <button class="btn btn-sm btn-outline-danger ms-2" @click="loadPublications">
        <i class="bi bi-arrow-clockwise"></i> Réessayer
      </button>
    </div>
    
    <div v-else-if="publications.length === 0" class="text-center p-4">
      <div class="alert alert-info">
        <i class="bi bi-info-circle me-2"></i>
        Aucune publication trouvée. Créez votre première publication pour commencer!
      </div>
      <button class="btn btn-primary mt-3" @click="showCreateModal">
        <i class="bi bi-plus"></i> Nouvelle Publication
      </button>
    </div>
    
    <div v-else class="row">
      <div v-for="publication in publications" :key="publication.id" class="col-md-6 col-lg-4 mb-4">
        <div class="card h-100">
          <div class="card-img-container">
            <img :src="formatPublicationImageUrl(publication)" class="card-img-top" alt="Publication image">
            <div class="publication-date">
              {{ formatPublicationDate(publication.createdAt) }}
            </div>
          </div>
          <div class="card-body">
            <div v-if="publication.title" class="card-title h5">{{ publication.title }}</div>
            <p v-if="publication.description" class="card-text">{{ truncateText(publication.description, 100) }}</p>
            <div v-if="publication.reactions" class="mb-2">
              <span class="badge bg-light text-dark me-1">{{ publication.reactions }}</span>
            </div>
            <div class="d-flex align-items-center mb-3">
              <img 
                :src="formatImageUrl(publication.author_image, '/images/default-avatar.jpg')" 
                class="rounded-circle me-2" 
                alt="Author avatar"
                style="width: 30px; height: 30px; object-fit: cover;"
              >
              <span class="text-muted small">{{ publication.author_name }}</span>
            </div>
          </div>
          <div class="card-footer bg-white border-top-0">
            <div class="d-flex justify-content-between">
              <button class="btn btn-sm btn-outline-primary" @click="viewPublication(publication)">
                <i class="bi bi-eye me-1"></i> Voir
              </button>
              <div>
                <button class="btn btn-sm btn-outline-secondary me-1" @click="editPublication(publication)">
                  <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" @click="confirmDeletePublication(publication)">
                  <i class="bi bi-trash"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Publication Form Modal -->
    <div class="modal fade" id="publicationModal" tabindex="-1" aria-hidden="true" ref="publicationModal">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ isEditing ? 'Modifier la Publication' : 'Nouvelle Publication' }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="savePublication">
              <div class="mb-3">
                <label for="title" class="form-label">Titre (optionnel)</label>
                <input 
                  type="text" 
                  class="form-control" 
                  id="title" 
                  v-model="publicationForm.title"
                  placeholder="Titre de la publication"
                >
              </div>
              
              <div class="mb-3">
                <label for="description" class="form-label">Description (optionnel)</label>
                <textarea 
                  class="form-control" 
                  id="description" 
                  v-model="publicationForm.description"
                  rows="4"
                  placeholder="Description de la publication"
                ></textarea>
              </div>
              
              <div class="mb-3">
                <label for="reactions" class="form-label">Réactions (optionnel)</label>
                <input 
                  type="text" 
                  class="form-control" 
                  id="reactions" 
                  v-model="publicationForm.reactions"
                  placeholder="Emojis (ex: 🔥 💈)"
                >
                <div class="form-text">Ajoutez des emojis qui apparaîtront sur l'image</div>
              </div>
              
              <div class="mb-3">
                <label for="publicationImage" class="form-label">Image</label>
                <div v-if="publicationForm.image_url" class="mb-3">
                  <img 
                    :src="publicationForm.image_url" 
                    alt="Publication image" 
                    class="img-fluid mb-2" 
                    style="max-height: 200px; width: auto;"
                  >
                </div>
                <input 
                  type="file" 
                  class="form-control" 
                  id="publicationImage" 
                  @change="handleImageUpload"
                  accept="image/*"
                >
              </div>
              
              <div class="mb-3">
                <label for="authorName" class="form-label">Nom de l'auteur</label>
                <input 
                  type="text" 
                  class="form-control" 
                  id="authorName" 
                  v-model="publicationForm.author_name"
                  required
                >
              </div>
              
              <div class="mb-3">
                <label for="authorImage" class="form-label">Image de l'auteur</label>
                <div v-if="publicationForm.author_image" class="mb-2">
                  <img 
                    :src="publicationForm.author_image" 
                    alt="Author image" 
                    class="img-thumbnail me-2" 
                    style="height: 50px; width: 50px; object-fit: cover;"
                  >
                </div>
                <input 
                  type="file" 
                  class="form-control" 
                  id="authorImage" 
                  @change="handleAuthorImageUpload"
                  accept="image/*"
                >
              </div>
              
              <div class="d-flex justify-content-end">
                <button type="button" class="btn btn-secondary me-2" @click="closeModal">
                  Annuler
                </button>
                <button type="submit" class="btn btn-primary" :disabled="saving">
                  <span v-if="saving" class="spinner-border spinner-border-sm me-1"></span>
                  {{ isEditing ? 'Mettre à jour' : 'Publier' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Publication View Modal -->
    <div class="modal fade" id="viewPublicationModal" tabindex="-1" aria-hidden="true" ref="viewPublicationModal">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ currentPublication?.title || 'Publication' }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div v-if="currentPublication" class="publication-details">
              <img 
                :src="formatPublicationImageUrl(currentPublication)" 
                alt="Publication image" 
                class="img-fluid rounded mb-3"
              >
              
              <div v-if="currentPublication.reactions" class="mb-3">
                <span class="fs-4">{{ currentPublication.reactions }}</span>
              </div>
              
              <h4 v-if="currentPublication.title" class="mb-3">{{ currentPublication.title }}</h4>
              
              <p v-if="currentPublication.description" class="mb-4">{{ currentPublication.description }}</p>
              
              <div class="d-flex align-items-center mb-3">
                <img 
                  :src="formatImageUrl(currentPublication.author_image, '/images/default-avatar.jpg')" 
                  class="rounded-circle me-2" 
                  alt="Author avatar"
                  style="width: 40px; height: 40px; object-fit: cover;"
                >
                <div>
                  <div class="fw-bold">{{ currentPublication.author_name }}</div>
                  <div class="text-muted small">{{ formatPublicationDate(currentPublication.createdAt) }}</div>
                </div>
              </div>
              
              <div class="d-flex justify-content-center mt-4">
                <button class="btn btn-outline-secondary me-2" data-bs-dismiss="modal">Fermer</button>
                <button class="btn btn-outline-primary me-2" @click="editPublication(currentPublication)">
                  <i class="bi bi-pencil me-1"></i> Modifier
                </button>
                <button class="btn btn-outline-danger" @click="confirmDeletePublication(currentPublication)">
                  <i class="bi bi-trash me-1"></i> Supprimer
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
      title="Confirmation de suppression"
      message="Êtes-vous sûr de vouloir supprimer cette publication? Cette action est irréversible."
      confirm-button-text="Supprimer"
      confirm-button-variant="danger"
      @confirm="deletePublication"
    />
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { Modal } from 'bootstrap'
import Loader from '@/components/common/Loader.vue'
import ConfirmModal from '@/components/common/ConfirmModal.vue'
import { notify } from '@/utils/notification'
import { formatDate } from '@/utils/format'
import { formatPublicationImageUrl, formatImageUrl } from '@/utils/imageHelpers'

export default {
  name: 'PublicationsView',
  components: {
    Loader,
    ConfirmModal
  },
  setup() {
    const store = useStore()
    const publicationModal = ref(null)
    const viewPublicationModal = ref(null)
    const deleteModal = ref(null)
    const currentPublication = ref(null)
    const publicationToDelete = ref(null)
    const isEditing = ref(false)
    const saving = ref(false)
    const publicationImageFile = ref(null)
    const authorImageFile = ref(null)
    
    const publicationForm = ref({
      title: '',
      description: '',
      reactions: '',
      image_url: '',
      author_name: '',
      author_image: ''
    })
    
    const loading = computed(() => store.getters['publications/loading'])
    const error = computed(() => store.getters['publications/error'])
    const publications = computed(() => store.getters['publications/publications'])
    
    onMounted(() => {
      loadPublications()
    })
    
    const loadPublications = async () => {
      try {
        await store.dispatch('publications/fetchPublications')
      } catch (error) {
        console.error('Error loading publications:', error)
      }
    }
    
    const showCreateModal = () => {
      resetForm()
      isEditing.value = false
      
      // Set default author (could be the logged in user)
      const user = store.getters['auth/user']
      if (user) {
        publicationForm.value.author_name = `${user.prenom} ${user.nom}`
      }
      
      const modal = new Modal(publicationModal.value)
      modal.show()
    }
    
    const viewPublication = (publication) => {
      currentPublication.value = publication
      
      const modal = new Modal(viewPublicationModal.value)
      modal.show()
    }
    
    const editPublication = (publication) => {
      isEditing.value = true
      currentPublication.value = publication
      
      // Close view modal if it's open
      const viewModal = Modal.getInstance(viewPublicationModal.value)
      if (viewModal) {
        viewModal.hide()
      }
      
      // Populate the form
      publicationForm.value = {
        title: publication.title || '',
        description: publication.description || '',
        reactions: publication.reactions || '',
        image_url: publication.image_url || '',
        author_name: publication.author_name || '',
        author_image: publication.author_image || ''
      }
      
      const modal = new Modal(publicationModal.value)
      modal.show()
    }
    
    const closeModal = () => {
      const modal = Modal.getInstance(publicationModal.value)
      if (modal) {
        modal.hide()
      }
    }
    
    const resetForm = () => {
      publicationForm.value = {
        title: '',
        description: '',
        reactions: '',
        image_url: '',
        author_name: '',
        author_image: ''
      }
      publicationImageFile.value = null
      authorImageFile.value = null
    }
    
    const savePublication = async () => {
      saving.value = true
      
      try {
        // Create FormData for file uploads
        const formData = new FormData()
        formData.append('title', publicationForm.value.title)
        formData.append('description', publicationForm.value.description)
        formData.append('reactions', publicationForm.value.reactions)
        formData.append('author_name', publicationForm.value.author_name)
        
        // Add image files if selected
        if (publicationImageFile.value) {
          formData.append('image', publicationImageFile.value)
        }
        
        if (authorImageFile.value) {
          formData.append('authorImage', authorImageFile.value)
        }
        
        if (isEditing.value) {
          await store.dispatch('publications/updatePublication', {
            id: currentPublication.value.id,
            data: formData
          })
          notify.success('Publication mise à jour avec succès')
        } else {
          await store.dispatch('publications/createPublication', formData)
          notify.success('Publication créée avec succès')
        }
        
        closeModal()
        loadPublications() // Reload publications after saving
      } catch (error) {
        console.error('Error saving publication:', error)
        notify.error(error.message || 'Erreur lors de l\'enregistrement de la publication')
      } finally {
        saving.value = false
      }
    }
    
    const confirmDeletePublication = (publication) => {
      publicationToDelete.value = publication
      
      // Close other modals if they're open
      const viewModal = Modal.getInstance(viewPublicationModal.value)
      if (viewModal) {
        viewModal.hide()
      }
      
      deleteModal.value.show()
    }
    
    const deletePublication = async () => {
      if (publicationToDelete.value) {
        try {
          await store.dispatch('publications/deletePublication', publicationToDelete.value.id)
          notify.success('Publication supprimée avec succès')
        } catch (error) {
          console.error('Error deleting publication:', error)
          notify.error('Erreur lors de la suppression de la publication')
        }
      }
    }
    
    const handleImageUpload = (event) => {
      const file = event.target.files[0]
      if (file) {
        publicationImageFile.value = file
        
        // Create a preview
        const reader = new FileReader()
        reader.onload = (e) => {
          publicationForm.value.image_url = e.target.result
        }
        reader.readAsDataURL(file)
      }
    }
    
    const handleAuthorImageUpload = (event) => {
      const file = event.target.files[0]
      if (file) {
        authorImageFile.value = file
        
        // Create a preview
        const reader = new FileReader()
        reader.onload = (e) => {
          publicationForm.value.author_image = e.target.result
        }
        reader.readAsDataURL(file)
      }
    }
    
    const formatPublicationDate = (dateString) => {
      if (!dateString) return ''
      return formatDate(dateString)
    }
    
    const truncateText = (text, length) => {
      if (!text) return ''
      if (text.length <= length) return text
      return text.substring(0, length) + '...'
    }
    
    return {
      publicationModal,
      viewPublicationModal,
      deleteModal,
      currentPublication,
      isEditing,
      saving,
      publicationForm,
      loading,
      error,
      publications,
      loadPublications,
      showCreateModal,
      viewPublication,
      editPublication,
      closeModal,
      savePublication,
      confirmDeletePublication,
      deletePublication,
      handleImageUpload,
      handleAuthorImageUpload,
      formatPublicationDate,
      truncateText,
      formatPublicationImageUrl,
      formatImageUrl
    }
  }
}
</script>

<style scoped>
.card-img-container {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.card-img-top {
  object-fit: cover;
  height: 100%;
  width: 100%;
}

.publication-date {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 0.8rem;
}
</style>
