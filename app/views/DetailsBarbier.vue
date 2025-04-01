<!-- app/views/DetailsBarbier.vue -->
<template>
    <Page actionBarHidden="true">
      <GridLayout rows="auto, *">
        <!-- En-tête -->
        <GridLayout columns="auto, *" class="header" row="0">
          <Button text="←" @tap="retour" class="btn-retour" col="0" />
          <Label :text="barbier ? barbier.nom : 'Détails du barbier'" class="barbier-title" col="1" />
        </GridLayout>
        
        <!-- Loading indicator -->
        <ActivityIndicator v-if="loading" busy="true" color="#FFCC33" row="1" />
        
        <!-- Contenu principal -->
        <ScrollView v-else-if="!error" row="1">
          <StackLayout class="details-container">
            <!-- Photo et rating -->
            <GridLayout rows="auto" columns="auto, *, auto" class="barbier-header">
              <Image :src="getBarbierImage()" class="barbier-photo" col="1" stretch="aspectFill" />
              <StackLayout class="rating-container" col="2">
                <Label :text="barbier.note.toFixed(1)" class="rating-value" />
                <Label text="★" class="rating-star" />
                <Label :text="barbier.nombreAvis + ' Reviews'" class="reviews-count" />
              </StackLayout>
            </GridLayout>
            
            <!-- Services offerts -->
            <Label text="Services Offered" class="section-title" />
            <StackLayout class="services-container">
              <GridLayout v-for="service in services" :key="service.id" 
                         columns="auto, *, auto" class="service-item" @tap="selectionnerService(service)">
                <Label :text="service.selected ? '✓' : ''" class="service-check" col="0" />
                <StackLayout col="1">
                  <Label :text="service.nom" class="service-name" />
                  <Label :text="service.duree + ' minutes'" class="service-duration" />
                </StackLayout>
                <Label :text="service.prix + ' DA'" class="service-price" col="2" />
              </GridLayout>
            </StackLayout>
            
            <!-- Dates disponibles -->
            <Label text="Available dates" class="section-title" />
            <ScrollView orientation="horizontal" class="dates-scroll">
              <StackLayout orientation="horizontal">
                <StackLayout v-for="date in dates" :key="date.id" 
                             class="date-item" :class="{ 'date-selected': date.selected }"
                             @tap="selectionnerDate(date)">
                  <Label :text="date.jour" class="date-day" />
                  <Label :text="date.numero" class="date-number" />
                  <Label :text="date.mois" class="date-month" />
                </StackLayout>
              </StackLayout>
            </ScrollView>
            
            <!-- Horaires disponibles -->
            <Label text="Available schedules" class="section-title" />
            <GridLayout v-if="!selectedService" class="no-selection">
              <Label text="No service selected" class="no-selection-text" />
            </GridLayout>
            <GridLayout v-else columns="*, *, *" rows="auto, auto, auto, auto, auto, auto" class="schedules-grid">
              <StackLayout v-for="(horaire, index) in horaires" :key="horaire.id"
                         :row="Math.floor(index/3)" :col="index%3"
                         class="schedule-item" :class="{ 'schedule-selected': horaire.selected }"
                         @tap="selectionnerHoraire(horaire)">
                <Label :text="horaire.heure" class="schedule-time" />
              </StackLayout>
            </GridLayout>
            
            <!-- Codes promo -->
            <Label text="Voucher" class="section-title" />
            <StackLayout class="voucher-container">
              <Label text="No promotion code available" class="no-voucher-text" />
            </StackLayout>
            
            <!-- Bouton de réservation -->
            <Button v-if="canBook" text="Book" @tap="reserver" class="book-button" />
            <Button v-else text="Book" class="book-button book-button-disabled" />
          </StackLayout>
        </ScrollView>
        
        <!-- Error message -->
        <StackLayout v-else row="1" class="error-container">
          <Label :text="error" class="error-message" textWrap="true" />
          <Button text="Réessayer" @tap="loadBarberDetails" class="retry-button" />
        </StackLayout>
      </GridLayout>

      <!-- Bottom sheet modal - updated implementation -->
      <StackLayout v-if="showConfirmationModal" class="modal-overlay">
        <StackLayout class="confirmation-sheet">
          <!-- Indicator bar -->
          <StackLayout class="indicator-bar"></StackLayout>
          
          <!-- Confirmation content -->
          <Label text="Your Appointment" class="sheet-title" />
          
          <!-- Appointment details -->
          <GridLayout rows="auto, auto, auto" columns="auto, *" class="details-grid">
            <!-- Date -->
            <Label text="Date:" class="details-label" row="0" col="0" />
            <Label :text="formatConfirmationDate()" class="details-value" row="0" col="1" />
            
            <!-- With -->
            <Label text="With:" class="details-label" row="1" col="0" />
            <Label :text="barbier ? barbier.nom : ''" class="details-value" row="1" col="1" />
            
            <!-- Services -->
            <Label text="Services:" class="details-label" row="2" col="0" />
            <Label :text="selectedService ? selectedService.nom + '.' : ''" class="details-value" row="2" col="1" />
          </GridLayout>
          
          <!-- Price -->
          <Label :text="selectedService ? selectedService.prix + ' DA' : ''" class="price" />
          
          <!-- Confirm button -->
          <Button text="I confirm" @tap="confirmerReservation" class="confirm-button" :isEnabled="!confirming" />
          
          <!-- Loading indicator -->
          <ActivityIndicator v-if="confirming" busy="true" color="#FFCC33" class="loading-indicator" />
          
          <!-- Error message -->
          <Label v-if="confirmationError" class="error-message" :text="confirmationError" textWrap="true" />
        </StackLayout>
      </StackLayout>
    </Page>
