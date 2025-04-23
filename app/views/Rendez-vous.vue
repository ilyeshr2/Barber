<!-- app/views/Rendez-vous.vue (Updated) -->
vueCopy<template>
  <Page actionBarHidden="true">
    <GridLayout rows="auto, auto, *, auto">
      <!-- En-tête -->
      <GridLayout columns="auto, *, auto" class="header" row="0">
        <Image :src="userAvatar" class="user-avatar" col="0" />
        <Label text="" col="1" />
        <Image :src="salonLogo" class="app-icon" col="2" />
      </GridLayout>

      <!-- Title container (moved after header) -->
      <StackLayout row="1" class="title-container">
        <Label text="Rendez-vous" class="app-title" />
        <Label :text="'Bonjour, ' + userName" class="welcome-text" />
        <!-- Bouton review -->
        <Button text="Donnez-nous votre avis" class="review-button" />
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

          <!-- Error message with retry button -->
          <StackLayout v-else-if="error" class="error-container">
            <Label class="error-message" :text="error" textWrap="true" />
            <Button text="Réessayer" @tap="loadAppointments" class="retry-button" />
          </StackLayout>

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
                  <Label text="Prochain rendez-vous" class="next-title" />
                  <Label :text="formatNextAppointment()" class="next-details" />
                </StackLayout>
                <Button text="✕" class="delete-btn" col="2" @tap="annulerProchainRendezVous()" />
              </GridLayout>

              <!-- Liste des rendez-vous -->
              <StackLayout class="appointment-list">
                <StackLayout v-for="rdv in rendezVous" :key="rdv.id" class="appointment-card">
                  <GridLayout rows="auto, auto, auto, auto">
                    <GridLayout row="0" columns="auto, *">
                      <Label text="Date: " class="appointment-label" col="0" />
                      <Label :text="formatAppointmentDate(rdv.date)" class="appointment-value" col="1" />
                    </GridLayout>
                    <GridLayout row="1" columns="auto, *">
                      <Label text="Avec: " class="appointment-label" col="0" />
                      <Label :text="getBarberName(rdv)" class="appointment-value" col="1" />
                    </GridLayout>
                    <GridLayout row="2" columns="auto, *">
                      <Label text="Services: " class="appointment-label" col="0" />
                      <Label :text="getServiceName(rdv)" class="appointment-value" col="1" />
                    </GridLayout>
                    <GridLayout row="3" columns="*, auto">
                      <Button text="Annuler le rendez-vous" @tap="annulerRendezVous(rdv.id)" class="cancel-btn" col="0" />
                      <Label :text="getServicePrice(rdv) + ' CAD'" class="price-label" col="1" />
                    </GridLayout>
                  </GridLayout>
                </StackLayout>
              </StackLayout>
            </StackLayout>
          </StackLayout>
        </StackLayout>
      </ScrollView>

      <!-- Barre de navigation -->
      <NavigationBar row="3" currentPage="Rendez-vous" />
    </GridLayout>
  </Page>
</template>

<script>
import { rendezVousService, authService, salonService } from '../services/api';
import { formatAppointmentDate, formatDisplayTime } from '../utils/helpers';
import { confirm, alert } from '@nativescript/core/ui/dialogs';
import NavigationBar from '../components/NavigationBar';

export default {
  components: {
    NavigationBar
  },
  data() {
    return {
      rendezVous: [],
      loading: true,
      error: null,
      userAvatar: '~/assets/images/user-avatar.png',
      userInfo: null,
      cancellingId: null, // Track which appointment is currently being cancelled
      salonLogo: '~/assets/images/yaniso-logo.png'
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
    this.loadSalonInfo();

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
        this.error = 'Unable to load your appointments. Please try again.';
      } finally {
        this.loading = false;
      }
    },

    formatNextAppointment() {
      if (this.rendezVous.length === 0) return '';
      
      const rdv = this.rendezVous[0];
      // Utiliser la même approche que formatAppointmentDate
      const [datePart, timePart] = rdv.date.split('T');
      const [year, month, day] = datePart.split('-').map(Number);
      const [hour, minute] = timePart.split(':').map(Number);
      
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      // Formater l'heure manuellement
      const formattedHour = hour.toString().padStart(2, '0');
      const formattedMinute = minute.toString().padStart(2, '0');
      
      return `${day} ${months[month-1]} - ${formattedHour}:${formattedMinute} with ${this.getBarberName(rdv)}`;
    },

    formatAppointmentDate(dateString) {
      // Récupérer les composants de la date directement à partir de la chaîne
      const [datePart, timePart] = dateString.split('T');
      const [year, month, day] = datePart.split('-').map(Number);
      const [hour, minute] = timePart.split(':').map(Number);
      
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      // Créer une date locale sans conversion de fuseau horaire
      const date = new Date(year, month - 1, day, hour, minute);
      const dayOfWeek = date.getDay();
      
      // Formater l'heure manuellement pour éviter les conversions
      const formattedHour = hour.toString().padStart(2, '0');
      const formattedMinute = minute.toString().padStart(2, '0');
      
      return `${days[dayOfWeek]} ${day} ${months[month - 1]} ${year} - ${formattedHour}:${formattedMinute}`;
    },

    getBarberName(rdv) {
      return rdv.Barbier ? rdv.Barbier.nom : 'Unknown Barber';
    },

    getServiceName(rdv) {
      return rdv.Service ? rdv.Service.nom : 'Unknown Service';
    },

    getServicePrice(rdv) {
      return rdv.Service ? rdv.Service.prix : 0;
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
        title: "Cancel Appointment",
        message: "Are you sure you want to cancel this appointment?",
        okButtonText: "Yes",
        cancelButtonText: "No"
      });

      if (result) {
        try {
          this.cancellingId = id;
          await rendezVousService.cancelAppointment(id);
          
          // Show success message
          await alert({
            title: "Appointment Cancelled",
            message: "Your appointment has been successfully cancelled.",
            okButtonText: "OK"
          });

          // Reload appointments
          this.loadAppointments();
        } catch (error) {
          console.error('Error cancelling appointment:', error);
          alert({
            title: "Error",
            message: "Failed to cancel appointment. Please try again.",
            okButtonText: "OK"
          });
        } finally {
          this.cancellingId = null;
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
    },

    async loadSalonInfo() {
      try {
        const salon = await salonService.getSalonInfo();
        if (salon && salon.logoUrl) {
          console.log('Setting salon logo to:', salon.logoUrl);
          this.salonLogo = salon.logoUrl;
        }
      } catch (error) {
        console.error('Error loading salon info:', error);
        // Keep default logo if the API fails
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
  color: #ffcd50;
  border-width: 1;
  border-color: #ffcd50;
  border-radius: 20;
  height: 40;
  text-transform: none;
  font-size: 14;
  margin-top: 20;
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
  background-color: #212121;
  border-radius: 15;
  padding: 10;
  margin-bottom: 15;
}

.calendar-icon {
  width: 24;
  height: 24;
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
  background-color: #212121;
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
  background-color: rgba(255, 77, 77, 0.2);
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
  font-size: 16;
}

.loading-indicator {
  margin: 50;
}
.error-container {
  padding: 20;
  justify-content: center;
  align-items: center;
}


.retry-button {
  background-color: #ffcd50;
  color: #000000;
  font-size: 16;
  border-radius: 20;
  height: 40;
  width: 150;
}
</style>