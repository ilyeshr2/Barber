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
          <StackLayout class="salon-container">
            <!-- Salon Image -->
            <Image :src="salonInfo.imageUrl || '~/assets/images/salon.jpg'" class="salon-image" stretch="aspectFill" />
            
            <!-- Salon Name -->
            <Label :text="salonInfo.name || 'Yaniso Studio'" class="salon-title" />
            
            <!-- Address with map link -->
            <GridLayout columns="auto, *" class="info-item" @tap="openMap">
              <Label text="📍" class="info-icon" col="0" />
              <Label :text="salonInfo.address" class="info-text" col="1" textWrap="true" />
            </GridLayout>
            
            <!-- Phone -->
            <GridLayout columns="auto, *" class="info-item" @tap="callSalon">
              <Label text="📞" class="info-icon" col="0" />
              <Label :text="salonInfo.phone || '+1 555-555-5555'" class="info-text" col="1" />
            </GridLayout>
            
            <!-- Email -->
            <GridLayout columns="auto, *" class="info-item" @tap="emailSalon">
              <Label text="✉️" class="info-icon" col="0" />
              <Label :text="salonInfo.email || 'contact@yanisostudio.com'" class="info-text" col="1" />
            </GridLayout>
            
            <!-- Hours -->
            <StackLayout class="hours-container">
              <Label text="Heures d'ouverture" class="section-title" />
              <StackLayout v-for="(hours, day) in businessHours" :key="day" class="hours-row">
                <GridLayout columns="*, *">
                  <Label :text="day" class="day-name" col="0" />
                  <Label :text="hours" class="hours-text" col="1" />
                </GridLayout>
              </StackLayout>
            </StackLayout>
            
            <!-- Description -->
            <StackLayout class="description-container">
              <Label text="À propos" class="section-title" />
              <Label :text="salonInfo.description || 'Yaniso Studio est votre barbier de confiance à Montréal, offrant des services de coiffure et de rasage de haute qualité dans une ambiance chaleureuse et professionnelle.'" class="description-text" textWrap="true" />
            </StackLayout>
            
            <!-- Social Media -->
            <StackLayout class="social-container">
              <Label text="Suivez-nous" class="section-title" />
              <GridLayout columns="*, *, *" class="social-icons">
                <Image src="~/assets/images/facebook-icon.png" class="social-icon" col="0" @tap="openSocial('facebook')" />
                <Image src="~/assets/images/instagram-icon.png" class="social-icon" col="1" @tap="openSocial('instagram')" />
                <Image src="~/assets/images/tiktok-icon.png" class="social-icon" col="2" @tap="openSocial('tiktok')" />
              </GridLayout>
            </StackLayout>
            
            <!-- Take Appointment Button -->
            <Button text="Prendre Rendez-vous" class="appointment-button" @tap="takeAppointment" />
          </StackLayout>
        </ScrollView>
      </GridLayout>
    </Page>
  </template>
  
  <script>
  import { openUrl } from '@nativescript/core/utils/utils';
  
  export default {
    props: {
      salonInfo: {
        type: Object,
        default: () => ({
          id: 1,
          name: 'Yaniso Studio',
          address: 'Rue Jean-Talon E, Montréal',
          phone: '+1 555-555-5555',
          email: 'contact@yanisostudio.com',
          description: 'Votre barbier de confiance à Montréal'
        })
      }
    },
    data() {
      return {
        businessHours: {
          'Lundi': '9:00 - 18:00',
          'Mardi': '9:00 - 18:00',
          'Mercredi': '9:00 - 18:00',
          'Jeudi': '9:00 - 18:00',
          'Vendredi': '9:00 - 18:00',
          'Samedi': '10:00 - 17:00',
          'Dimanche': 'Fermé'
        }
      };
    },
    methods: {
      goBack() {
        this.$navigateBack();
      },
      openMap() {
        const address = encodeURIComponent(this.salonInfo.address);
        openUrl(`https://maps.google.com/?q=${address}`);
      },
      callSalon() {
        const phone = this.salonInfo.phone || '+15555555555';
        openUrl(`tel:${phone.replace(/\s+/g, '')}`);
      },
      emailSalon() {
        const email = this.salonInfo.email || 'contact@yanisostudio.com';
        openUrl(`mailto:${email}`);
      },
      openSocial(platform) {
        const urls = {
          facebook: 'https://www.facebook.com/yanisostudio',
          instagram: 'https://www.instagram.com/yanisostudio',
          tiktok: 'https://www.tiktok.com/@yanisostudio'
        };
        openUrl(urls[platform]);
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
  </style>