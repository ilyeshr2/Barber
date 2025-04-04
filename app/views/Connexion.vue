<!-- app/views/Connexion.vue -->
<template>
  <Page actionBarHidden="true">
    <StackLayout class="connexion-container">

      <StackLayout class="partie1">
      <!-- Logo -->
      <Image src="~/assets/images/yaniso-logo.png" class="logo" stretch="aspectFit" />
      

      <StackLayout class="text-bien">
      <!-- Welcome text -->
      <Label text="Bienvenue" class="welcome-heading" />
      <Label text="Veuillez entrer le numéro de téléphone associé à votre compte client." class="welcome-text" textWrap="true" />
    </StackLayout>
      <!-- Error message -->
      <Label v-if="errorMessage" class="error-message" :text="errorMessage" textWrap="true" />
      
<!-- Phone field only - focused approach -->
<GridLayout class="phone-container" rows="auto, auto" columns="*">
  <!-- "Phone:" label above the input -->
  <Label text="Téléphone:" class="phone-label" row="0" col="0" />
  
  <!-- Country code and text field in the second row -->
  <GridLayout rows="auto" columns="auto, *" class="phone-input-row" row="1" col="0">
    <!-- Country code with flag -->
    <StackLayout row="0" col="0" class="country-code-box">
      <GridLayout rows="auto" columns="auto, auto" class="country-code-content">
        <Image src="~/assets/images/dz-flag.png" width="22" row="0" col="0" class="flag-icon" />
        <Label text="+1" class="country-code-text" row="0" col="1" />
      </GridLayout>
    </StackLayout>
    
    <!-- Phone input with underscores -->
    <TextField  hint="___ ___ ____" v-model="telephone" keyboardType="phone" row="0" col="1" class="phone-input" />
  </GridLayout>
</GridLayout>
      
      <!-- Password input - extremely simplified -->
      <TextField v-model="motDePasse" hint="Mot de passe:" secure="true" class="password-field" />
    </StackLayout>


      <StackLayout class="partie2">
      <!-- Skip login -->
      <Label text="Continuer sans connexion" class="skip-login" @tap="continuerSansConnexion" />
  
      <!-- Login button -->
      <Button text="Se connecter" @tap="connexion" class="login-button" :isEnabled="!isLoading" />
      
      <!-- Loading indicator -->
      <ActivityIndicator v-if="isLoading" busy="true" color="#fecc4f" class="loading-indicator" />
      
      <!-- Registration text -->
      <Label text="Pas encore de compte?" class="register-question" />
      <Label text="Créer un compte" class="register-link" @tap="allerInscription" />

    </StackLayout>
    </StackLayout>
  </Page>
</template>

<script>
import { authService } from '../services/api';

export default {
data() {
  return {
    telephone: '',
    motDePasse: '',
    errorMessage: '',
    isLoading: false
  };
},
methods: {
  async connexion() {
    if (!this.telephone || !this.motDePasse) {
      this.errorMessage = 'Veuillez remplir tous les champs';
      return;
    }
    
    this.isLoading = true;
    this.errorMessage = '';
    
    try {
      // Format phone number
      let formattedPhone = this.telephone.trim();
      if (!formattedPhone.startsWith('+1')) {
        formattedPhone = '+1' + formattedPhone.replace(/^0/, '');
      }
      
      await authService.login({
        telephone: formattedPhone,
        motDePasse: this.motDePasse
      });
      
      this.$navigateTo(require('./PeloStudio').default, {
        clearHistory: true
      });
    } catch (error) {
      console.error('Erreur connexion:', error);
      this.errorMessage = error.message || 'Erreur de connexion';
    } finally {
      this.isLoading = false;
    }
  },
  
  allerInscription() {
    this.$navigateTo(require('./Inscription').default);
  },
  
  continuerSansConnexion() {
    this.$navigateTo(require('./PeloStudio').default);
  }
}
};
</script>

<style scoped>
.connexion-container {
  background-color: #000000;
  padding: 30;
}

.logo {
  width: 180;
  height: 180;
  margin-top: 20;
  margin-bottom: 30;
  horizontal-align: center;
}

.text-bien {
  text-align: center;
}

.partie1 {
  margin-top: 70;
}

.partie2 {
  margin-top: 70;
}

.welcome-heading {
  color: #ffffff;
  font-size: 32;
  font-weight: bold;
  margin-bottom: 0;
}

.welcome-text {
  color: #ffffff;
  font-size: 19;
  margin-bottom: 15;
  text-wrap: true;
}

.error-message {
  color: #ff4d4d;
  text-align: center;
  margin-bottom: 15;
  font-size: 16;
}

/* Phone field */
.phone-container {
  background-color: #212121;
  border-radius: 22;
  padding: 12 22;
  margin-bottom: 15;
}

TextField {
  placeholder-color: #5f5f5f;
  color: #ffffff;
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
}

/* Password field */
.password-field {
  height: 50;
  width: 600;
  background-color: #222222;
  border-radius: 20;
  border-width: 0;
  padding: 0 15;
  margin-bottom: 30;
  color: #ffffff;
  font-size: 16;
}

/* Skip login */
.skip-login {
  color: #fecc4f;
  text-align: center;
  font-size: 16;
  margin-bottom: 5;
}

/* Login button */
.login-button {
  background-color: #fecc4f;
  color: #000000;
  font-size: 18;
  font-weight: bold;
  height: 50;
  border-radius: 17;
  margin-bottom: 20;
}

.loading-indicator {
  margin-bottom: 15;
}

/* Registration */
.register-question {
  color: #ffffff;
  font-size: 19;
  text-align: center;
  margin-bottom: 5;
}

.register-link {
  color: #fecc4f;
  font-size: 19;
  text-align: center;
}
</style>