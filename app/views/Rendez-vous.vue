<template>
  <Page actionBarHidden="true">
    <GridLayout rows="auto, auto, *, auto">
      <!-- En-tête -->
      <GridLayout columns="auto, *, auto" class="header" row="0">
        <Image :src="userAvatar" class="user-avatar" col="0" />
        <Label text="" col="1" />
        <Image src="~/assets/images/yaniso-logo.png" class="app-icon" col="2" />
      </GridLayout>

      <!-- Title container (moved after header) -->
      <StackLayout row="1" class="title-container">
        <Label text="Appointments" class="app-title" />
        <Label :text="'Hello, ' + userName" class="welcome-text" />
        <!-- Bouton review -->
        <Button text="Leave us a review" class="review-button" />
      </StackLayout>

      <!-- Contenu principal -->
      <ScrollView row="2">
        <StackLayout class="appointments-container">
          <!-- Si pas connecté -->
          <StackLayout v-if="!isLoggedIn" class="login-prompt">
            <Label text="Vous devez être connecté pour voir vos rendez-vous" class="login-message" textWrap="true" />
            <Button text="Se connecter" @tap="allerConnexion" class="login-button" />
          </StackLayout>

          <!-- Loading indicator -->
          <ActivityIndicator v-else-if="loading" busy="true" color="#FFCC33" />

          <!-- Liste des rendez-vous -->
          <StackLayout v-else>
            <!-- Message si aucun rendez-vous -->
            <StackLayout v-if="rendezVous.length === 0" class="no-appointments">
              <Label text="Vous n'avez aucun rendez-vous" class="no-appointments-text" textWrap="true" />
              <Button text="Prendre rendez-vous" @tap="allerBarbiers" class="book-button" />
            </StackLayout>

            <StackLayout v-else>
              <!-- Prochain rendez-vous -->
              <GridLayout columns="auto, *, auto" class="next-appointment">
                <Image src="~/assets/images/calendar-icon-alt.png" class="calendar-icon" col="0" />
                <StackLayout col="1">
                  <Label text="Next appointment" class="next-title" />
                  <Label :text="formatNextAppointment()" class="next-details" />
                </StackLayout>
                <Button text="✕" class="delete-btn" col="2" @tap="annulerProchainRendezVous()" />
              </GridLayout>

              <!-- Liste des rendez-vous -->
              <StackLayout class="appointment-list">
                <StackLayout v-for="rdv in rendezVous" :key="rdv.id" class="appointment-card">
                  <GridLayout rows="auto, auto, auto, auto">
                    <GridLayout row="0" columns="auto, *">
                      <Label text="Date:" class="appointment-label" col="0" />
                      <Label :text="formatAppointmentDate(rdv.date)" class="appointment-value" col="1" />
                    </GridLayout>
                    <GridLayout row="1" columns="auto, *">
                      <Label text="With:" class="appointment-label" col="0" />
                      <Label :text="getBarberName(rdv)" class="appointment-value" col="1" />
                    </GridLayout>
                    <GridLayout row="2" columns="auto, *">
                      <Label text="Services:" class="appointment-label" col="0" />
                      <Label :text="getServiceName(rdv)" class="appointment-value" col="1" />
                    </GridLayout>
                    <GridLayout row="3" columns="*, auto">
                      <Button text="Cancel appointment" @tap="annulerRendezVous(rdv.id)" class="cancel-btn" col="0" />
                      <Label :text="getServicePrice(rdv) + ' DA'" class="price-label" col="1" />
                    </GridLayout>
                  </GridLayout>
                </StackLayout>
              </StackLayout>
            </StackLayout>

            <!-- Message d'erreur -->
            <Label v-if="error" class="error-message" :text="error" textWrap="true" />
          </StackLayout>
        </StackLayout>
      </ScrollView>

      <!-- Barre de navigation -->
      <GridLayout columns="*, *, *, *" class="nav-bar" row="3">
        <StackLayout col="0" class="nav-item" @tap="allerVersPage('PeloStudio')">
          <Image src="~/assets/images/home-icon.png" class="nav-icon" />
          <Label text="Pelo Studio" class="nav-text" />
        </StackLayout>
        <StackLayout col="1" class="nav-item" @tap="allerVersPage('Barbiers')">
          <Image src="~/assets/images/barber-icon.png" class="nav-icon" />
          <Label text="Barbers" class="nav-text" />
        </StackLayout>
        <StackLayout col="2" class="nav-item active" @tap="allerVersPage('Rendez-vous')">
          <Image src="~/assets/images/calendar-icon.png" class="nav-icon" />
          <Label text="Appointments" class="nav-text" />
        </StackLayout>
        <StackLayout col="3" class="nav-item" @tap="allerVersPage('Parametres')">
          <Image src="~/assets/images/settings-icon.png" class="nav-icon" />
          <Label text="Settings" class="nav-text" />
        </StackLayout>
      </GridLayout>
    </GridLayout>
  </Page>
