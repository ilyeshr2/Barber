<!-- app/views/Barbiers.vue -->
<template>
    <Page actionBarHidden="true">
      <GridLayout rows="auto, *, auto">
        <!-- En-tête -->
        <GridLayout columns="auto, *, auto" class="header" row="0">
          <Image :src="userAvatar" class="user-avatar" col="0" />
          <Label text="Barbiers" class="app-title" col="1" />
          <Image src="~/assets/images/pelo-icon.png" class="app-icon" col="2" />
        </GridLayout>
        
        <!-- Contenu principal (liste des barbiers) -->
        <GridLayout row="1" rows="auto, *">
          <!-- Message de bienvenue -->
          <StackLayout row="0" class="welcome-container">
            <Label :text="'Bonjour, ' + userName" class="welcome-text" />
            <Button text="Laissez-nous un commentaire" class="review-button" />
          </StackLayout>
          
          <!-- Loading indicator -->
          <ActivityIndicator v-if="loading" busy="true" color="#FFCC33" row="1" />
          
          <!-- Liste des barbiers -->
          <ScrollView v-else row="1">
            <StackLayout class="barbiers-container">
              <!-- Information du salon -->
              <GridLayout columns="auto, *" class="salon-info">
                <Image src="~/assets/images/shop-icon.png" class="shop-icon" col="0" />
                <Label text="Le Pelo Cité Djamel, Oran" class="salon-name" col="1" />
              </GridLayout>
              
              <!-- Liste des barbiers -->
              <StackLayout class="barbier-card" v-for="barbier in barbiers" :key="barbier.id" @tap="voirDetailsBarbier(barbier)">
                <Image :src="getBarbierImage(barbier)" class="barbier-photo" stretch="aspectFill" />
                <GridLayout columns="*, auto" class="barbier-info">
                  <StackLayout col="0">
                    <Label :text="barbier.nom" class="barbier-name" />
                    <Label text="Barber" class="barbier-title" />
                  </StackLayout>
                  <StackLayout col="1" class="rating-container">
                    <Label :text="barbier.note.toFixed(1)" class="rating-value" />
                    <Label text="★" class="rating-star" />
                  </StackLayout>
                </GridLayout>
              </StackLayout>
              
              <!-- Message d'erreur -->
              <Label v-if="error" class="error-message" :text="error" textWrap="true" />
            </StackLayout>
          </ScrollView>
        </GridLayout>
        
        <!-- Barre de navigation -->
        <GridLayout columns="*, *, *, *" class="nav-bar" row="2">
          <StackLayout col="0" class="nav-item" @tap="allerVersPage('PeloStudio')">
            <Image src="~/assets/images/home-icon.png" class="nav-icon" />
            <Label text="Pelo Studio" class="nav-text" />
          </StackLayout>
          <StackLayout col="1" class="nav-item active" @tap="allerVersPage('Barbiers')">
            <Image src="~/assets/images/barber-icon.png" class="nav-icon" />
            <Label text="Barbiers" class="nav-text" />
          </StackLayout>
          <StackLayout col="2" class="nav-item" @tap="allerVersPage('Rendez-vous')">
            <Image src="~/assets/images/calendar-icon.png" class="nav-icon" />
            <Label text="Rendez-vous" class="nav-text" />
          </StackLayout>
          <StackLayout col="3" class="nav-item" @tap="allerVersPage('Parametres')">
            <Image src="~/assets/images/settings-icon.png" class="nav-icon" />
            <Label text="Paramètres" class="nav-text" />
          </StackLayout>
        </GridLayout>
      </GridLayout>
    </Page>
  </template>
  
  <script>
  import { barbierService, authService } from '../services/api';
  
  export default {
    data() {
      return {
        barbiers: [],
        loading: true,
        error: null,
        userAvatar: '~/assets/images/user-avatar.png',
        userInfo: null
      };
    },
    computed: {
      userName() {
        if (this.userInfo && this.userInfo.prenom) {
          return this.userInfo.prenom;
        }
        const user = authService.getUser();
        return user ? user.prenom : 'Invité';
      }
    },
    mounted() {
      this.loadBarbers();
      this.refreshUserInfo();
      
      // Set up event handler for page navigation
      const page = this.$el.nativeView;
      if (page) {
        page.on('navigatedTo', this.onNavigatedTo);
      }
    },
    beforeDestroy() {
      // Clean up event handler
      const page = this.$el.nativeView;
      if (page) {
        page.off('navigatedTo', this.onNavigatedTo);
      }
    },
    methods: {
      async loadBarbers() {
        this.loading = true;
        this.error = null;
        
        try {
          this.barbiers = await barbierService.getAllBarbers();
        } catch (error) {
          console.error('Error loading barbers:', error);
          this.error = 'Erreur lors du chargement des barbiers';
        } finally {
          this.loading = false;
        }
      },
      
      allerVersPage(page) {
        if (page === 'Barbiers') {
          return; // Déjà sur cette page
        }
        this.$navigateTo(require(`./${page}`).default);
      },
      
      voirDetailsBarbier(barbier) {
        this.$navigateTo(require('./DetailsBarbier').default, {
          props: { barbierId: barbier.id }
        });
      },
      
      getBarbierImage(barbier) {
        // Fallback to default image if photoUrl is missing or invalid
        if (!barbier.photoUrl || barbier.photoUrl.includes('imgur')) {
          return `~/assets/images/barber-${barbier.id}.jpg`;
        }
        return barbier.photoUrl;
      },
      
      refreshUserInfo() {
        this.userInfo = authService.getUser();
      },
      
      onNavigatedTo() {
        this.refreshUserInfo();
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
  
  .user-avatar {
    width: 40;
    height: 40;
    border-radius: 20;
  }
  
  .app-title {
    color: #ffffff;
    font-size: 20;
    font-weight: bold;
    text-align: center;
  }
  
  .app-icon {
    width: 30;
    height: 30;
  }
  
  .welcome-container {
    background-color: #000000;
    padding: 10;
  }
  
  .welcome-text {
    color: #999999;
    font-size: 16;
    margin-bottom: 10;
  }
  
  .review-button {
    background-color: #333333;
    color: #FFCC33;
    border-width: 1;
    border-color: #FFCC33;
    border-radius: 20;
    height: 40;
    margin-bottom: 15;
  }
  
  .barbiers-container {
    background-color: #000000;
    padding: 10;
  }
  
  .salon-info {
    margin-top: 10;
    margin-bottom: 15;
  }
  
  .shop-icon {
    width: 24;
    height: 24;
  }
  
  .salon-name {
    color: #ffffff;
    font-size: 16;
    margin-left: 5;
  }
  
  .barbier-card {
    margin-bottom: 20;
  }
  
  .barbier-photo {
    width: 100%;
    height: 180;
    border-top-left-radius: 10;
    border-top-right-radius: 10;
  }
  
  .barbier-info {
    background-color: #333333;
    border-bottom-left-radius: 10;
    border-bottom-right-radius: 10;
    padding: 10;
  }
  
  .barbier-name {
    color: #ffffff;
    font-size: 18;
    font-weight: bold;
  }
  
  .barbier-title {
    color: #999999;
    font-size: 14;
  }
  
  .rating-container {
    background-color: #333333;
    border-radius: 20;
    padding: 5 10;
    margin-right: 10;
  }
  
  .rating-value {
    color: #ffffff;
    font-size: 16;
    font-weight: bold;
  }
  
  .rating-star {
    color: #FFCC33;
    font-size: 16;
  }
  
  .error-message {
    color: #ff4d4d;
    text-align: center;
    margin: 20;
  }
  
  .nav-bar {
    background-color: #000000;
    border-top-width: 1;
    border-top-color: #333333;
    height: 60;
  }
  
  .nav-item {
    text-align: center;
    padding: 10;
  }
  
  .nav-icon {
    width: 24;
    height: 24;
    margin-bottom: 3;
  }
  
  .nav-text {
    color: #999999;
    font-size: 12;
  }
  
  .active .nav-text {
    color: #FFCC33;
  }
  
  .active .nav-icon {
    filter: sepia(100%) saturate(10000%) hue-rotate(20deg);
  }
  </style>