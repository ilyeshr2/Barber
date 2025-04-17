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
      <label class="form-label">Barbiers</label>
      <div class="card">
        <div class="card-body">
          <div v-if="filteredBarbiers.length === 0" class="text-muted">
            Aucun barbier disponible
          </div>
          <div v-else>
            <div class="mb-2">
              <button type="button" class="btn btn-sm btn-outline-primary" @click="selectAllBarbiers">
                Sélectionner tous
              </button>
              <button type="button" class="btn btn-sm btn-outline-secondary ms-2" @click="clearBarbierSelection">
                Désélectionner tous
              </button>
            </div>
            <select multiple class="form-select barber-select-dropdown" v-model="formData.BarberIds">
              <option v-for="barbier in filteredBarbiers" :key="barbier.id" :value="barbier.id">
                {{ barbier.nom }}
              </option>
            </select>
            <small class="form-text text-muted mt-1">
              Maintenez Ctrl (ou Cmd sur Mac) pour sélectionner plusieurs barbiers
            </small>
          </div>
        </div>
      </div>
      <div class="text-danger mt-1" v-if="formData.BarberIds.length === 0">
        Veuillez sélectionner au moins un barbier
      </div>
    </div>
    
    <div class="d-flex justify-content-end">
      <button type="button" class="btn btn-secondary me-2" @click="$emit('cancel')">
        Annuler
      </button>
      <button type="submit" class="btn btn-primary" :disabled="formData.BarberIds.length === 0">
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
        BarberIds: []
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
      BarberIds: []
    })
    
    // Filter out null or invalid barbiers
    const filteredBarbiers = computed(() => {
      return props.barbiers.filter(barbier => barbier && typeof barbier === 'object');
    });
    
    // Update form data when service prop changes
    watch(() => props.service, (newService) => {
      if (newService) {
        // If editing a service that has only BarberId but not BarberIds,
        // create BarberIds from the single BarberId
        const barberIds = newService.BarberIds || (newService.BarberId ? [newService.BarberId] : []);
        
        formData.value = { 
          ...newService,
          BarberIds: barberIds
        }
      }
    }, { immediate: true })
    
    const selectAllBarbiers = () => {
      formData.value.BarberIds = filteredBarbiers.value.map(b => b.id);
    }
    
    const clearBarbierSelection = () => {
      formData.value.BarberIds = [];
    }
    
    const handleSubmit = () => {
      if (formData.value.BarberIds.length === 0) {
        return; // Don't submit if no barbers selected
      }
      
      // For backward compatibility, also set BarberId to the first selected barber
      // This will be phased out as the backend supports multiple barbers
      const dataToSubmit = { 
        ...formData.value,
        BarberId: formData.value.BarberIds[0] 
      };
      
      emit('submit', dataToSubmit)
    }
    
    return {
      formData,
      filteredBarbiers,
      selectAllBarbiers,
      clearBarbierSelection,
      handleSubmit
    }
  }
}
</script>

<style scoped>
.barber-select-dropdown {
  max-height: 200px;
  width: 100%;
}
</style>