<!-- app/views/Parametres.vue -->
<template>
    <Page actionBarHidden="true">
      <GridLayout rows="auto, *, auto">
        <!-- En-tête -->
        <GridLayout columns="*, auto" class="header" row="0">
          <Label text="Settings" class="settings-title" col="0" />
          <Image src="~/assets/images/pelo-icon.png" class="app-icon" col="1" />
        </GridLayout>
        
        <!-- Contenu principal -->
        <ScrollView row="1">
          <StackLayout class="settings-container">
            <!-- Profil utilisateur -->
            <StackLayout class="user-profile">
              <Image src="~/assets/images/user-avatar.png" class="profile-avatar" />
              <Label :text="userName" class="profile-name" />
              <Label :text="userPhone" class="profile-phone" />
            </StackLayout>
            
            <!-- Options de paramètres -->
            <StackLayout class="settings-options">
              <!-- Mes informations -->
              <GridLayout columns="auto, *, auto" class="setting-item" @tap="allerVersMesInformations">
                <Image src="~/assets/images/user-icon.png" class="setting-icon" col="0" />
                <Label text="My Informations" class="setting-text" col="1" />
                <Label text=">" class="arrow-icon" col="2" />
              </GridLayout>
              
              <!-- Mode sombre -->
              <GridLayout columns="auto, *, auto" class="setting-item">
                <Image src="~/assets/images/dark-mode-icon.png" class="setting-icon" col="0" />
                <Label text="Dark Mode" class="setting-text" col="1" />
                <Switch checked="true" class="mode-switch" col="2" />
              </GridLayout>
              
              <!-- À propos -->
              <GridLayout columns="auto, *, auto" class="setting-item" @tap="allerVersAPropos">
                <Image src="~/assets/images/info-icon.png" class="setting-icon" col="0" />
                <Label text="About Us" class="setting-text" col="1" />
                <Label text=">" class="arrow-icon" col="2" />
              </GridLayout>
            </StackLayout>
            
            <!-- Déconnexion / Connexion -->
            <Button v-if="isLoggedIn" text="Log Out" @tap="deconnexion" class="logout-button" />
            <Button v-else text="Log In" @tap="connexion" class="login-button" />
          </StackLayout>
        </ScrollView>
        
        <!-- Barre de navigation -->
        <GridLayout columns="*, *, *, *" class="nav-bar" row="2">
          <StackLayout col="0" class="nav-item" @tap="allerVersPage('PeloStudio')">
            <Image src="~/assets/images/home-icon.png" class="nav-icon" />
            <Label text="Pelo Studio" class="nav-text" />
          </StackLayout>
          <StackLayout col="1" class="nav-item" @tap="allerVersPage('Barbiers')">
            <Image src="~/assets/images/barber-icon.png" class="nav-icon" />
            <Label text="Barbiers" class="nav-text" />
          </StackLayout>
          <StackLayout col="2" class="nav-item" @tap="allerVersPage('Rendez-vous')">
            <Image src="~/assets/images/calendar-icon.png" class="nav-icon" />
            <Label text="Rendez-vous" class="nav-text" />
          </StackLayout>
          <StackLayout col="3" class="nav-item active" @tap="allerVersPage('Parametres')">
            <Image src="~/assets/images/settings-icon.png" class="nav-icon" />
            <Label text="Paramètres" class="nav-text" />
          </StackLayout>
        </GridLayout>
      </GridLayout>
    </Page>
  </template>
  
  <script>
  import { authService } from '../services/api';
  import { confirm } from '@nativescript/core/ui/dialogs';
  
  export default {
    data() {
      return {
        userInfo: null
      };
    },
    computed: {
      isLoggedIn() {
        return authService.isLoggedIn();
      },
      userName() {
        if (this.userInfo) {
          return `${this.userInfo.prenom || ''} ${this.userInfo.nom || ''}`;
        }
        const user = authService.getUser();
        return user ? `${user.prenom || ''} ${user.nom || ''}` : 'Guest User';
      },
      userPhone() {
        if (this.userInfo) {
          return this.userInfo.telephone || '';
        }
        const user = authService.getUser();
        return user ? user.telephone || '' : '';
      }
    },
    mounted() {
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
      allerVersPage(page) {
        if (page === 'Parametres') {
          return; // Déjà sur cette page
        }
        this.$navigateTo(require(`./${page}`).default);
      },
      
      allerVersMesInformations() {
        if (!this.isLoggedIn) {
          // If not logged in, show confirmation dialog
          confirm({
            title: "Connexion requise",
            message: "Vous devez être connecté pour accéder à vos informations. Souhaitez-vous vous connecter?",
            okButtonText: "Se connecter",
            cancelButtonText: "Annuler"
          }).then(result => {
            if (result) {
              this.$navigateTo(require('./Connexion').default);
            }
          });
        } else {
          // If logged in, navigate to MesInformations
          this.$navigateTo(require('./MesInformations').default);
        }
      },
      
      allerVersAPropos() {
        this.$navigateTo(require('./APropos').default);
      },
      
      connexion() {
        this.$navigateTo(require('./Connexion').default);
      },
      
      async deconnexion() {
        const result = await confirm({
          title: "Déconnexion",
          message: "Êtes-vous sûr de vouloir vous déconnecter?",
          okButtonText: "Oui",
          cancelButtonText: "Non"
        });
        
        if (result) {
          authService.logout();
          this.$navigateTo(require('./Connexion').default, {
            clearHistory: true
          });
        }
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
  
  .settings-title {
    color: #ffffff;
    font-size: 20;
    font-weight: bold;
  }
  
  .app-icon {
    width: 30;
    height: 30;
  }
  
  .settings-container {
    background-color: #000000;
    padding: 10;
  }
  
  .user-profile {
    align-items: center;
    padding: 20;
  }
  
  .profile-avatar {
    width: 80;
    height: 80;
    border-radius: 40;
    margin-bottom: 10;
  }
  
  .profile-name {
    color: #ffffff;
    font-size: 18;
    font-weight: bold;
  }
  
  .profile-phone {
    color: #999999;
    font-size: 14;
  }
  
  .settings-options {
    margin-top: 20;
  }
  
  .setting-item {
    background-color: #333333;
    border-radius: 10;
    padding: 15;
    margin-bottom: 10;
    align-items: center;
  }
  
  .setting-icon {
    width: 24;
    height: 24;
  }
  
  .setting-text {
    color: #ffffff;
    font-size: 16;
    margin-left: 10;
  }
  
  .arrow-icon {
    color: #999999;
    font-size: 16;
  }
  
  .mode-switch {
    color: #FFCC33;
  }
  
  .logout-button {
    background-color: #ff4d4d;
    color: #ffffff;
    border-radius: 20;
    height: 50;
    margin-top: 30;
    margin-bottom: 20;
  }
  
  .login-button {
    background-color: #FFCC33;
    color: #000000;
    border-radius: 20;
    height: 50;
    margin-top: 30;
    margin-bottom: 20;
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