</template>
  
  <script>
  import { barbierService, rendezVousService, authService } from '../services/api';
  import { generateAvailableDates, generateTimeSlots, formatDate, formatDisplayTime } from '../utils/helpers';
  import { confirm, alert } from '@nativescript/core/ui/dialogs';
  
  export default {
    props: {
      barbierId: {
        type: Number,
        required: true
      }
    },
    data() {
      return {
        barbier: null,
        services: [],
        dates: generateAvailableDates(),
        horaires: generateTimeSlots(),
        selectedService: null,
        selectedDate: null,
        selectedHoraire: null,
        loading: true,
        error: null,
        userInfo: null,
        showConfirmationModal: false,
        confirming: false,
        confirmationError: '',
        appointmentDate: null
      };
    },
    computed: {
      canBook() {
        return this.selectedService && this.selectedDate && this.selectedHoraire;
      }
    },
    mounted() {
      this.loadBarberDetails();
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
      async loadBarberDetails() {
        this.loading = true;
        this.error = null;
        
        try {
          this.barbier = await barbierService.getBarberById(this.barbierId);
          const barberServices = await barbierService.getBarberServices(this.barbierId);
          
          // Map services to our format
          this.services = barberServices.map(service => ({
            ...service,
            selected: false
          }));
          
          // Initialize dates
          this.dates = generateAvailableDates();
          this.selectedDate = this.dates.find(date => date.selected);
          
        } catch (error) {
          console.error('Error loading barber details:', error);
          this.error = 'Erreur lors du chargement des détails du barbier';
        } finally {
          this.loading = false;
        }
      },
      
      retour() {
        this.$navigateBack();
      },
      
      selectionnerService(service) {
        this.services.forEach(s => s.selected = false);
        service.selected = true;
        this.selectedService = service;
      },
      
      selectionnerDate(date) {
        this.dates.forEach(d => d.selected = false);
        date.selected = true;
        this.selectedDate = date;
        
        // Reset time selection
        this.horaires.forEach(h => h.selected = false);
        this.selectedHoraire = null;
      },
      
      selectionnerHoraire(horaire) {
        this.horaires.forEach(h => h.selected = false);
        horaire.selected = true;
        this.selectedHoraire = horaire;
      },
      
      getBarbierImage() {
        // Fallback to default image if photoUrl is missing or invalid
        if (!this.barbier || !this.barbier.photoUrl || this.barbier.photoUrl.includes('imgur')) {
          return `~/assets/images/barber-${this.barbierId}.jpg`;
        }
        return this.barbier.photoUrl;
      },
      
      // Format date for confirmation screen
      formatConfirmationDate() {
        if (!this.appointmentDate) return '';
        
        // Format date in "Thursday 03 April 2025 - 14:00" format
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const dayName = days[this.appointmentDate.getDay()];
        
        const day = this.appointmentDate.getDate().toString().padStart(2, '0');
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        const month = months[this.appointmentDate.getMonth()];
        const year = this.appointmentDate.getFullYear();
        const time = formatDisplayTime(this.appointmentDate);
        
        return `${dayName} ${day} ${month} ${year} - ${time}`;
      },
      
      reserver() {
        if (!this.canBook) return;
        
        // Check if user is logged in
        if (!authService.isLoggedIn()) {
          confirm({
            title: "Connexion requise",
            message: "Vous devez être connecté pour effectuer une réservation. Souhaitez-vous vous connecter maintenant?",
            okButtonText: "Se connecter",
            cancelButtonText: "Annuler"
          }).then(result => {
            if (result) {
              this.$navigateTo(require('./Connexion').default);
            }
          });
          return;
        }
        
        // Create appointment date/time
        this.appointmentDate = new Date(this.selectedDate.date);
        const [hours, minutes] = this.selectedHoraire.heure.split(':').map(Number);
        this.appointmentDate.setHours(hours, minutes, 0, 0);
        
        // Show confirmation modal
        this.showConfirmationModal = true;
      },
      
      async confirmerReservation() {
        this.confirming = true;
        this.confirmationError = '';
        
        try {
          await rendezVousService.createAppointment({
            barbierId: this.barbier.id,
            serviceId: this.selectedService.id,
            date: this.appointmentDate.toISOString()
          });
          
          // Hide modal after successful booking
          this.showConfirmationModal = false;
          
          // Navigate to appointments page
          this.$navigateTo(require('./Rendez-vous').default, {
            clearHistory: true
          });
        } catch (error) {
          console.error('Error creating appointment:', error);
          this.confirmationError = error.message || 'Erreur lors de la création du rendez-vous';
        } finally {
          this.confirming = false;
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

  .modal-overlay {
  vertical-align: bottom; /* This is key - align to bottom of screen */
  /* No background color or width/height to avoid covering the entire screen */
}

.confirmation-sheet {
  background-color: #000000;
  border-top-left-radius: 20;
  border-top-right-radius: 20;
  padding-bottom: 20;
  width: 100%;
}

.indicator-bar {
  height: 4;
  width: 40;
  background-color: #666666;
  border-radius: 2;
  margin-top: 10;
  margin-bottom: 10;
  align-self: center;
}

.sheet-title {
  color: #ffffff;
  font-size: 20;
  font-weight: bold;
  text-align: center;
  margin-bottom: 15;
}

.details-grid {
  margin-bottom: 10;
  padding-left: 15;
  padding-right: 15;
}

.details-label {
  color: #999999;
  font-size: 16;
  margin-bottom: 5;
  width: 80;
}

.details-value {
  color: #ffffff;
  font-size: 16;
  margin-bottom: 5;
}

.price {
  color: #ffffff;
  font-size: 24;
  font-weight: bold;
  margin-top: 5;
  margin-bottom: 15;
  padding-left: 15;
}

.confirm-button {
  background-color: #FFCC33;
  color: #000000;
  font-size: 18;
  font-weight: bold;
  border-radius: 25;
  height: 50;
  margin: 0 15;
}

.loading-indicator {
  margin-top: 10;
}

.error-message {
  color: #ff4d4d;
  text-align: center;
  margin-top: 10;
  font-size: 14;
  padding: 0 15;
}
  
  .btn-retour {
    font-size: 24;
    background-color: #333333;
    color: #ffffff;
    border-radius: 20;
    width: 40;
    height: 40;
    padding: 0;
  }
  
  .barbier-title {
    color: #ffffff;
    font-size: 20;
    font-weight: bold;
    text-align: center;
  }
  
  .details-container {
    background-color: #000000;
    padding: 10;
  }
  
  .barbier-header {
    margin-bottom: 20;
  }
  
  .barbier-photo {
    width: 100;
    height: 100;
    border-radius: 50;
  }
  
  .rating-container {
    background-color: #333333;
    border-radius: 5;
    padding: 5;
    margin-left: 10;
    text-align: center;
  }
  
  .rating-value {
    color: #ffffff;
    font-size: 18;
    font-weight: bold;
  }
  
  .rating-star {
    color: #FFCC33;
    font-size: 18;
  }
  
  .reviews-count {
    color: #999999;
    font-size: 12;
  }
  
  .section-title {
    color: #ffffff;
    font-size: 18;
    font-weight: bold;
    margin-top: 15;
    margin-bottom: 10;
  }
  
  .services-container {
    margin-bottom: 15;
  }
  
  .service-item {
    background-color: #333333;
    border-radius: 10;
    padding: 15;
    margin-bottom: 10;
  }
  
  .service-check {
    color: #ffffff;
    font-size: 18;
    width: 30;
    text-align: center;
  }
  
  .service-name {
    color: #ffffff;
    font-size: 16;
  }
  
  .service-duration {
    color: #999999;
    font-size: 14;
  }
  
  .service-price {
    color: #ffffff;
    font-size: 18;
    font-weight: bold;
  }
  
  .dates-scroll {
    margin-bottom: 15;
  }
  
  .date-item {
    background-color: #333333;
    border-radius: 10;
    padding: 10;
    margin-right: 10;
    width: 70;
    text-align: center;
  }
  
  .date-selected {
    background-color: #FFCC33;
  }
  
  .date-day {
    color: #ffffff;
    font-size: 14;
  }
  
  .date-number {
    color: #ffffff;
    font-size: 18;
    font-weight: bold;
  }
  
  .date-month {
    color: #ffffff;
    font-size: 14;
  }
  
  .date-selected .date-day,
  .date-selected .date-number,
  .date-selected .date-month {
    color: #000000;
  }
  
  .no-selection {
    background-color: #333333;
    border-radius: 10;
    padding: 20;
    text-align: center;
    margin-bottom: 15;
  }
  
  .no-selection-text {
    color: #999999;
    font-size: 16;
  }
  
  .schedules-grid {
    margin-bottom: 15;
  }
  
  .schedule-item {
    background-color: #333333;
    border-radius: 10;
    padding: 10;
    margin: 5;
    text-align: center;
  }
  
  .schedule-selected {
    background-color: #FFCC33;
  }
  
  .schedule-time {
    color: #ffffff;
    font-size: 14;
  }
  
  .schedule-selected .schedule-time {
    color: #000000;
  }
  
  .voucher-container {
    background-color: #333333;
    border-radius: 10;
    padding: 15;
    margin-bottom: 20;
  }
  
  .no-voucher-text {
    color: #999999;
    font-size: 14;
    text-align: center;
  }
  
  .book-button {
    background-color: #FFCC33;
    color: #000000;
    font-size: 18;
    font-weight: bold;
    border-radius: 20;
    height: 50;
    margin-top: 10;
    margin-bottom: 20;
  }
  
  .book-button-disabled {
    background-color: #666666;
    color: #333333;
  }
  
  .error-container {
    background-color: #000000;
    padding: 20;
    justify-content: center;
    align-items: center;
  }
  
  .error-message {
    color: #ff4d4d;
    text-align: center;
    margin-bottom: 20;
    font-size: 16;
  }
  
  .retry-button {
    background-color: #FFCC33;
    color: #000000;
    font-size: 16;
    border-radius: 20;
    height: 40;
    width: 150;
  }
  
  /* Modal styles */
  .modal-container {
  z-index: 9999;
}
  
  
.confirmation-sheet {
  background-color: #000000;
  border-top-left-radius: 20;
  border-top-right-radius: 20;
  padding-bottom: 20;
}
  
.indicator-bar {
  height: 4;
  width: 40;
  background-color: #666666;
  border-radius: 2;
  margin-top: 10;
  margin-bottom: 10;
  align-self: center;
}
  
  .confirmation-content {
    padding: 15;
  }
  
  .sheet-title {
  color: #ffffff;
  font-size: 20;
  font-weight: bold;
  text-align: center;
  margin-bottom: 15;
}
  
.details-grid {
  margin-bottom: 10;
  padding-left: 15;
  padding-right: 15;
}

  
.details-label {
  color: #999999;
  font-size: 16;
  margin-bottom: 5;
  width: 80;
}
  
  .details-value {
    color: #ffffff;
    font-size: 16;
    margin-bottom: 5;
  }
  
  .price {
  color: #ffffff;
  font-size: 24;
  font-weight: bold;
  margin-top: 5;
  margin-bottom: 15;
  padding-left: 15;
}

.confirm-button {
  background-color: #FFCC33;
  color: #000000;
  font-size: 18;
  font-weight: bold;
  border-radius: 25;
  height: 50;
  margin: 0 15;
}
  
  .loading-indicator {
    margin-top: 10;
  }
  
  .error-message {
  color: #ff4d4d;
  text-align: center;
  margin-top: 10;
  font-size: 14;
  padding: 0 15;
}
  </style>