<!-- app/views/DetailsBarbier.vue -->
<!-- app/views/DetailsBarbier.vue -->
<template>
  <Page actionBarHidden="true">
    <GridLayout rows="auto, *, auto">
      <!-- Header with back button and barber info -->
      <GridLayout row="0" columns="auto, *, auto" class="header">
        <Button text="<" @tap="retour" class="back-button" col="0" />
      </GridLayout>
      
      <!-- Main content -->
      <ScrollView row="1" class="content-container">
        <StackLayout>
          <!-- Loading indicator -->
          <ActivityIndicator v-if="loading" busy="true" color="#ffcd50" />
          
          <StackLayout v-if="!loading && !error">
            <!-- Barber profile header -->
            <StackLayout class="barber-header">
              <Image :src="getBarbierImage()" width="140" height="140" class="barber-pic-h"  stretch="aspectFill" />
              <Label :text="barbier ? barbier.nom : ''" class="barber-name" />
              <StackLayout class="stars-container">
                <Label text="★★★★★" class="rating-stars" />
                <Label :text="(barbier ? barbier.nombreAvis : 0) + ' Reviews'" class="reviews-count" />
              </StackLayout>
            </StackLayout>
            
            <!-- Services section -->
            <StackLayout class="section-container">
              <Label text="Services Offered" class="section-title" />
              <StackLayout class="services-list">
                <GridLayout v-for="service in services" :key="service.id" 
                            columns="auto, *, auto" rows="auto, auto" class="service-item" @tap="selectionnerService(service)">
                  <StackLayout col="0" row="0" rowSpan="2" class="check-container" v-if="service.selected" horizontalAlignment="center" verticalAlignment="center">
                    <Label text="✓" class="check-icon" />
                  </StackLayout>
                  <Label :text="service.nom" class="service-name" col="1" row="0" />
                  <Label :text="service.duree + ' minutes'" class="service-duration" col="1" row="1" />
                  <Label :text="service.prix + ' DA'" class="service-price" col="2" row="0" rowSpan="2" verticalAlignment="center" />
                </GridLayout>
              </StackLayout>
              
            </StackLayout>

            
            <!-- Available dates section -->
            <StackLayout class="section-container">
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
            </StackLayout>
          
            
            <!-- Available schedules section -->
            <StackLayout class="section-container">
              <Label text="Available schedules" class="section-title" />
              
              <!-- No service selected message -->
              <Label v-if="!selectedService" text="No service selected" class="no-selection-text" />
              
              <!-- Time slots grid -->
              <GridLayout v-else columns="*, *, *" rows="auto, auto, auto, auto, auto, auto, auto, auto" class="schedules-grid">
                <StackLayout v-for="(horaire, index) in horaires" :key="horaire.id"
                          :row="Math.floor(index/3)" :col="index%3"
                          class="schedule-item" :class="{ 'schedule-selected': horaire.selected }"
                          @tap="selectionnerHoraire(horaire)">
                  <Label :text="horaire.heure" class="schedule-time" />
                </StackLayout>
              </GridLayout>
            </StackLayout>
            
            
            <!-- Voucher section -->
            <StackLayout class="section-container">
              <Label text="Voucher" class="section-title" />
              <Label text="No promotion code available" class="no-voucher-text" />
            </StackLayout>
          </StackLayout>
          
          <!-- Error message -->
          <StackLayout v-if="error" class="error-container">
            <Label :text="error" class="error-message" textWrap="true" />
            <Button text="Retry" @tap="loadBarberDetails" class="retry-button" />
          </StackLayout>
          
          <!-- Add extra space at bottom to ensure content isn't hidden behind footer -->
          <StackLayout height="80"></StackLayout>
        </StackLayout>
      </ScrollView>
      
      <!-- Sticky Footer -->
      <GridLayout row="2" class="sticky-footer">
        <!-- Book Button -->
        <Button text="Book" @tap="reserver" class="book-button" />
      </GridLayout>
      
      <!-- Bottom sheet modal -->
      <StackLayout v-if="showConfirmationModal" class="modal-overlay" row="0" rowSpan="3">
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
            <Label :text="selectedService ? selectedService.nom : ''" class="details-value" row="2" col="1" />
          </GridLayout>
          
          <!-- Price -->
          <Label :text="selectedService ? selectedService.prix + ' $' : ''" class="price" />
          
          <!-- Confirm button -->
          <Button text="I confirm" @tap="confirmerReservation" class="confirm-button" />
          
          <!-- Loading indicator -->
          <ActivityIndicator v-if="confirming" busy="true" color="#ffcd50" class="loading-indicator" />
          
          <!-- Error message -->
          <Label v-if="confirmationError" class="error-message" :text="confirmationError" textWrap="true" />
        </StackLayout>
      </StackLayout>
    </GridLayout>
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
        this.error = 'Error loading barber details';
      } finally {
        this.loading = false;
      }
    },
    
    retour() {
      this.$navigateBack();
    },
    
    toggleSection() {
      // Your existing toggle functionality
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
          title: "Login Required",
          message: "You need to be logged in to make a reservation. Would you like to log in now?",
          okButtonText: "Log in",
          cancelButtonText: "Cancel"
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
        this.confirmationError = error.message || 'Error creating appointment';
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
  padding: 5 16;
  height: 50;
}
.sticky-footer {
  background-color: #000000;
  padding: 10 16;
  height: 80;
  border-top-width: 1;
  border-top-color: #222222;
}
.stars-container {
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  margin-top: 5;
}