</template>

<script>
import { rendezVousService, authService } from '../services/api';
import { formatDisplayDate, formatDisplayTime } from '../utils/helpers';
import { confirm } from '@nativescript/core/ui/dialogs';

export default {
  data() {
    return {
      rendezVous: [],
      loading: true,
      error: null,
      userAvatar: '~/assets/images/user-avatar.png',
      userInfo: null
    };
  },
  computed: {
    isLoggedIn() {
      return authService.isLoggedIn();
    },
    userName() {
      if (this.userInfo && this.userInfo.prenom) {
        return this.userInfo.prenom;
      }
      const user = authService.getUser();
      return user ? user.prenom : 'Citric acid';
    }
  },
  mounted() {
    this.loadAppointments();
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
    async loadAppointments() {
      if (!this.isLoggedIn) {
        this.loading = false;
        return;
      }

      this.loading = true;
      this.error = null;

      try {
        this.rendezVous = await rendezVousService.getUserAppointments();

        // Sort by date
        this.rendezVous.sort((a, b) => new Date(a.date) - new Date(b.date));
      } catch (error) {
        console.error('Error loading appointments:', error);
        this.error = 'Erreur lors du chargement des rendez-vous';
      } finally {
        this.loading = false;
      }
    },

    formatNextAppointment() {
      if (this.rendezVous.length === 0) return '';
      const rdv = this.rendezVous[0];
      return `3 Apr - 14:00 with ${this.getBarberName(rdv)}`;
    },

    formatAppointmentDate(date) {
      return `Thu 3 Apr 2025 - 14:00`;
    },

    getBarberName(rdv) {
      return rdv.Barbier ? rdv.Barbier.nom : 'Islem';
    },

    getServiceName(rdv) {
      return rdv.Service ? rdv.Service.nom : 'Haircut.';
    },

    getServicePrice(rdv) {
      return rdv.Service ? rdv.Service.prix : 500;
    },

    allerVersPage(page) {
      if (page === 'Rendez-vous') {
        return; // Déjà sur cette page
      }
      this.$navigateTo(require(`./${page}`).default);
    },

    allerConnexion() {
      this.$navigateTo(require('./Connexion').default);
    },

    allerBarbiers() {
      this.$navigateTo(require('./Barbiers').default);
    },

    annulerProchainRendezVous() {
      if (this.rendezVous.length === 0) return;
      this.annulerRendezVous(this.rendezVous[0].id);
    },

    async annulerRendezVous(id) {
      const result = await confirm({
        title: "Annuler le rendez-vous",
        message: "Êtes-vous sûr de vouloir annuler ce rendez-vous?",
        okButtonText: "Oui",
        cancelButtonText: "Non"
      });

      if (result) {
        try {
          await rendezVousService.cancelAppointment(id);

          // Reload appointments
          this.loadAppointments();
        } catch (error) {
          console.error('Error cancelling appointment:', error);
          this.error = 'Erreur lors de l\'annulation du rendez-vous';
        }
      }
    },

    refreshUserInfo() {
      this.userInfo = authService.getUser();
    },

    onNavigatedTo() {
      this.refreshUserInfo();
      // Also reload appointments when coming back to this page
      if (this.isLoggedIn) {
        this.loadAppointments();
      }
    }
  }
};
</script>

