<!-- app/views/Parametres.vue -->
<template>
  <Page actionBarHidden="true">
    <GridLayout rows="auto, *, auto">
      <!-- En-tête -->
      <GridLayout columns="*, auto" class="header" row="0">
        <Image src="~/assets/images/yaniso-logo.png" class="app-icon" col="1" />
        <Label text="Settings" class="settings-title" col="0" />
      </GridLayout>

      <!-- Contenu principal -->
      <ScrollView row="1">
        <StackLayout class="settings-container">
          <!-- Profil utilisateur -->
          <StackLayout class="user-profile">
            <Image src="~/assets/images/user-avatar.png" class="profile-avatar" />
            <Label :text="userName" class="profile-name" />
            <Label :text="userPhone" class="profile-phone" textWrap="true" />
          </StackLayout>

          <!-- Options de paramètres -->
          <StackLayout class="settings-options">
            <!-- Mes informations -->
            <GridLayout columns="auto, *, auto" class="setting-item" @tap="allerVersMesInformations">
              <Image src="~/assets/images/user.png" class="setting-icon" col="0" />
              <Label text="My Informations" class="setting-text" col="1" />
              <Image src="~/assets/images/arrow-right.png" class="arrow-icon" col="2" />
            </GridLayout>

            <!-- Mode sombre -->
            <GridLayout columns="auto, *, auto" class="setting-item">
              <Image src="~/assets/images/moon.png" class="setting-icon" col="0" />
              <Label text="Dark Mode" class="setting-text" col="1" />
              <StackLayout col="2" class="toggle-wrapper" @tap="toggleDarkMode">
                <GridLayout columns="*" rows="*" class="toggle-background" :class="{ 'toggle-active': darkModeEnabled }">
                  <StackLayout col="0" row="0" class="toggle-circle" :class="{ 'toggle-circle-active': darkModeEnabled }"></StackLayout>
                </GridLayout>
              </StackLayout>
            </GridLayout>

            <!-- À propos -->
            <GridLayout columns="auto, *, auto" class="setting-item" @tap="allerVersAPropos">
              <Image src="~/assets/images/info.png" class="setting-icon" col="0" />
              <Label text="About Us" class="setting-text" col="1" />
              <Image src="~/assets/images/arrow-right.png" class="arrow-icon" col="2" />
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
          <Image src="~/assets/images/home.png" class="nav-icon" />
          <Label text="Pelo Studio" class="nav-text" />
        </StackLayout>
        <StackLayout col="1" class="nav-item" @tap="allerVersPage('Barbiers')">
          <Image src="~/assets/images/cut.png" class="nav-icon" />
          <Label text="Barbiers" class="nav-text" />
        </StackLayout>
        <StackLayout col="2" class="nav-item" @tap="allerVersPage('Rendez-vous')">
          <Image src="~/assets/images/calendar.png" class="nav-icon" />
          <Label text="Rendez-vous" class="nav-text" />
        </StackLayout>
        <StackLayout col="3" class="nav-item active" @tap="allerVersPage('Parametres')">
          <Image src="~/assets/images/settings.png" class="nav-icon" />
          <Label text="Parametres" class="nav-text" />
        </StackLayout>
      </GridLayout>
    </GridLayout>
  </Page>
</template>

<script>
import { authService } from '../services/api';
import { confirm } from '@nativescript/core/ui/dialogs';
import * as ApplicationSettings from '@nativescript/core/application-settings';

