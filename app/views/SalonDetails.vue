<template>
    <Page actionBarHidden="true">
      <GridLayout rows="auto, *">
        <!-- Header -->
        <GridLayout columns="auto, *" class="header" row="0">
          <Button text="<" @tap="goBack" class="btn-retour" col="0" />
          <Label text="Informations du Salon" class="page-title" col="1" />
        </GridLayout>
        
        <!-- Content -->
        <ScrollView row="1">
          <StackLayout class="salon-container" v-if="!loading">
            <!-- Salon Image -->
            <Image :src="salon.imageUrl || '~/assets/images/salon.jpg'" class="salon-image" stretch="aspectFill" />
            
            <!-- Salon Name -->
            <Label :text="salon.name" class="salon-title" />
            
            <!-- Address with map link -->
            <GridLayout columns="auto, *" class="info-item" @tap="openMap">
              <Label text="📍" class="info-icon" col="0" />
              <Label :text="salon.address" class="info-text" col="1" textWrap="true" />
            </GridLayout>
            
            <!-- Phone -->
            <GridLayout columns="auto, *" class="info-item" @tap="callSalon">
              <Label text="📞" class="info-icon" col="0" />
              <Label :text="salon.phone" class="info-text" col="1" />
            </GridLayout>
            
            <!-- Email -->
            <GridLayout columns="auto, *" class="info-item" @tap="emailSalon">
              <Label text="✉️" class="info-icon" col="0" />
              <Label :text="salon.email" class="info-text" col="1" />
            </GridLayout>
            
            <!-- Hours -->
            <StackLayout class="hours-container">
              <Label text="Heures d'ouverture" class="section-title" />
              <StackLayout v-for="day in formattedBusinessHours" :key="day.dayName" class="hours-row">
                <GridLayout columns="*, *">
                  <Label :text="day.dayName" class="day-name" col="0" />
                  <Label :text="day.hours" class="hours-text" col="1" />
                </GridLayout>
              </StackLayout>
            </StackLayout>
            
            <!-- Description -->
            <StackLayout class="description-container">
              <Label text="À propos" class="section-title" />
              <Label :text="salon.description" class="description-text" textWrap="true" />
            </StackLayout>
            
            <!-- Social Media -->
            <StackLayout class="social-container">
              <Label text="Suivez-nous" class="section-title" />
              <GridLayout :columns="socialLinksGridColumns" class="social-icons">
                <Image 
                  v-for="(link, index) in salon.socialLinks" 
                  :key="link.platform"
                  :src="getSocialIcon(link.platform)" 
                  class="social-icon" 
                  :col="index" 
                  @tap="openSocialLink(link)" />
              </GridLayout>
            </StackLayout>
            
            <!-- Take Appointment Button -->
            <Button text="Prendre Rendez-vous" class="appointment-button" @tap="takeAppointment" />
          </StackLayout>

          <!-- Loading state -->
          <ActivityIndicator v-if="loading" busy="true" color="#ffcc33" class="loading" />
          
          <!-- Error state -->
          <StackLayout v-if="error" class="error-container">
            <Label text="Impossible de charger les informations du salon" class="error-text" />
            <Button text="Réessayer" @tap="loadSalonDetails" class="retry-button" />
          </StackLayout>
        </ScrollView>
      </GridLayout>
    </Page>
  </template>
  
  <script>
  import { openUrl } from '@nativescript/core/utils';
  import { salonService } from '../services/api';
  
  export default {
    data() {
      return {
        salon: {
          id: 1,
          name: 'Yaniso Studio',
          address: 'Rue Jean-Talon E, Montréal',
          phone: '+1 555-555-5555',
          email: 'contact@yanisostudio.com',
          description: 'Votre barbier de confiance à Montréal',
          businessHours: [],
          socialLinks: [],
          imageUrl: '~/assets/images/salon.jpg'
        },
        loading: true,
        error: null
      };
    },
    computed: {
      formattedBusinessHours() {
        if (this.salon.businessHours && this.salon.businessHours.length > 0) {
          const dayNames = {
            0: 'Dimanche',
            1: 'Lundi',
            2: 'Mardi',
            3: 'Mercredi',
            4: 'Jeudi',
            5: 'Vendredi',
            6: 'Samedi'
          };
          
          return this.salon.businessHours.map(day => {
            const dayName = dayNames[day.dayOfWeek];
            let hours = 'Fermé';
            
            if (day.isOpen) {
              const openTime = day.openTime || '09:00';
              const closeTime = day.closeTime || '18:00';
              hours = `${openTime} - ${closeTime}`;
            }
            
            return { dayName, hours };
          }).sort((a, b) => {
            // Sort days of week starting with Monday (1)
            const dayOrder = { 'Lundi': 1, 'Mardi': 2, 'Mercredi': 3, 'Jeudi': 4, 'Vendredi': 5, 'Samedi': 6, 'Dimanche': 0 };
            return dayOrder[a.dayName] - dayOrder[b.dayName];
          });
        }
        
        // Default business hours if none are available from API
        const defaultHours = {
          'Lundi': '9:00 - 18:00',
          'Mardi': '9:00 - 18:00',
          'Mercredi': '9:00 - 18:00',
          'Jeudi': '9:00 - 18:00',
          'Vendredi': '9:00 - 18:00',
          'Samedi': '10:00 - 17:00',
          'Dimanche': 'Fermé'
        };
        
        return Object.entries(defaultHours).map(([dayName, hours]) => {
          return { dayName, hours };
        });
      },
      socialLinksGridColumns() {
        // Create a grid with equal width columns based on number of social links
        const count = Math.max((this.salon.socialLinks && this.salon.socialLinks.length) || 1, 1);
        return Array(count).fill('*').join(', ');
      }
    },
    mounted() {
      this.loadSalonDetails();
    },
    methods: {
      async loadSalonDetails() {
        this.loading = true;
        this.error = null;
        
        try {
          const salonData = await salonService.getSalonInfo();
          if (salonData) {
            this.salon = salonData;
            
            // Ensure socialLinks is always an array
            if (!this.salon.socialLinks) {
              this.salon.socialLinks = [
                { platform: 'facebook', url: 'https://www.facebook.com/yanisostudio' },
                { platform: 'instagram', url: 'https://www.instagram.com/yanisostudio' },
                { platform: 'tiktok', url: 'https://www.tiktok.com/@yanisostudio' }
              ];
            }
          }
        } catch (error) {
          console.error('Error loading salon details:', error);
          this.error = 'Failed to load salon details';
        } finally {
          this.loading = false;
        }
      },
      goBack() {
        this.$navigateBack();
      },
      openMap() {
        const address = encodeURIComponent(this.salon.address);
        openUrl(`https://maps.google.com/?q=${address}`);
      },
      callSalon() {
        const phone = this.salon.phone.replace(/\s+/g, '');
        openUrl(`tel:${phone}`);
      },
      emailSalon() {
        openUrl(`mailto:${this.salon.email}`);
      },
      getSocialIcon(platform) {
        const icons = {
          facebook: '~/assets/images/facebook-icon.png',
          instagram: '~/assets/images/instagram-icon.png',
          tiktok: '~/assets/images/tiktok-icon.png',
          twitter: '~/assets/images/twitter-icon.png',
          youtube: '~/assets/images/youtube-icon.png'
        };
        
        return icons[platform] || icons.facebook;
      },
      openSocialLink(link) {
        if (link && link.url) {
          openUrl(link.url);
        }
      },
      takeAppointment() {
        this.$navigateTo(require('./Barbiers').default);
      }
    }
  };
  </script>
  
  <style scoped>
  .header {
    background-color: #000000;
    padding: 10;
    height: 50;
  }
  
  .btn-retour {
    font-size: 30;
    background-color: #212121;
    color: #ffffff;
    border-radius: 20;
    width: 40;
    height: 40;
    padding: 0;
    text-align: center;
  }
  
  .page-title {
    color: #ffffff;
    font-size: 20;
    font-weight: bold;
    text-align: center;
    margin-right: 40;
  }
  
  .salon-container {
    background-color: #000000;
    padding: 0;
  }
  
  .salon-image {
    width: 100%;
    height: 200;
  }
  
  .salon-title {
    color: #ffffff;
    font-size: 24;
    font-weight: bold;
    text-align: center;
    margin: 20 0;
  }
  
  .info-item {
    padding: 10 20;
    margin-bottom: 10;
  }
  
  .info-icon {
    font-size: 20;
    margin-right: 10;
  }
  
  .info-text {
    color: #ffffff;
    font-size: 16;
  }
  
  .section-title {
    color: #ffffff;
    font-size: 18;
    font-weight: bold;
    margin: 20 20 10 20;
  }
  
  .hours-container {
    margin-bottom: 20;
  }
  
  .hours-row {
    padding: 5 20;
  }
  
  .day-name {
    color: #ffffff;
    font-size: 16;
  }
  
  .hours-text {
    color: #ffffff;
    font-size: 16;
    text-align: right;
  }
  
  .description-container {
    margin-bottom: 20;
  }
  
  .description-text {
    color: #cccccc;
    font-size: 14;
    text-align: justify;
    padding: 0 20;
  }
  
  .social-container {
    margin-bottom: 20;
  }
  
  .social-icons {
    padding: 10 50;
  }
  
  .social-icon {
    width: 40;
    height: 40;
  }
  
  .appointment-button {
    background-color: #ffcc33;
    color: #000000;
    font-size: 18;
    font-weight: bold;
    border-radius: 25;
    height: 50;
    margin: 20;
  }
  
  .loading {
    margin-top: 100;
  }
  
  .error-container {
    margin-top: 100;
    padding: 20;
  }
  
  .error-text {
    color: #ff6b6b;
    font-size: 18;
    text-align: center;
    margin-bottom: 20;
  }
  
  .retry-button {
    background-color: #ffcc33;
    color: #000000;
    font-size: 16;
    border-radius: 20;
    width: 150;
    height: 40;
    margin: 0 auto;
  }
  </style>