<!-- Modified app/views/Inscription.vue -->
<template>
  <Page actionBarHidden="true">
    <GridLayout rows="auto, *, auto">
      <!-- Header in the first row -->
      <GridLayout row="0" columns="auto, *" class="header">
        <Button text="<" @tap="retour" class="btn-retour" col="0" />
        <Label text="Sign Up" class="page-title" col="1" />
      </GridLayout>
      
      <!-- Content in the second row -->
      <ScrollView row="1">
        <StackLayout class="inscription-container">
          <!-- Logo -->
          <Image src="~/assets/images/yaniso-logo.png" class="logo" stretch="aspectFit" />
          
          <!-- Message d'erreur -->
          <Label v-if="errorMessage" class="error-message" :text="errorMessage" textWrap="true" />
          
          <!-- Formulaire d'inscription -->
          <StackLayout class="form-container">
            <!-- Nom et prénom sur la même ligne -->
            <GridLayout class="input-container" rows="auto, auto" columns="*">
              <Label text="First and Last Name:" class="input-label" row="0" col="0" />
              <GridLayout columns="*, *" rows="auto" class="name-fields margin-top" row="1" col="0">
                <TextField v-model="prenom" hint="_____________" class="text-field" col="0" />
                <TextField v-model="nom" hint="_____________" class="text-field margin-left" col="1" />
              </GridLayout>
            </GridLayout>
            
            <!-- Date de naissance -->
            <GridLayout class="input-container date-container" rows="auto, auto" columns="*, auto">
              <Label text="Date of Birth:" class="input-label" row="0" col="0" verticalAlignment="center" />
              <Label :text="formattedDate" @tap="showDatePicker" class="date-display" row="0" col="1" horizontalAlignment="right" />
              <Button text="OK" @tap="hideDatePicker" class="ok-button" row="0" col="2" horizontalAlignment="right" :visibility="isDatePickerVisible ? 'visible' : 'collapsed'" />
              <DatePicker ref="datePicker" v-model="dateNaissance" row="1" colSpan="3" :visibility="isDatePickerVisible ? 'visible' : 'collapsed'" @dateChange="onDateChange" class="date-picker" />
            </GridLayout>
            
            <!-- Genre -->
            <GridLayout class="input-container gender-container" rows="auto" columns="*, *">
              <Label text="Gender:" class="input-label" row="0" col="0" verticalAlignment="center" />
              <StackLayout @tap="showGenderPicker" class="gender-display-container" row="0" col="1" horizontalAlignment="right">
                <GridLayout columns="auto, auto" verticalAlignment="center">
                  <Label :text="genreDisplay[genre]" class="gender-display-text" col="0" />
                  <Label text=" ›" class="dropdown-arrow" col="1" />
                </GridLayout>
              </StackLayout>
            </GridLayout>
            
            <!-- Téléphone -->
            <GridLayout class="phone-container" rows="auto, auto" columns="*">
              <Label text="Phone:" class="phone-label" row="0" col="0" />
              
              <GridLayout rows="auto" columns="auto, *" class="phone-input-row" row="1" col="0">
                <StackLayout row="0" col="0" class="country-code-box">
                  <GridLayout rows="auto" columns="auto, auto" class="country-code-content">
                    <Image src="~/assets/images/dz-flag.png" width="22" row="0" col="0" class="flag-icon" />
                    <Label text="+1" class="country-code-text" row="0" col="1" />
                  </GridLayout>
                </StackLayout>
                
                <TextField hint="___ ___ ____" v-model="telephone" keyboardType="phone" 
                          row="0" col="1" class="phone-input" />
              </GridLayout>
            </GridLayout>
            
            <!-- Email (facultatif) -->
            <GridLayout class="input-container" rows="auto, auto" columns="*">
              <Label text="Email: (optional)" class="input-label" row="0" col="0" />
              <TextField v-model="email" hint="Your email" keyboardType="email" class="text-field margin-top" row="1" col="0" />
            </GridLayout>
            
            <!-- Mot de passe -->
            <GridLayout class="input-container" rows="auto, auto" columns="*">
              <Label text="Password:" class="input-label" row="0" col="0" />
              <TextField v-model="motDePasse" secure="true" hint="Your password" class="text-field margin-top" row="1" col="0" />
            </GridLayout>
            
            <!-- Confirmation mot de passe -->
            <GridLayout class="input-container" rows="auto, auto" columns="*">
              <Label text="Confirm Password:" class="input-label" row="0" col="0" />
              <TextField v-model="confirmMotDePasse" secure="true" hint="Confirm your password" class="text-field margin-top" row="1" col="0" />
            </GridLayout>
            
            <!-- Added spacing to ensure content scrolls above the footer -->
            <StackLayout height="30"></StackLayout>
          </StackLayout>
        </StackLayout>
      </ScrollView>
      
      <!-- Sticky Footer with gradient transition -->
      <GridLayout row="2" rows="auto, auto" class="sticky-footer">
        <StackLayout row="0" class="gradient-transition"></StackLayout>
        <StackLayout row="1" class="footer-content">
          <Button text="Sign Up" @tap="inscription" class="btn-inscription" :isEnabled="!isLoading" />
          <ActivityIndicator v-if="isLoading" busy="true" color="#ffcd50" />
        </StackLayout>
      </GridLayout>
    </GridLayout>
  </Page>
