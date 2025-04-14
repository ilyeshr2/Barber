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
      <label for="photoUrl" class="form-label">Photo URL</label>
      <input 
        type="url" 
        class="form-control" 
        id="photoUrl" 
        v-model="formData.photoUrl" 
        placeholder="https://example.com/photo.jpg"
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
    
    // Update form data when barbier prop changes
    watch(() => props.barbier, (newBarbier) => {
      if (newBarbier) {
        formData.value = { ...newBarbier }
      }
    }, { immediate: true })
    
    const handleSubmit = () => {
      emit('submit', { ...formData.value })
    }
    
    return {
      formData,
      handleSubmit
    }
  }
}
</script>