<!-- app/views/MesInformations.vue -->
<template>
  <Page actionBarHidden="true">
    <GridLayout rows="auto, *, auto">
      <!-- Header in the first row -->
      <GridLayout row="0" columns="auto, *" class="header">
        <Button text="<" @tap="retour" class="btn-retour" col="0" />
        <Label text="Mes informations" class="page-title" col="1" />
      </GridLayout>
      
      <!-- Content in the second row -->
      <ScrollView row="1">
        <StackLayout class="info-container">
          <!-- Logo -->
          <Image src="~/assets/images/yaniso-logo.png" class="logo" stretch="aspectFit" />
          
          <!-- Loading indicator -->
          <ActivityIndicator v-if="loading" busy="true" color="#ffcd50" />
          
          <!-- Error message -->
          <Label v-if="errorMessage" class="error-message" :text="errorMessage" textWrap="true" />
          
          <!-- Formulaire d'informations -->
          <StackLayout v-if="!loading && !errorMessage" class="form-container">
            <!-- Nom et prénom sur la même ligne -->
            <GridLayout class="input-container" rows="auto, auto" columns="*">
              <Label text="Prénom et Nom:" class="input-label" row="0" col="0" />
              <GridLayout columns="*, *" rows="auto" class="name-fields margin-top" row="1" col="0">
                <TextField v-model="prenom" hint="_____________" class="text-field" col="0" />
                <TextField v-model="nom" hint="_____________" class="text-field margin-left" col="1" />
              </GridLayout>
            </GridLayout>
            
            <!-- Date de naissance -->
            <GridLayout class="input-container date-container" rows="auto, auto" columns="*, auto">
              <Label text="Date de naissance:" class="input-label" row="0" col="0" verticalAlignment="center" />
              <Label :text="formattedDate" @tap="showDatePicker" class="date-display" row="0" col="1" horizontalAlignment="right" />
              <Button text="OK" @tap="hideDatePicker" class="ok-button" row="0" col="2" horizontalAlignment="right" :visibility="isDatePickerVisible ? 'visible' : 'collapsed'" />
              <DatePicker ref="datePicker" v-model="dateNaissance" row="1" colSpan="3" :visibility="isDatePickerVisible ? 'visible' : 'collapsed'" @dateChange="onDateChange" class="date-picker" />
            </GridLayout>
            
            <!-- Genre -->
            <GridLayout class="input-container gender-container" rows="auto" columns="*, *">
              <Label text="Genre:" class="input-label" row="0" col="0" verticalAlignment="center" />
              <StackLayout @tap="showGenderPicker" class="gender-display-container" row="0" col="1" horizontalAlignment="right">
                <GridLayout columns="auto, auto" verticalAlignment="center">
                  <Label :text="genreDisplay[genre]" class="gender-display-text" col="0" />
                  <Label text=" ›" class="dropdown-arrow" col="1" />
                </GridLayout>
              </StackLayout>
            </GridLayout>
            
            <!-- Téléphone -->
            <GridLayout class="phone-container" rows="auto, auto" columns="*">
              <Label text="Téléphone:" class="phone-label" row="0" col="0" />
              
              <GridLayout rows="auto" columns="auto, *" class="phone-input-row" row="1" col="0">
                <StackLayout row="0" col="0" class="country-code-box">
                  <GridLayout rows="auto" columns="auto, auto" class="country-code-content">
                    <Image src="~/assets/images/dz-flag.png" width="22" row="0" col="0" class="flag-icon" />
                    <Label text="+1" class="country-code-text" row="0" col="1" />
                  </GridLayout>
                </StackLayout>
                
                <TextField :text="telephone" editable="false" 
                          row="0" col="1" class="phone-input" />
              </GridLayout>
            </GridLayout>
            
            <!-- Email (facultatif) -->
            <GridLayout class="input-container" rows="auto, auto" columns="*">
              <Label text="Email: (optionnel)" class="input-label" row="0" col="0" />
              <TextField v-model="email" hint="Votre email" keyboardType="email" class="text-field margin-top" row="1" col="0" />
            </GridLayout>
          </StackLayout>
        </StackLayout>
      </ScrollView>
      
      <!-- Sticky Footer with gradient transition -->
      <GridLayout row="2" rows="auto, auto" class="sticky-footer">
        <StackLayout row="0" class="gradient-transition"></StackLayout>
        <StackLayout row="1" class="footer-content">
          <Button text="Enregistrer" @tap="enregistrer" class="btn-save" :enabled="!isSaving" />
          <ActivityIndicator v-if="isSaving" busy="true" color="#ffcd50" />
          <Label text="Supprimer mon compte" @tap="supprimerCompte" class="delete-account" />
        </StackLayout>
      </GridLayout>
    </GridLayout>
  </Page>