.rating-stars {
  color: #ffcd50;
  font-size: 16;
}

.reviews-count {
  color: #999999;
  font-size: 14;
  margin-left: 5;
}

.book-button {
  background-color: #ffcd50;
  color: #000000;
  font-size: 18;
  font-weight: bold;
  height: 50;
  border-radius: 25;
  margin: 15;
}

.content-container {
  background-color: #000000;
}
.barber-pic-h{
border-radius: 100;
}
.back-button {
  font-size: 20;
  background-color: #222222;
  color: #ffffff;
  border-radius: 20;
  width: 40;
  height: 40;
  padding: 0;
  margin-right: 10;
  text-align: center;
  vertical-align: middle;
}

.barber-name-title {
  color: #ffffff;
  font-size: 20;
  font-weight: bold;
  text-align: center;
}

.barber-small-pic {
  width: 40;
  height: 40;
  border-radius: 20;
  margin-left: 10;
}

.content-container {
  background-color: #000000;
  padding-bottom: 80;
}

.barber-header {
  padding: 20 0;
  text-align: center;
}

.barber-photo {
  width: 120;
  height: 120;
  border-radius: 60;
  margin-bottom: 15;
  align-self: center;
}

.barber-name {
  color: #ffffff;
  font-size: 24;
  font-weight: bold;
  text-align: center;
  margin-bottom: 5;
}

.rating-stars {
  color: #ffcd50;
  font-size: 16;
}

.reviews-count {
  color: #999999;
  font-size: 14;
  margin-left: 5;
}

.section-container {
  padding: 0 16 20 16;
}

.section-title {
  color: #ffffff;
  font-size: 24;
  font-weight: bold;
  margin-bottom: 15;
  margin-top: 10;
}

.services-list {
  margin-bottom: 15;
}

.service-item {
  background-color: #222222;
  border-radius: 15;
  margin-bottom: 10;
  padding: 15;
  height: 80;
}

.check-container {
  width: 24;
  height: 24;
  background-color: #ffffff;
  border-radius: 12;
  margin-right: 10;
}

.check-icon {
  color: #000000;
  font-size: 16;
  font-weight: bold;
  text-align: center;
}

.service-name {
  color: #ffffff;
  font-size: 18;
  font-weight: bold;
}

.service-duration {
  color: #999999;
  font-size: 14;
}

.service-price {
  color: #ffffff;
  font-size: 18;
  font-weight: bold;
  text-align: right;
}



.dates-scroll {
  margin-bottom: 5;
  height: 85;
}

.date-item {
  background-color: #222222;
  border-radius: 20;
  width: 70;
  height: 85;
  margin-right: 10;
  padding: 10 0;
  text-align: center;
}

.date-selected {
  background-color: #ffffff;
}

.date-day {
  color: #ffffff;
  font-size: 14;
}

.date-number {
  color: #ffffff;
  font-size: 22;
  font-weight: bold;
  margin: 3 0;
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

.no-selection-text {
  text-align: center;
  color: #999999;
  font-size: 16;
  padding: 20 0;
}

.schedules-grid {
  margin-bottom: 20;
}

.schedule-item {
  background-color: #222222;
  border-radius: 20;
  margin: 5;
  padding: 12 0;
  text-align: center;
}

.schedule-selected {
  background-color: #ffffff;
}

.schedule-time {
  color: #ffffff;
  font-size: 16;
}

.schedule-selected .schedule-time {
  color: #000000;
  font-weight: bold;
}

.no-voucher-text {
  color: #999999;
  font-size: 16;
  text-align: center;
  padding: 20 0;
}

.book-button {
  background-color: #ffcd50;
  color: #000000;
  font-size: 18;
  font-weight: bold;
  height: 55;
  margin: 15;
  border-radius: 30;
}

.error-container {
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
  background-color: #ffcd50;
  color: #000000;
  font-size: 16;
  border-radius: 20;
  height: 40;
  width: 150;
}

/* Modal styles */
.modal-overlay {
  background-color: rgba(0, 0, 0, 0.5);
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 9999;
  vertical-align: bottom;
}

.confirmation-sheet {
  background-color: #212121;
  border-top-left-radius: 20;
  border-top-right-radius: 20;
  padding-bottom: 20;
  vertical-align: bottom;
  margin-top: auto;
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
  background-color: #ffcd50;
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
</style>