<style scoped>
.header {
  background-color: #000000;
  padding: 10 15;
  height: 60;
}

.user-avatar {
  width: 50;
  height: 50;
  border-radius: 25;
  border-width: 1;
  border-color: #ffffff;
}

.app-icon {
  width: 40;
  height: 40;
}

.title-container {
  background-color: #000000;
  padding: 0 15;
}

.app-title {
  color: #ffffff;
  font-size: 30;
  font-weight: bold;
  margin-top: 5;
}

.welcome-text {
  color: #999999;
  font-size: 16;
  margin-top: 3;
}

.review-button {
  background-color: transparent;
  color: #FFCC33;
  border-width: 1;
  border-color: #333333;
  border-radius: 20;
  height: 50;
  font-size: 16;
  margin: 15 0;
}

.appointments-container {
  background-color: #000000;
  padding: 10 15;
}

.login-prompt {
  background-color: #000000;
  padding: 20;
  justify-content: center;
  align-items: center;
}

.login-message {
  color: #ffffff;
  font-size: 16;
  text-align: center;
  margin-bottom: 20;
}

.login-button {
  background-color: #FFCC33;
  color: #000000;
  font-size: 18;
  font-weight: bold;
  border-radius: 20;
  width: 200;
  height: 50;
}

.no-appointments {
  margin: 30;
  text-align: center;
}

.no-appointments-text {
  color: #ffffff;
  font-size: 16;
  margin-bottom: 20;
}

.book-button {
  background-color: #FFCC33;
  color: #000000;
  font-size: 16;
  border-radius: 20;
  height: 40;
  width: 200;
}

.next-appointment {
  background-color: #222222;
  border-radius: 15;
  padding: 15;
  margin-bottom: 15;
}

.calendar-icon {
  width: 35;
  height: 35;
  margin-right: 10;
  color: #FFCC33;
}

.next-title {
  color: #ffffff;
  font-size: 16;
  font-weight: bold;
}

.next-details {
  color: #ffffff;
  font-size: 14;
  margin-top: 5;
}

.delete-btn {
  color: #ff4d4d;
  font-size: 24;
  background-color: transparent;
  width: 40;
  height: 40;
  padding: 0;
  border-radius: 20;
  background-color: rgba(255, 77, 77, 0.2);
}

.appointment-card {
  background-color: #222222;
  border-radius: 15;
  padding: 15;
  margin-bottom: 15;
}

.appointment-label {
  color: #ffffff;
  font-size: 16;
  font-weight: bold;
  margin-bottom: 5;
}

.appointment-value {
  color: #ffffff;
  font-size: 16;
  margin-bottom: 5;
}

.price-label {
  color: #ffffff;
  font-size: 24;
  font-weight: bold;
  text-align: right;
  vertical-align: center;
}

.cancel-btn {
  background-color: transparent;
  color: #ff4d4d;
  border-color: #ff4d4d;
  border-width: 1;
  border-radius: 20;
  height: 40;
  font-size: 14;
  margin-top: 10;
  margin-right: 10;
}

.error-message {
  color: #ff4d4d;
  text-align: center;
  margin: 20;
}

.nav-bar {
  background-color: #000000;
  border-top-color: #333333;
  border-top-width: 1;
  height: 70;
  padding-top: 10;
  padding-bottom: 10;
}

.nav-item {
  text-align: center;
  padding: 5;
}

.nav-icon {
  width: 24;
  height: 24;
  margin-bottom: 5;
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