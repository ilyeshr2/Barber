<!-- app/components/NavigationBar.vue -->
<template>
    <GridLayout columns="*, *, *, *" class="nav-bar">
      <StackLayout col="0" class="nav-item" :class="{ 'active': currentPage === 'PeloStudio' }" @tap="goToPage('PeloStudio')">
        <Image src="~/assets/images/home-icon.png" class="nav-icon" />
        <Label :text="salonName" class="nav-text" />
      </StackLayout>
      <StackLayout col="1" class="nav-item" :class="{ 'active': currentPage === 'Barbiers' }" @tap="goToPage('Barbiers')">
        <Image src="~/assets/images/barber-icon.png" class="nav-icon" />
        <Label text="Barbiers" class="nav-text" />
      </StackLayout>
      <StackLayout col="2" class="nav-item" :class="{ 'active': currentPage === 'Rendez-vous' }" @tap="goToPage('Rendez-vous')">
        <Image src="~/assets/images/calendar-icon.png" class="nav-icon" />
        <Label text="Rendez-vous" class="nav-text" />
      </StackLayout>
      <StackLayout col="3" class="nav-item" :class="{ 'active': currentPage === 'Parametres' }" @tap="goToPage('Parametres')">
        <Image src="~/assets/images/settings-icon.png" class="nav-icon" />
        <Label text="Paramètres" class="nav-text" />
      </StackLayout>
    </GridLayout>
  </template>
  
  <script>
  import { salonService } from '../services/api';
  
  export default {
    props: {
      currentPage: {
        type: String,
        required: true
      }
    },
    data() {
      return {
        salonName: 'Yaniso Studio' // Default name, will be updated from API
      };
    },
    mounted() {
      this.loadSalonInfo();
    },
    methods: {
      async loadSalonInfo() {
        try {
          const salon = await salonService.getSalonInfo();
          if (salon && salon.name) {
            this.salonName = salon.name;
          }
        } catch (error) {
          console.error('Error loading salon info:', error);
          // Keep default name if the API fails
        }
      },
      goToPage(page) {
        if (page === this.currentPage) return;
        
        try {
          const view = require(`../views/${page}`).default;
          if (view) {
            this.$navigateTo(view);
          } else {
            console.error(`View ${page} not found`);
            this.$alert({
              title: "Erreur",
              message: "Cette fonctionnalité n'est pas encore disponible",
              okButtonText: "OK"
            });
          }
        } catch (error) {
          console.error(`Error navigating to ${page}:`, error);
          this.$alert({
            title: "Erreur",
            message: "Cette fonctionnalité n'est pas encore disponible",
            okButtonText: "OK"
          });
        }
      }
    }
  };
  </script>
  
  <style scoped>
  .nav-bar {
    background-color: #000000;
    border-top-width: 1;
    border-top-color: #333333;
    height: 60;
    padding-bottom: 5;
  }
  
  .nav-item {
    text-align: center;
    padding: 5 0;
  }
  
  .nav-icon {
    width: 22;
    height: 22;
    margin-bottom: 3;
    opacity: 0.6;
  }
  
  .nav-text {
    color: #888888;
    font-size: 12;
    text-align: center;
  }
  
  .active .nav-text {
    color: #FFCC33;
  }
  
  .active .nav-icon {
    opacity: 1;
  }
  </style>