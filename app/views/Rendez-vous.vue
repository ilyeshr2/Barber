<!-- app/views/Rendez-vous.vue -->
<template>
    <Page actionBarHidden="true">
      <GridLayout rows="auto, *, auto">
        <!-- En-tête -->
        <GridLayout columns="auto, *, auto" class="header" row="0">
          <Image :src="userAvatar" class="user-avatar" col="0" />
          <Label text="Appointments" class="app-title" col="1" />
          <Image src="~/assets/images/pelo-icon.png" class="app-icon" col="2" />
        </GridLayout>

        <!-- Contenu principal -->
        <GridLayout row="1" rows="auto, *">
          <!-- Message de bienvenue -->
          <StackLayout row="0" class="welcome-container">
            <Label :text="'Bonjour, ' + userName" class="welcome-text" />
            <Button text="Laissez-nous un commentaire" class="review-button" />
          </StackLayout>

          <!-- Si pas connecté -->
          <StackLayout v-if="!isLoggedIn" row="1" class="login-prompt">
            <Label text="Vous devez être connecté pour voir vos rendez-vous" class="login-message" textWrap="true" />
            <Button text="Se connecter" @tap="allerConnexion" class="login-button" />
          </StackLayout>

          <!-- Loading indicator -->
          <ActivityIndicator v-else-if="loading" busy="true" color="#FFCC33" row="1" />

          <!-- Liste des rendez-vous -->
          <ScrollView v-else row="1">
            <StackLayout class="appointments-container">
              <!-- Message si aucun rendez-vous -->
              <StackLayout v-if="rendezVous.length === 0" class="no-appointments">
                <Label text="Vous n'avez aucun rendez-vous" class="no-appointments-text" textWrap="true" />
                <Button text="Prendre rendez-vous" @tap="allerBarbiers" class="book-button" />
              </StackLayout>

              <!-- Prochain rendez-vous -->
              <GridLayout v-else columns="auto, *, auto" class="next-appointment">
                <Image src="~/assets/images/calendar-icon-alt.png" class="calendar-icon" col="0" />
                <Label :text="'Next appointment\n' + formatNextAppointment()" class="next-text" col="1" />
                <Button text="×" class="delete-btn" col="2" @tap="annulerProchainRendezVous()" />
              </GridLayout>

              <!-- Liste des rendez-vous -->
              <StackLayout class="appointment-list">
                <StackLayout v-for="rdv in rendezVous" :key="rdv.id" class="appointment-card">
                  <GridLayout columns="auto, *" class="appointment-header">
                    <Label :text="'Date: ' + formatAppointmentDate(rdv.date)" class="appointment-date" col="0" />
                    <Label :text="getServicePrice(rdv) + ' DA'" class="appointment-price" col="1" />
                  </GridLayout>
                  <StackLayout class="appointment-details">
                    <Label :text="'With: ' + getBarberName(rdv)" class="appointment-with" />
                    <Label :text="'Services: ' + getServiceName(rdv)" class="appointment-services" />
                  </StackLayout>
                  <Button text="Cancel appointment" @tap="annulerRendezVous(rdv.id)" class="cancel-btn" />
                </StackLayout>
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
          <StackLayout col="1" class="nav-item" @tap="allerVersPage('Barbiers')">
            <Image src="~/assets/images/barber-icon.png" class="nav-icon" />
            <Label text="Barbiers" class="nav-text" />
          </StackLayout>
          <StackLayout col="2" class="nav-item active" @tap="allerVersPage('Rendez-vous')">
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
        return user ? user.prenom : 'Invité';
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
        return `${formatDisplayDate(rdv.date)} - ${formatDisplayTime(rdv.date)} with ${this.getBarberName(rdv)}`;
      },

      formatAppointmentDate(date) {
        return `${formatDisplayDate(date)} - ${formatDisplayTime(date)}`;
      },

      getBarberName(rdv) {
        return rdv.Barbier ? rdv.Barbier.nom : 'Unknown';
      },

      getServiceName(rdv) {
        return rdv.Service ? rdv.Service.nom : 'Unknown';
      },

      getServicePrice(rdv) {
        return rdv.Service ? rdv.Service.prix : 0;
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

  .appointments-container {
    background-color: #000000;
    padding: 10;
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
  background-color: #333333;
  border-radius: 10;
  padding: 10;
  margin-bottom: 15;
}

.calendar-icon {
  width: 24;
  height: 24;
  color: #FFCC33;
}

.next-text {
  color: #ffffff;
  font-size: 14;
  margin-left: 5;
}

.delete-btn {
  color: #ff4d4d;
  font-size: 20;
  background-color: transparent;
  width: 30;
  height: 30;
  padding: 0;
}

.appointment-card {
  background-color: #333333;
  border-radius: 10;
  padding: 15;
  margin-bottom: 15;
}

.appointment-date {
  color: #ffffff;
  font-size: 16;
  font-weight: bold;
}

.appointment-price {
  color: #ffffff;
  font-size: 16;
  font-weight: bold;
  text-align: right;
}

.cancel-btn {
  background-color: #ff4d4d;
  color: #ffffff;
  border-radius: 20;
  height: 40;
  font-size: 14;
  margin-top: 10;
}

  .error-message {
    color: #ff4d4d;
    text-align: center;
    margin: 20;
  }

  .nav-bar {
    background-color: #000000;
      border-top-color: #333333;
      height: 70;
      padding-bottom: 5;
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
