<!--src/components/barbiers/Barbierform.vue -->
<template>
  <form @submit.prevent="handleSubmit">
    <div class="mb-3">
      <label for="nom" class="form-label">Nom</label>
      <input 
        type="text" 
        class="form-control" 
        id="nom" 
        v-model="formData.nom"
        required 
      >
    </div>
    
    <div class="mb-3">
      <label for="photo" class="form-label">Photo</label>
      <div v-if="previewImage" class="mb-3">
        <img 
          :src="previewImage" 
          alt="Barber preview" 
          class="img-fluid mb-2" 
          style="max-height: 200px; width: auto;"
        >
      </div>
      <input 
        type="file" 
        class="form-control" 
        id="photo" 
        @change="handlePhotoUpload"
        accept="image/*"
      >
      <div class="form-text">Laisser vide pour utiliser une image par défaut</div>
    </div>
    
    <div class="mb-3">
      <label for="note" class="form-label">Note ({{ formData.note }})</label>
      <input 
        type="range" 
        class="form-range" 
        min="1" 
        max="5" 
        step="0.1" 
        id="note" 
        v-model.number="formData.note"
      >
    </div>
    
    <div class="mb-3">
      <label for="nombreAvis" class="form-label">Nombre d'avis</label>
      <input 
        type="number" 
        class="form-control" 
        id="nombreAvis" 
        v-model.number="formData.nombreAvis"
        min="0" 
      >
    </div>
    
    <div class="d-flex justify-content-end">
      <button type="button" class="btn btn-secondary me-2" @click="$emit('cancel')">
        Annuler
      </button>
      <button type="submit" class="btn btn-primary">
        {{ isEditing ? 'Mettre à jour' : 'Ajouter' }}
      </button>
    </div>
  </form>
</template>

<script>
import { ref, watch } from 'vue'
import { formatImageUrl } from '@/utils/imageHelpers'

export default {
  name: 'BarbierForm',
  props: {
    barbier: {
      type: Object,
      default: () => ({
        nom: '',
        photoUrl: '',
        note: 5.0,
        nombreAvis: 0,
        salonId: 1
      })
    },
    isEditing: {
      type: Boolean,
      default: false
    }
  },
  emits: ['submit', 'cancel'],
  setup(props, { emit }) {
    const formData = ref({
      nom: '',
      photoUrl: '',
      note: 5.0,
      nombreAvis: 0,
      salonId: 1
    })
    
    const photoFile = ref(null)
    const previewImage = ref('')
    
    // Update form data when barbier prop changes
    watch(() => props.barbier, (newBarbier) => {
      if (newBarbier) {
        formData.value = { ...newBarbier }
        
        // Set preview image if photo exists (check both field formats)
        let photoUrl = newBarbier.photoUrl || newBarbier.photo_url;
        if (photoUrl) {
          previewImage.value = formatImageUrl(photoUrl);
          
          // Also set the photoUrl in formData for consistency
          formData.value.photoUrl = photoUrl;
        } else {
          previewImage.value = '';
        }
      }
    }, { immediate: true })
    
    const handlePhotoUpload = (event) => {
      const file = event.target.files[0]
      if (file) {
        photoFile.value = file
        
        // Create a preview
        const reader = new FileReader()
        reader.onload = (e) => {
          previewImage.value = e.target.result
        }
        reader.readAsDataURL(file)
      }
    }
    
    const handleSubmit = () => {
      // Create FormData for file upload if we have a file
      if (photoFile.value) {
        const formDataToSubmit = new FormData()
        formDataToSubmit.append('photo', photoFile.value)
        formDataToSubmit.append('name', formData.value.nom)
        formDataToSubmit.append('rating', formData.value.note)
        formDataToSubmit.append('review_count', formData.value.nombreAvis)
        formDataToSubmit.append('salon_id', formData.value.salonId)
        
        emit('submit', formDataToSubmit)
      } else {
        // No file, map frontend field names to backend field names
        emit('submit', {
          name: formData.value.nom,
          rating: formData.value.note,
          review_count: formData.value.nombreAvis,
          salon_id: formData.value.salonId
        })
      }
    }
    
    return {
      formData,
      photoFile,
      previewImage,
      handlePhotoUpload,
      handleSubmit
    }
  }
}
</script>