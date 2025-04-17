<!--src/components/services/ServicesForm.vue -->
<template>
  <form @submit.prevent="handleSubmit">
    <div class="mb-3">
      <label for="nom" class="form-label">Nom du service</label>
      <input 
        type="text" 
        class="form-control" 
        id="nom" 
        v-model="formData.nom"
        required 
      >
    </div>
    
    <div class="mb-3">
      <label for="duree" class="form-label">Durée (minutes)</label>
      <input 
        type="number" 
        class="form-control" 
        id="duree" 
        v-model.number="formData.duree"
        min="5"
        required
      >
    </div>
    
    <div class="mb-3">
      <label for="prix" class="form-label">Prix (CAD)</label>
      <input 
        type="number" 
        class="form-control" 
        id="prix" 
        v-model.number="formData.prix"
        min="0"
        required
      >
    </div>
    
    <div class="mb-3">
      <label for="BarberId" class="form-label">Barbier</label>
      <select 
        class="form-select" 
        id="BarberId" 
        v-model.number="formData.BarberId"
        required
      >
        <option value="">Sélectionner un barbier</option>
        <option v-for="barbier in filteredBarbiers" :key="barbier.id" :value="barbier.id">
          {{ barbier.nom }}
        </option>
      </select>
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
import { ref, computed, watch } from 'vue'

export default {
  name: 'ServiceForm',
  props: {
    service: {
      type: Object,
      default: () => ({
        nom: '',
        duree: 30,
        prix: 500,
        BarberId: null
      })
    },
    barbiers: {
      type: Array,
      default: () => []
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
      duree: 30,
      prix: 500,
      BarberId: null
    })
    
    // Filter out null or invalid barbiers
    const filteredBarbiers = computed(() => {
      return props.barbiers.filter(barbier => barbier && typeof barbier === 'object');
    });
    
    // Update form data when service prop changes
    watch(() => props.service, (newService) => {
      if (newService) {
        formData.value = { ...newService }
      }
    }, { immediate: true })
    
    // Set first available barbier if none selected and we have barbiers
    watch(() => filteredBarbiers.value, (newBarbiers) => {
      if (!formData.value.BarberId && newBarbiers.length > 0) {
        formData.value.BarberId = newBarbiers[0].id
      }
    }, { immediate: true })
    
    const handleSubmit = () => {
      emit('submit', { ...formData.value })
    }
    
    return {
      formData,
      filteredBarbiers,
      handleSubmit
    }
  }
}
</script>