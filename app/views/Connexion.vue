<!-- app/views/Connexion.vue -->
<template>
    <Page actionBarHidden="true">
      <StackLayout class="connexion-container">
        <!-- Logo -->
        <Image src="~/assets/images/pelo-logo.png" class="logo" stretch="aspectFit" />
        
        <!-- Message d'erreur -->
        <Label v-if="errorMessage" class="error-message" :text="errorMessage" textWrap="true" />
        
        <!-- Formulaire de connexion -->
        <StackLayout class="form-container">
          <!-- Numéro de téléphone -->
          <StackLayout class="input-container">
            <Label text="Téléphone:" class="input-label" />
            <GridLayout rows="auto" columns="auto, *" class="phone-input">
              <Image src="~/assets/images/dz-flag.png" width="24" class="country-flag" row="0" col="0" />
              <TextField hint="+213 __ __ __ __" v-model="telephone" keyboardType="phone" class="phone-field" row="0" col="1" />
            </GridLayout>
          </StackLayout>
          
          <!-- Mot de passe -->
          <StackLayout class="input-container">
            <Label text="Mot de passe:" class="input-label" />
            <TextField v-model="motDePasse" secure="true" class="text-field" />
          </StackLayout>
          
          <!-- Bouton de connexion -->
          <Button text="Se connecter" @tap="connexion" class="btn-connexion" :isEnabled="!isLoading" />
          <ActivityIndicator v-if="isLoading" busy="true" color="#FFCC33" />
          
          <!-- Lien d'inscription -->
          <StackLayout orientation="horizontal" class="inscription-link">
            <Label text="Pas encore de compte? " />
            <Label text="Créer un compte" class="link" @tap="allerInscription" />
          </StackLayout>
          
          <!-- Continuer sans connexion -->
          <Label text="Continuer sans connexion" class="link skip-login" @tap="continuerSansConnexion" />
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
          // Formater le numéro de téléphone
          let formattedPhone = this.telephone.trim();
          if (!formattedPhone.startsWith('+213')) {
            formattedPhone = '+213' + formattedPhone.replace(/^0/, '');
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
    padding: 20;
    height: 100%;
  }
  
  .logo {
    width: 150;
    height: 150;
    margin-top: 50;
    margin-bottom: 30;
  }
  
  .error-message {
    color: #ff4d4d;
    text-align: center;
    margin-bottom: 10;
  }
  
  .form-container {
    margin-top: 10;
  }
  
  .input-container {
    margin-bottom: 20;
    background-color: #333333;
    border-radius: 10;
    padding: 15;
  }
  
  .input-label {
    color: #ffffff;
    font-size: 16;
    margin-bottom: 5;
  }
  
  .phone-input {
    align-items: center;
  }
  
  .country-flag {
    margin-right: 5;
  }
  
  .phone-field {
    color: #ffffff;
    font-size: 16;
  }
  
  .text-field {
    color: #ffffff;
    font-size: 16;
  }
  
  .btn-connexion {
    background-color: #FFCC33;
    color: #000000;
    font-size: 18;
    font-weight: bold;
    border-radius: 20;
    height: 50;
    margin-top: 20;
    margin-bottom: 10;
  }
  
  .inscription-link {
    justify-content: center;
    margin-top: 20;
    color: #ffffff;
  }
  
  .link {
    color: #FFCC33;
  }
  
  .skip-login {
    text-align: center;
    margin-top: 20;
  }
  </style>