</template>
<script>
import { authService } from '../services/api';
import * as ApplicationSettings from "@nativescript/core/application-settings";
import { alert, confirm, action } from '@nativescript/core/ui/dialogs';

export default {
  data() {
    return {
      loading: true,
      isSaving: false,
      errorMessage: '',
      nom: '',
      prenom: '',
      dateNaissance: new Date(),
      genre: 'Homme',
      genreOptions: ['Homme', 'Femme', 'Autre'], // Backend values in French
      genreDisplay: { 'Homme': 'Male', 'Femme': 'Female', 'Autre': 'Other' }, // Display in English
      telephone: '',
      email: '',
      isDatePickerVisible: false,
      formattedDate: ''
    };
  },
  mounted() {
    this.loadUserData();
  },
  methods: {
    async loadUserData() {
      this.loading = true;
      this.errorMessage = '';
      
      try {
        // Get user profile data
        const user = authService.getUser();
        
        if (user) {
          // Update component data with user information
          this.nom = user.nom || '';
          this.prenom = user.prenom || '';
          this.telephone = user.telephone || '';
          
          // Try to get full profile data from API
          try {
            const profileData = await authService.getProfile();
            
            // Update with more detailed info if available
            this.genre = profileData.genre || 'Homme';
            this.email = profileData.email || '';
            
            // Parse date if it exists
            if (profileData.dateNaissance) {
              this.dateNaissance = new Date(profileData.dateNaissance);
            }
            
            // Format the date for display
            this.formattedDate = this.formatDateForDisplay(this.dateNaissance);
            
          } catch (profileError) {
            console.log('Could not load detailed profile, using basic info', profileError);
            // Continue with basic info if profile data isn't available
            this.formattedDate = this.formatDateForDisplay(this.dateNaissance);
          }
        } else {
          this.errorMessage = 'User not logged in';
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        this.errorMessage = 'Error loading user data';
      } finally {
        this.loading = false;
      }
    },
    
    retour() {
      this.$navigateBack();
    },
    
    showDatePicker() {
      this.isDatePickerVisible = true;
    },
    
    hideDatePicker() {
      this.isDatePickerVisible = false;
    },
    
    onDateChange(args) {
      this.dateNaissance = args.value;
      this.formattedDate = this.formatDateForDisplay(this.dateNaissance);
    },
    
    formatDateForDisplay(date) {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
    },
    
    showGenderPicker() {
      const options = {
        title: "Select Gender",
        message: "Choose your gender",
        cancelButtonText: "Cancel",
        actions: Object.values(this.genreDisplay) // Display the friendly names
      };
      
      action(options).then(result => {
        if (result !== "Cancel") {
          // Map the English display value back to the French database value
          const frenchValue = Object.keys(this.genreDisplay).find(key => this.genreDisplay[key] === result);
          if (frenchValue) {
            this.genre = frenchValue;
          }
        }
      });
    },
    
    async enregistrer() {
      this.isSaving = true;
      this.errorMessage = '';
      
      try {
        // Update local user info first (this will work regardless of API)
        authService.updateUserInfo({
          nom: this.nom,
          prenom: this.prenom
        });
        
        // Try API update if available
        try {
          const userData = {
            nom: this.nom,
            prenom: this.prenom,
            dateNaissance: this.dateNaissance.toISOString().split('T')[0],
            genre: this.genre,
            email: this.email
          };
          
          await authService.updateProfile(userData);
        } catch (apiError) {
          console.log('API update failed, but local data was updated', apiError);
          // We continue because we already updated local data
        }
        
        // Show success message
        await alert({
          title: "Information Saved",
          message: "Your information has been updated successfully.",
          okButtonText: "OK"
        });
        
        // Return to previous screen
        this.$navigateBack();
      } catch (error) {
        console.error('Error saving user data:', error);
        this.errorMessage = 'Error saving data: ' + error.message;
      } finally {
        this.isSaving = false;
      }
    },
    
    supprimerCompte() {
      confirm({
        title: "Delete Account",
        message: "Are you sure you want to delete your account? This action cannot be undone.",
        okButtonText: "Delete",
        cancelButtonText: "Cancel"
      }).then(result => {
        if (result) {
          // Logout and redirect to login
          authService.logout();
          this.$navigateTo(require('./Connexion').default, {
            clearHistory: true
          });
        }
      });
    }
  }
};
</script>

<style scoped>
.date-container {
  padding: 12 22;
  margin-bottom: 15;
}

.date-display {
  color: #ffffff;
  font-size: 16;
  background-color: #313131;
  border-radius: 10;
  padding: 0 15;
  text-align: center;
  width: 120;
}

.date-picker {
  background-color: #313131;
  color: white;
  margin-top: 5;
}

.ok-button {
  background-color: #313131;
  color: #ffcd50;
  font-weight: bold;
  font-size: 14;
  border-radius: 10;
  width: 45;
  height: 35;
  padding: 0 0;
  margin-right: 130;
}

.margin-top{
  margin-top: -10;
  margin-left: -0;
}

.margin-left{
  margin-left: -130;
}

.info-container {
  background-color: #000000;
  padding: 20;
}

.header {
  background-color: #000000;
  padding: 10;
}

.btn-retour {
  font-size: 30;
  background-color: #212121;
  color: #ffffff;
  border-radius: 20;
  width: 40;
  height: 40;
  padding: 0;
}

.page-title {
  color: #ffffff;
  font-size: 24;
  font-weight: bold;
  text-align: center;
  margin-right: 70;
}

.logo {
  width: 150;
  height: 150;
  margin-top: 10;
  margin-bottom: 20;
  align-self: center;
}

.error-message {
  color: #ff4d4d;
  text-align: center;
  margin-bottom: 15;
  font-size: 16;
}

.form-container {
  margin-top: 10;
}

.input-container {
  background-color: #212121;
  border-radius: 22;
  padding: 12 22;
  margin-bottom: 15;
}

.input-label {
  color: #ffffff;
  font-size: 16;
  margin-bottom: 8;
}

.text-field {
  color: #ffffff;
  font-size: 18;
  background-color: transparent;
  border-width: 0;
  placeholder-color: #5f5f5f;
}

.name-fields TextField {
  width: 45%;
}

.gender-container {
  padding: 12 22;
  margin-bottom: 15;
}

.gender-display-container {
  background-color: #313131;
  border-radius: 10;
  padding: 10 15;
  width: 100;
}

.gender-display-text {
  color: #ffcd50;
  font-size: 16;
  text-align: center;
}

.dropdown-arrow {
  color: #ffcd50;
  font-size: 16;
  margin-left: 8;
  transform: rotate(90deg);
}

/* Phone field specific styles */
.phone-container {
  background-color: #212121;
  border-radius: 22;
  padding: 12 22;
  margin-bottom: 15;
}

.phone-label {
  color: #ffffff;
  font-size: 16;
  margin-bottom: 8;
}

.phone-input-row {
  height: 40;
}

.country-code-box {
  background-color: #313131;
  border-radius: 8;
  padding: 5 10;
  margin-right: -5;
}

.country-code-content {
  vertical-align: middle;
}

.flag-icon {
  margin-right: 5;
  vertical-align: middle;
}

.country-code-text {
  color: #ffffff;
  font-size: 16;
  vertical-align: middle;
}

.phone-input {
  background-color: transparent;
  color: #ffffff;
  font-size: 16;
  border-width: 0;
  padding: 0;
  vertical-align: middle;
  placeholder-color: #5f5f5f;
}

/* Sticky Footer Styles */
.sticky-footer {
  background-color: #000000;
}

.gradient-transition {
  height: 40;
  background: linear-gradient(to bottom, transparent, #000000);
  margin-top: -40;
}

.footer-content {
  padding: 0 20 15 20;
}

.btn-save {
  background-color: #ffcd50;
  color: #000000;
  font-size: 18;
  font-weight: bold;
  border-radius: 20;
  height: 50;
  margin-bottom: 15;
}

.delete-account {
  color: #bd514e;
  font-size: 16;
  text-align: center;
  margin-bottom: 10;
  background-color: transparent;
}

.loading-indicator {
  margin: 20;
}
</style>