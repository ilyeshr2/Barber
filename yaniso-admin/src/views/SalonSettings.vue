// src/views/SalonSettings.vue - NEW FILE
<template>
  <div class="salon-settings">
    <h1 class="mb-4">Paramètres du Salon</h1>
    
    <div v-if="loading" class="text-center py-5">
      <Loader message="Chargement des informations du salon..." />
    </div>
    
    <div v-else-if="error" class="alert alert-danger">
      {{ error }}
      <button class="btn btn-sm btn-outline-danger ms-2" @click="loadSalonInfo">
        <i class="bi bi-arrow-clockwise"></i> Réessayer
      </button>
    </div>
    
    <div v-else class="row">
      <!-- Salon basic information -->
      <div class="col-lg-6 mb-4">
        <div class="card">
          <div class="card-header">
            <h5 class="mb-0">Informations générales</h5>
          </div>
          <div class="card-body">
            <form @submit.prevent="updateSalonInfo">
              <div class="mb-3">
                <label for="salonName" class="form-label">Nom du salon</label>
                <input 
                  type="text" 
                  class="form-control" 
                  id="salonName" 
                  v-model="salonForm.name"
                  required
                >
              </div>
              
              <div class="mb-3">
                <label for="salonAddress" class="form-label">Adresse</label>
                <input 
                  type="text" 
                  class="form-control" 
                  id="salonAddress" 
                  v-model="salonForm.address"
                  required
                >
              </div>
              
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label for="salonPhone" class="form-label">Téléphone</label>
                  <input 
                    type="tel" 
                    class="form-control" 
                    id="salonPhone" 
                    v-model="salonForm.phone"
                    required
                  >
                </div>
                
                <div class="col-md-6 mb-3">
                  <label for="salonEmail" class="form-label">Email</label>
                  <input 
                    type="email" 
                    class="form-control" 
                    id="salonEmail" 
                    v-model="salonForm.email"
                  >
                </div>
              </div>
              
              <div class="mb-3">
                <label for="salonDescription" class="form-label">Description</label>
                <textarea 
                  class="form-control" 
                  id="salonDescription" 
                  v-model="salonForm.description"
                  rows="4"
                ></textarea>
              </div>
              
              <div class="mb-3">
                <label for="salonLogo" class="form-label">Logo</label>
                <div class="d-flex align-items-center">
                  <img 
                    v-if="salonForm.logoUrl" 
                    :src="displayLogoUrl" 
                    alt="Salon logo" 
                    class="me-3" 
                    style="height: 50px; width: auto;"
                  >
                  <input 
                    type="file" 
                    class="form-control" 
                    id="salonLogo" 
                    @change="handleLogoUpload"
                    accept="image/*"
                  >
                </div>
              </div>
              
              <div class="mb-3">
                <label for="salonImage" class="form-label">Image de couverture</label>
                <div class="d-flex align-items-center mb-2">
                  <img 
                    v-if="salonForm.imageUrl" 
                    :src="displayImageUrl" 
                    alt="Salon image" 
                    class="me-3" 
                    style="height: 100px; width: auto;"
                  >
                </div>
                <input 
                  type="file" 
                  class="form-control" 
                  id="salonImage" 
                  @change="handleImageUpload"
                  accept="image/*"
                >
              </div>
              
              <button type="submit" class="btn btn-primary" :disabled="savingBasicInfo">
                <span v-if="savingBasicInfo" class="spinner-border spinner-border-sm me-1"></span>
                Enregistrer
              </button>
            </form>
          </div>
        </div>
      </div>
      
      <!-- Business hours -->
      <div class="col-lg-6 mb-4">
        <div class="card">
          <div class="card-header">
            <h5 class="mb-0">Heures d'ouverture</h5>
          </div>
          <div class="card-body">
            <form @submit.prevent="updateBusinessHours">
              <div v-for="(day, index) in businessHours" :key="day.dayOfWeek" class="mb-3">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <div class="form-check">
                    <input 
                      class="form-check-input" 
                      type="checkbox" 
                      :id="`day-${index}`" 
                      v-model="day.isOpen"
                    >
                    <label class="form-check-label" :for="`day-${index}`">
                      <strong>{{ getDayName(day.dayOfWeek) }}</strong>
                    </label>
                  </div>
                  <div>
                    <span v-if="!day.isOpen" class="badge bg-secondary">Fermé</span>
                  </div>
                </div>
                
                <div v-if="day.isOpen" class="row">
                  <div class="col-6">
                    <label :for="`openTime-${index}`" class="form-label small">Heure d'ouverture</label>
                    <input 
                      type="time" 
                      class="form-control" 
                      :id="`openTime-${index}`" 
                      v-model="day.openTime"
                      required
                    >
                  </div>
                  <div class="col-6">
                    <label :for="`closeTime-${index}`" class="form-label small">Heure de fermeture</label>
                    <input 
                      type="time" 
                      class="form-control" 
                      :id="`closeTime-${index}`" 
                      v-model="day.closeTime"
                      required
                    >
                  </div>
                </div>
                
                <hr v-if="index < businessHours.length - 1">
              </div>
              
              <button type="submit" class="btn btn-primary" :disabled="savingHours">
                <span v-if="savingHours" class="spinner-border spinner-border-sm me-1"></span>
                Enregistrer les horaires
              </button>
            </form>
          </div>
        </div>
      </div>
      
      <!-- Social media links -->
      <div class="col-lg-6 mb-4">
        <div class="card">
          <div class="card-header">
            <h5 class="mb-0">Réseaux sociaux</h5>
          </div>
          <div class="card-body">
            <form @submit.prevent="updateSocialLinks">
              <div class="mb-3">
                <label for="facebookUrl" class="form-label">Facebook</label>
                <div class="input-group">
                  <span class="input-group-text"><i class="bi bi-facebook"></i></span>
                  <input 
                    type="url" 
                    class="form-control" 
                    id="facebookUrl" 
                    v-model="socialLinks.facebook"
                    placeholder="https://facebook.com/..."
                  >
                </div>
              </div>
              
              <div class="mb-3">
                <label for="instagramUrl" class="form-label">Instagram</label>
                <div class="input-group">
                  <span class="input-group-text"><i class="bi bi-instagram"></i></span>
                  <input 
                    type="url" 
                    class="form-control" 
                    id="instagramUrl" 
                    v-model="socialLinks.instagram"
                    placeholder="https://instagram.com/..."
                  >
                </div>
              </div>
              
              <div class="mb-3">
                <label for="tiktokUrl" class="form-label">TikTok</label>
                <div class="input-group">
                  <span class="input-group-text"><i class="bi bi-tiktok"></i></span>
                  <input 
                    type="url" 
                    class="form-control" 
                    id="tiktokUrl" 
                    v-model="socialLinks.tiktok"
                    placeholder="https://tiktok.com/@..."
                  >
                </div>
              </div>
              
              <button type="submit" class="btn btn-primary" :disabled="savingSocial">
                <span v-if="savingSocial" class="spinner-border spinner-border-sm me-1"></span>
                Enregistrer les liens
              </button>
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
import Loader from '@/components/common/Loader.vue'
import { notify } from '@/utils/notification'
import { formatImageUrl } from '@/utils/imageHelpers'