</template>

<script>
import { authService } from '../services/api';
import { formatDate } from '../utils/helpers';
import * as dialogs from '@nativescript/core/ui/dialogs';

export default {
  data() {
    return {
      nom: '',
      prenom: '',
      dateNaissance: new Date(2013, 3, 2), // Apr 2, 2013 as in prototype
      genre: 'Homme',
      genreOptions: ['Homme', 'Femme', 'Autre'], // Backend values in French
      genreDisplay: { 'Homme': 'Male', 'Femme': 'Female', 'Autre': 'Other' }, // Display in English
      telephone: '',
      motDePasse: '',
      confirmMotDePasse: '',
      email: '',
      errorMessage: '',
      isLoading: false,
      formattedDate: 'Apr 2, 2013',
      isDatePickerVisible: false
    };
  },
  methods: {
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
      // Don't automatically hide the date picker - user will click OK
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
      
      dialogs.action(options).then(result => {
        if (result !== "Cancel") {
          // Map the English display value back to the French database value
          const frenchValue = Object.keys(this.genreDisplay).find(key => this.genreDisplay[key] === result);
          if (frenchValue) {
            this.genre = frenchValue;
          }
        }
      });
    },
    
    async inscription() {
      // Validation
      if (!this.nom || !this.prenom || !this.telephone || !this.motDePasse) {
        this.errorMessage = 'Please fill all required fields';
        return;
      }
      
      if (this.motDePasse !== this.confirmMotDePasse) {
        this.errorMessage = 'Passwords do not match';
        return;
      }
      
      this.isLoading = true;
      this.errorMessage = '';
      
      try {
        // Format the phone number
        let formattedPhone = this.telephone.trim();
        if (!formattedPhone.startsWith('+1')) {
          formattedPhone = '+1' + formattedPhone.replace(/^0/, '');
        }
        
        await authService.signup({
          nom: this.nom,
          prenom: this.prenom,
          dateNaissance: formatDate(this.dateNaissance),
          genre: this.genre,
          telephone: formattedPhone,
          motDePasse: this.motDePasse,
          email: this.email || null
        });
        
        this.$navigateTo(require('./PeloStudio').default, {
          clearHistory: true
        });
      } catch (error) {
        console.error('Error signing up:', error);
        this.errorMessage = error.message || 'Error during registration';
      } finally {
        this.isLoading = false;
      }
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
.inscription-container {
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

.gender-display {
  color: #ffffff;
  font-size: 16;
  background-color: #313131;
  border-radius: 10;
  padding: 10 15;
  text-align: center;
  width: 120;
}
.gender-button {
  text-align: left;
  color: #ffcd50;
  background-color: transparent;
  border-width: 0;
  horizontal-align: left;
  padding: 0;
}

.gender-display-container {
  background-color: #313131;
  border-radius: 10;
  padding: 10 15;
  width: 100;
}

.gender-display-text {
  color: #ffcd50; /* Yellow color for gender text */
  font-size: 16;
  text-align: center;
}

.dropdown-arrow {
  color: #ffcd50; /* Yellow color for dropdown arrow */
  font-size: 16;
  margin-left: 8;
  transform: rotate(90deg); /* Makes "›" appear as a dropdown arrow */
}

/* Phone field specific styles from Connexion.vue */
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
  margin-top: -40; /* Pull the gradient up to overlap with the content */
}

.footer-content {
  padding: 0 20 15 20;
}

.btn-inscription {
  background-color: #ffcd50;
  color: #000000;
  font-size: 18;
  font-weight: bold;
  border-radius: 20;
  height: 50;
}
</style>