export default {
  data() {
    return {
      userInfo: null,
      darkModeEnabled: true, // Default to true since your switch was checked
      isFirstLoad: true
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
      return 'user'; // Default name
    },
    userPhone() {
      // Try to get phone from userInfo
      if (this.userInfo && this.userInfo.telephone) {
        console.log('Phone from userInfo:', this.userInfo.telephone);
        return this.userInfo.telephone;
      }

      // Default phone
      return '+1 557 40 37 30';
    }
  },
  mounted() {
    this.refreshUserInfo();
    this.ensurePhoneNumber();

    // Set up event handler for page navigation
    const page = this.$el.nativeView;
    if (page) {
      page.on('navigatedTo', this.onNavigatedTo);
    }

    // If logged in and this is first load, fetch profile
    if (this.isLoggedIn && this.isFirstLoad) {
      this.fetchProfile();
      this.isFirstLoad = false;
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
          title: "Login Required",
          message: "You need to be logged in to access your information. Would you like to log in?",
          okButtonText: "Log In",
          cancelButtonText: "Cancel"
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
        title: "Log Out",
        message: "Are you sure you want to log out?",
        okButtonText: "Yes",
        cancelButtonText: "No"
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
      console.log('User info refreshed:', this.userInfo);
    },

    ensurePhoneNumber() {
      // If user exists but has no phone number, add it
      if (this.userInfo && !this.userInfo.telephone) {
        console.log('Adding phone number to user info');
        const updatedUserInfo = {
          ...this.userInfo,
          telephone: '+1 557 40 37 30'
        };

        // Update in authService
        authService.updateUserInfo(updatedUserInfo);

        // Refresh our local copy
        this.refreshUserInfo();
      }
    },

    async fetchProfile() {
      try {
        console.log('Fetching user profile');
        await authService.getProfile();
        this.refreshUserInfo();
        this.ensurePhoneNumber();
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    },

    onNavigatedTo() {
      this.refreshUserInfo();
      this.ensurePhoneNumber();
    },

    toggleDarkMode() {
      this.darkModeEnabled = !this.darkModeEnabled;
      // Here you would implement the actual dark mode logic
      // For example, changing app-wide CSS variables or theme
    }
  }
};
</script>

<style scoped>
.header {
  background-color: #000000;
  padding: 15;
  height: 100;
}

.settings-title {
  color: #ffffff;
  font-size: 24;
  font-weight: bold;
  text-align: center;
  margin-left: 60;
}

.app-icon {
  width: 60;
  height: 60;
}

.settings-container {
  background-color: #000000;
  padding: 0;
  margin-left: 0;
}

.user-profile {
  align-items: center;
  padding: 20 0 40 0;
}

.profile-avatar {
  width: 150;
  height: 150;
  border-radius: 50;
  margin-bottom: 15;
}

.profile-name {
  color: #ffffff;
  font-size: 30;
  font-weight: bold;
  margin-bottom: 10;
  text-align: center;
}

.profile-phone {
  color: #cccccc;  /* Lighter gray for better visibility */
  font-size: 18;  /* Increased font size */
  margin-bottom: 10;  /* Added margin for spacing */
  text-align: center;
  opacity: 1;  /* Ensure full opacity */
  visibility: visible;  /* Ensure visibility */
}

.settings-options {
  margin: 0 0 30 0;
}

.setting-item {
  background-color: #222222;
  border-radius: 15;
  padding: 20;
  margin-bottom: 15;
  align-items: center;
}

.setting-icon {
  width: 24;
  height: 24;
  vertical-align: middle;
}

.setting-text {
  color: #ffffff;
  font-size: 18;
  margin-left: 15;
}

.arrow-icon {
  width: 30;
  height: 30;
  vertical-align: middle;
}

.toggle-wrapper {
  width: 51;
  height: 30;
  padding: 0;
  margin: 0;
}

.toggle-background {
  width: 51;
  height: 31;
  border-radius: 15.5;
  background-color: #333333;
  vertical-align: middle;
  padding: 0;
  margin: 0;
}

.toggle-active {
  background-color: #4CD964;
}

.toggle-circle {
  width: 27;
  height: 27;
  border-radius: 13.5;
  background-color: #FFFFFF;
  margin: 2 0 2 -20;
  vertical-align: middle;
}

.toggle-circle-active {
  margin: 2 0 2 22;
}

.logout-button {
  background-color: #222222;
  color: #d35b63;
  border-radius: 15;
  height: 50;
  font-size: 20;
  margin: 90 0 20 0;
  padding: 0 0;
  height: 70;
}

.login-button {
  background-color: #222222;
  color: #4CD964;
  border-radius: 15;
  height: 50;
  font-size: 18;
  margin: 30 0 20 0;
  height: 70;
}

.nav-bar {
  background-color: #000000;
  border-top-color: #333333;
  height: 70;
  padding-bottom: 5;
}

.nav-item {
  text-align: center;
  padding: 10 0;
}

.nav-icon {
  width: 22;
  height: 22;
  margin-bottom: 3;
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
  filter: brightness(0) saturate(100%) invert(80%) sepia(70%) saturate(681%) hue-rotate(359deg) brightness(102%) contrast(103%);
}
</style>