export default {
  name: 'SalonSettings',
  components: {
    Loader
  },
  setup() {
    const store = useStore()
    
    const salonForm = ref({
      name: '',
      address: '',
      phone: '',
      email: '',
      description: '',
      logoUrl: '',
      imageUrl: ''
    })
    
    const businessHours = ref([
      { dayOfWeek: 0, isOpen: false, openTime: '09:00', closeTime: '18:00' }, // Sunday
      { dayOfWeek: 1, isOpen: true, openTime: '09:00', closeTime: '18:00' }, // Monday
      { dayOfWeek: 2, isOpen: true, openTime: '09:00', closeTime: '18:00' }, // Tuesday
      { dayOfWeek: 3, isOpen: true, openTime: '09:00', closeTime: '18:00' }, // Wednesday
      { dayOfWeek: 4, isOpen: true, openTime: '09:00', closeTime: '18:00' }, // Thursday
      { dayOfWeek: 5, isOpen: true, openTime: '09:00', closeTime: '18:00' }, // Friday
      { dayOfWeek: 6, isOpen: true, openTime: '10:00', closeTime: '17:00' }  // Saturday
    ])
    
    const socialLinks = ref({
      facebook: '',
      instagram: '',
      tiktok: ''
    })
    
    const savingBasicInfo = ref(false)
    const savingHours = ref(false)
    const savingSocial = ref(false)
    const logoFile = ref(null)
    const imageFile = ref(null)
    
    const loading = computed(() => store.getters['salon/loading'])
    const error = computed(() => store.getters['salon/error'])
    
    onMounted(() => {
      loadSalonInfo()
    })
    
    const loadSalonInfo = async () => {
      try {
        const salonData = await store.dispatch('salon/fetchSalonInfo');
        
        // Update salon form with data
        salonForm.value = {
          name: salonData.name || '',
          address: salonData.address || '',
          phone: salonData.phone || '',
          email: salonData.email || '',
          description: salonData.description || '',
          logoUrl: salonData.logo_url || salonData.logoUrl || '',
          imageUrl: salonData.image_url || salonData.imageUrl || ''
        };
        
        // Update logo and image files if needed
        logoFile.value = null;
        imageFile.value = null;
        
        // Update social links
        if (salonData.socialLinks) {
          socialLinks.value = salonData.socialLinks;
        }
        
        // Update business hours if available
        if (salonData.businessHours && Array.isArray(salonData.businessHours)) {
          // Transform snake_case properties to camelCase for the frontend
          businessHours.value = salonData.businessHours.map(day => ({
            dayOfWeek: day.day_of_week !== undefined ? day.day_of_week : day.dayOfWeek,
            isOpen: day.is_open !== undefined ? day.is_open : day.isOpen,
            openTime: day.open_time || day.openTime || '09:00',
            closeTime: day.close_time || day.closeTime || '18:00'
          }));
          
          // Sort by day of week to ensure correct order
          businessHours.value.sort((a, b) => a.dayOfWeek - b.dayOfWeek);
        }
        
        return salonData;
      } catch (error) {
        console.error('Error loading salon info:', error);
        notify.error('Erreur lors du chargement des informations du salon');
        return null;
      }
    }
    
    const updateSalonInfo = async () => {
      savingBasicInfo.value = true
      
      try {
        // Create FormData for file uploads
        const formData = new FormData()
        formData.append('name', salonForm.value.name)
        formData.append('address', salonForm.value.address)
        formData.append('phone', salonForm.value.phone)
        formData.append('email', salonForm.value.email)
        formData.append('description', salonForm.value.description)
        
        // Add logo file if selected
        if (logoFile.value) {
          formData.append('logo', logoFile.value)
        }
        
        // Add image file if selected
        if (imageFile.value) {
          formData.append('image', imageFile.value)
        }
        
        const result = await store.dispatch('salon/updateSalonInfo', formData)
        notify.success('Informations du salon mises à jour avec succès')
      } catch (error) {
        console.error('Error updating salon info:', error)
        notify.error('Erreur lors de la mise à jour des informations du salon')
      } finally {
        savingBasicInfo.value = false
      }
    }
    
    const updateBusinessHours = async () => {
      savingHours.value = true
      
      try {
        // Transform camelCase properties to snake_case as expected by the API
        const formattedHours = businessHours.value.map(day => ({
          day_of_week: day.dayOfWeek,
          is_open: day.isOpen,
          open_time: day.openTime,
          close_time: day.closeTime
        }));
        
        // Add function to check database after update
        const checkDatabaseStatus = async () => {
          try {
            const freshData = await store.dispatch('salon/fetchSalonInfo');
            return freshData;
          } catch (error) {
            console.error('Error verifying database state:', error);
            return null;
          }
        };
        
        const result = await store.dispatch('salon/updateBusinessHours', formattedHours);
        
        // Give the database a moment to update
        setTimeout(async () => {
          await checkDatabaseStatus();
        }, 1000);
        
        notify.success('Heures d\'ouverture mises à jour avec succès');
      } catch (error) {
        console.error('Error updating business hours:', error);
        notify.error('Erreur lors de la mise à jour des heures d\'ouverture');
      } finally {
        savingHours.value = false
      }
    }
    
    const updateSocialLinks = async () => {
      savingSocial.value = true
      
      try {
        await store.dispatch('salon/updateSalonInfo', {
          socialLinks: socialLinks.value
        })
        notify.success('Liens des réseaux sociaux mis à jour avec succès')
      } catch (error) {
        console.error('Error updating social links:', error)
        notify.error('Erreur lors de la mise à jour des liens des réseaux sociaux')
      } finally {
        savingSocial.value = false
      }
    }
    
    const handleLogoUpload = (event) => {
      const file = event.target.files[0]
      if (file) {
        logoFile.value = file
        
        // Create a preview
        const reader = new FileReader()
        reader.onload = (e) => {
          salonForm.value.logoUrl = e.target.result
        }
        reader.readAsDataURL(file)
      }
    }
    
    const handleImageUpload = (event) => {
      const file = event.target.files[0]
      if (file) {
        imageFile.value = file
        
        // Create a preview
        const reader = new FileReader()
        reader.onload = (e) => {
          salonForm.value.imageUrl = e.target.result
        }
        reader.readAsDataURL(file)
      }
    }
    
    const getDayName = (dayNumber) => {
      const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
      return days[dayNumber]
    }
    
    const displayLogoUrl = computed(() => {
      if (salonForm.value.logoUrl) {
        return formatImageUrl(salonForm.value.logoUrl)
      }
      return ''
    })
    
    const displayImageUrl = computed(() => {
      if (salonForm.value.imageUrl) {
        return formatImageUrl(salonForm.value.imageUrl)
      }
      return ''
    })
    
    return {
      salonForm,
      businessHours,
      socialLinks,
      loading,
      error,
      savingBasicInfo,
      savingHours,
      savingSocial,
      loadSalonInfo,
      updateSalonInfo,
      updateBusinessHours,
      updateSocialLinks,
      handleLogoUpload,
      handleImageUpload,
      getDayName,
      displayLogoUrl,
      displayImageUrl
    }
  }
}
</script>