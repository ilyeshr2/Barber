<!-- app/views/DetailsBarbier.vue (Updated for Dynamic Data) -->
<template>
  <Page actionBarHidden="true">
    <GridLayout rows="auto, *, auto">
      <!-- Header with back button and barber info -->
      <GridLayout row="0" columns="auto, *" class="header">
        <Button text="<" @tap="retour" class="back-button" col="0" />
      </GridLayout>
      
      <!-- Main content -->
      <ScrollView row="1" class="content-container">
        <StackLayout>
          <!-- Loading indicator -->
          <ActivityIndicator v-if="loading" busy="true" color="#ffcd50" class="loading-indicator" />
          
          <!-- Error message with retry button -->
          <StackLayout v-else-if="error" class="error-container">
            <Label class="error-message" :text="error" textWrap="true" />
            <Button text="Réessayer" @tap="loadBarberDetails" class="retry-button" />
          </StackLayout>
          
          <StackLayout v-else>
            <!-- Barber profile header -->
            <StackLayout class="barber-header">
              <Image :src="getBarbierImage()" width="140" height="140" class="barber-pic-h" stretch="aspectFill" @error="onImageError(barbier.photoUrl, 'barber-details')" />
              <Label :text="barbier ? barbier.nom : ''" class="barber-name" />
              <StackLayout class="stars-container">
                <Label text="★★★★★" class="rating-stars" />
                <Label :text="(barbier ? barbier.nombreAvis : 0) + ' avis'" class="reviews-count" />
              </StackLayout>
            </StackLayout>
            
            <!-- Services section -->
            <StackLayout class="section-container">
              <Label text="Services proposés" class="section-title" />
              <StackLayout class="services-list" v-if="!servicesLoading">
                <GridLayout v-for="service in services" :key="service.id" 
                            columns="auto, *, auto" rows="auto, auto" class="service-item" @tap="selectionnerService(service)">
                  <StackLayout col="0" row="0" rowSpan="2" class="check-container" v-if="service.selected" horizontalAlignment="center" verticalAlignment="center">
                    <Label text="✓" class="check-icon" />
                  </StackLayout>
                  <Label :text="service.nom" class="service-name" col="1" row="0" />
                  <Label :text="service.duree + ' minutes'" class="service-duration" col="1" row="1" />
                  <Label :text="service.prix + ' CAD'" class="service-price" col="2" row="0" rowSpan="2" verticalAlignment="center" />
                </GridLayout>
                
                <!-- Services loading error with retry button -->
                <StackLayout v-if="servicesError" class="services-error">
                  <Label :text="servicesError" class="error-message" textWrap="true" />
                  <Button text="Réessayer" @tap="loadServices" class="retry-button" />
                </StackLayout>
              </StackLayout>
              
              <!-- Services loading indicator -->
              <ActivityIndicator v-if="servicesLoading" busy="true" color="#ffcd50" class="loading-indicator" />
            </StackLayout>

            <!-- Available dates section -->
            <StackLayout class="section-container">
              <Label text="Dates disponibles" class="section-title" />
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
              <Label text="Horaires disponibles" class="section-title" />
              
              <!-- No service selected message -->
              <Label v-if="!selectedService" text="Veuillez d'abord sélectionner un service" class="no-selection-text" />
              
              <!-- Loading indicator -->
              <ActivityIndicator v-else-if="timeSlotLoading" busy="true" color="#ffcd50" class="loading-indicator" />
              
              <!-- Time slot error with retry button -->
              <StackLayout v-else-if="timeSlotError" class="time-slot-error">
                <Label :text="timeSlotError" class="error-message" textWrap="true" />
                <Button text="Réessayer" @tap="checkAndFilterTimeSlots" class="retry-button" />
              </StackLayout>
              
              <!-- No available slots message -->
              <Label v-else-if="horaires.length === 0" text="Aucun créneau disponible pour la date et le service sélectionnés. Veuillez essayer une autre date." class="no-selection-text" textWrap="true" />
              
              <!-- Time slots grid -->
              <GridLayout v-else columns="*, *, *" rows="auto, auto, auto, auto, auto, auto, auto, auto" class="schedules-grid">
                <StackLayout v-for="(horaire, index) in horaires" :key="index"
                          :row="Math.floor(index/3)" :col="index%3"
                          class="schedule-item" :class="{ 'schedule-selected': horaire.selected }"
                          @tap="selectionnerHoraire(horaire)">
                  <Label :text="horaire.heure" class="schedule-time" />
                </StackLayout>
              </GridLayout>
            </StackLayout>
            
            <!-- Voucher section -->
            <StackLayout class="section-container">
              <Label text="Bon de réduction" class="section-title" />
              <Label text="Aucun code promotionnel disponible" class="no-voucher-text" />
            </StackLayout>
          </StackLayout>
          
          <!-- Add extra space at bottom to ensure content isn't hidden behind footer -->
          <StackLayout height="80"></StackLayout>
        </StackLayout>
      </ScrollView>
      
      <!-- Sticky Footer -->
      <GridLayout row="2" class="sticky-footer">
        <!-- Book Button -->
        <Button text="Réserver" @tap="reserver" class="book-button" :enabled="canBook" />
      </GridLayout>
      
      <!-- Bottom sheet modal -->
      <StackLayout v-if="showConfirmationModal" class="modal-overlay" row="0" rowSpan="3">
        <StackLayout class="confirmation-sheet">
          <!-- Indicator bar -->
          <StackLayout class="indicator-bar"></StackLayout>
          
          <!-- Confirmation content -->
          <Label text="Votre rendez-vous" class="sheet-title" />
          
          <!-- Appointment details -->
          <GridLayout rows="auto, auto, auto" columns="auto, *" class="details-grid">
            <!-- Date -->
            <Label text="Date:" class="details-label" row="0" col="0" />
            <Label :text="formatConfirmationDate()" class="details-value" row="0" col="1" />
            
            <!-- With -->
            <Label text="Avec:" class="details-label" row="1" col="0" />
            <Label :text="barbier ? barbier.nom : ''" class="details-value" row="1" col="1" />
            
            <!-- Services -->
            <Label text="Services:" class="details-label" row="2" col="0" />
            <Label :text="selectedService ? selectedService.nom : ''" class="details-value" row="2" col="1" />
          </GridLayout>
          
          <!-- Price -->
          <Label :text="selectedService ? selectedService.prix + ' CAD' : ''" class="price" />
          
          <!-- Loading indicator -->
          <ActivityIndicator v-if="confirming" busy="true" color="#ffcd50" class="loading-indicator" />
          
          <!-- Error message -->
          <Label v-if="confirmationError" class="error-message" :text="confirmationError" textWrap="true" />
          
          <!-- Confirm button -->
          <Button text="Je confirme" @tap="confirmerReservation" class="confirm-button" v-if="!confirming" />
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
    },
    barbierInfo: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      barbier: null,
      services: [],
      dates: generateAvailableDates(),
      horaires: [],
      selectedService: null,
      selectedDate: null,
      selectedHoraire: null,
      loading: true,
      error: null,
      servicesLoading: true,
      servicesError: null,
      userInfo: null,
      showConfirmationModal: false,
      confirming: false,
      confirmationError: '',
      appointmentDate: null,
      timeSlotLoading: false,
      timeSlotError: null,
      reservedTimeSlots: []
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
        // Try to load from API first
        this.barbier = await barbierService.getBarberById(this.barbierId);
        
        // Initialize dates
        this.dates = generateAvailableDates();
        this.selectedDate = this.dates.find(date => date.selected);
        
        // Load services after barber is loaded
        this.loadServices();
      } catch (error) {
        console.error('Error loading barber details:', error);
        
        // Fallback: if we have barbierInfo from props, use that instead
        if (this.barbierInfo) {
          console.log('Using passed barber info as fallback:', this.barbierInfo);
          this.barbier = this.barbierInfo;
          
          // Initialize dates
          this.dates = generateAvailableDates();
          this.selectedDate = this.dates.find(date => date.selected);
          
          // Load services after barber is loaded
          this.loadServices();
        } else {
          this.error = 'Unable to load barber details. Please try again.';
        }
      } finally {
        this.loading = false;
      }
    },
    
    async loadServices() {
      this.servicesLoading = true;
      this.servicesError = null;
      
      try {
        const barberServices = await barbierService.getBarberServices(this.barbierId);
        
        // Map services to our format
        this.services = barberServices.map(service => ({
          ...service,
          selected: false
        }));
      } catch (error) {
        console.error('Error loading services:', error);
        
        // Fallback: Use default services
        this.services = [
          { id: 1, nom: 'Coupe de cheveux', duree: 30, prix: 25, selected: false, BarberId: this.barbierId },
          { id: 2, nom: 'Coupe + Barbe', duree: 45, prix: 35, selected: false, BarberId: this.barbierId },
          { id: 3, nom: 'Barbe', duree: 20, prix: 15, selected: false, BarberId: this.barbierId },
          { id: 4, nom: 'Coupe enfant', duree: 20, prix: 20, selected: false, BarberId: this.barbierId }
        ];
        
        this.servicesError = null; // Clear error since we're providing fallback data
      } finally {
        this.servicesLoading = false;
      }
    },
    
    retour() {
      this.$navigateBack();
    },
    
    async checkAndFilterTimeSlots() {
      // Reset the horaires array and selected horaire
      this.horaires = [];
      this.selectedHoraire = null;
      this.timeSlotError = null;
      
      if (!this.selectedService || !this.selectedDate || !this.barbier) {
        console.log('Missing required data for time slot filtering');
        return;
      }
      
      this.timeSlotLoading = true;
      
      try {
        // Get all possible time slots for the day
        const allPossibleSlots = generateTimeSlots();
        
        // Get the selected date
        const selectedDate = new Date(this.selectedDate.date);
        const formattedDate = selectedDate.toISOString();
        
        // Get the service duration
        const serviceDuration = this.selectedService.duree;
        
        // Get availability data from API
        const availabilityData = await rendezVousService.checkAvailability(
          this.barbier.id,
          formattedDate
        );
        
        // Extract unavailable time ranges
        this.reservedTimeSlots = availabilityData.unavailableSlots.map(slot => ({
          start: new Date(slot.startTime),
          end: new Date(slot.endTime),
          serviceName: slot.serviceName
        }));
        
        // Filter slots based on conflicts
        const availableSlots = [];
        
        for (const slot of allPossibleSlots) {
          // Convert slot time to Date object
          const [hours, minutes] = slot.heure.split(':').map(Number);
          const slotStart = new Date(selectedDate);
          slotStart.setHours(hours, minutes, 0, 0);
          
          // Calculate slot end time based on service duration
          const slotEnd = new Date(slotStart.getTime() + serviceDuration * 60 * 1000);
          
          // Check if slot would extend past business hours (6:00 PM)
          const businessEnd = new Date(selectedDate);
          businessEnd.setHours(18, 0, 0, 0);
          
          if (slotEnd > businessEnd) {
            continue;
          }
          
          // Check for conflicts with reserved slots
          let hasConflict = false;
          
          for (const reserved of this.reservedTimeSlots) {
            // Check for any overlap between the potential appointment and existing ones
            if (
              (slotStart >= reserved.start && slotStart < reserved.end) || // Slot starts during reserved time
              (slotEnd > reserved.start && slotEnd <= reserved.end) || // Slot ends during reserved time
              (slotStart <= reserved.start && slotEnd >= reserved.end) // Slot contains reserved time
            ) {
              hasConflict = true;
              break;
            }
          }
          
          if (!hasConflict) {
            availableSlots.push({
              id: slot.id,
              heure: slot.heure,
              selected: false
            });
          }
        }
        
        // Update the horaires array with available slots
        this.horaires = availableSlots;
      } catch (error) {
        console.error('Error filtering time slots:', error);
        this.timeSlotError = 'Unable to load available time slots. Please try again.';
        this.horaires = []; // On error, show no slots
      } finally {
        this.timeSlotLoading = false;
      }
    },
    
    selectionnerService(service) {
      this.services.forEach(s => s.selected = false);
      service.selected = true;
      this.selectedService = service;
      
      // Reset time slot selection when service changes
      this.horaires = [];
      this.selectedHoraire = null;
      this.timeSlotError = null;
      
      // If we have a date selected, check available time slots
      if (this.selectedDate) {
        this.checkAndFilterTimeSlots();
      }
    },
    
    selectionnerDate(date) {
      // Clear previous time selection
      this.horaires = [];
      this.selectedHoraire = null;
      this.timeSlotError = null;
      
      // Set new date selection
      this.dates.forEach(d => d.selected = false);
      date.selected = true;
      this.selectedDate = date;
      
      // If we have a service selected, check available time slots
      if (this.selectedService) {
        this.checkAndFilterTimeSlots();
      }
    },
    
    selectionnerHoraire(horaire) {
      this.horaires.forEach(h => h.selected = false);
      horaire.selected = true;
      this.selectedHoraire = horaire;
    },
    
    getBarbierImage() {
      // Fallback to default image if photoUrl is missing
      if (!this.barbier || !this.barbier.photoUrl) {
        return '~/assets/images/barber-1.jpg';
      }
      
      // If photoUrl starts with /, add the server URL
      if (this.barbier.photoUrl.startsWith('/')) {
        const host = process.env.NODE_ENV === 'production' ? '172.105.3.8' : '10.0.2.2';
        return `http://${host}:3000${this.barbier.photoUrl}`;
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
      
      // Create appointment date/time by checking the type of selectedDate.date
      let year, month, day;
      
      // Check if selectedDate.date is a string or Date object
      if (typeof this.selectedDate.date === 'string') {
        // If it's a string, parse it
        [year, month, day] = this.selectedDate.date.split('-').map(Number);
      } else if (this.selectedDate.date instanceof Date) {
        // If it's a Date object, extract components
        year = this.selectedDate.date.getFullYear();
        month = this.selectedDate.date.getMonth() + 1; // JavaScript months are 0-indexed
        day = this.selectedDate.date.getDate();
      } else {
        // Use date from selectedDate directly (it's an object with year, month, day)
        year = this.selectedDate.year;
        month = this.selectedDate.month;
        day = this.selectedDate.numero;
      }
      
      const [hours, minutes] = this.selectedHoraire.heure.split(':').map(Number);
      
      // Format the date as a string directly (to avoid timezone issues)
      const appointmentDateStr = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}T${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
      this.appointmentDate = new Date(appointmentDateStr);
      
      // Show confirmation modal
      this.showConfirmationModal = true;
    },
    
    async confirmerReservation() {
      if (this.confirming) return;
      
      this.confirming = true;
      this.confirmationError = null;
      
      try {
        if (!authService.isLoggedIn()) {
          throw new Error("You must be logged in to confirm a reservation");
        }
        
        if (!this.appointmentDate || !this.barbier || !this.selectedService) {
          throw new Error("Missing required information. Please try again.");
        }
        
        // Format the date as a string directly to prevent timezone issues
        const year = this.appointmentDate.getFullYear();
        const month = (this.appointmentDate.getMonth() + 1).toString().padStart(2, '0');
        const day = this.appointmentDate.getDate().toString().padStart(2, '0');
        const hours = this.appointmentDate.getHours().toString().padStart(2, '0');
        const minutes = this.appointmentDate.getMinutes().toString().padStart(2, '0');
        const appointmentDateStr = `${year}-${month}-${day}T${hours}:${minutes}:00`;
        
        // Create the appointment with the formatted date string
        const result = await rendezVousService.createAppointment({
          barbierId: this.barbier.id,
          serviceId: this.selectedService.id,
          date: appointmentDateStr // Use string format directly
        });
        
        // Show success message
        await alert({
          title: "Reservation Confirmed",
          message: "Your appointment has been successfully booked!",
          okButtonText: "OK"
        });
        
        // Navigate back
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
    },

    onImageError(imageUrl, context) {
      console.error('Image loading error:', { imageUrl, context });
      // You can add additional error handling here if needed
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

.services-error, .time-slot-error {
  padding: 15;
  justify-content: center;
  align-items: center;
}

.loading-indicator {
  margin: 20 0;
}
</style>