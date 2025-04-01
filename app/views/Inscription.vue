<!-- app/views/Inscription.vue -->
<template>
    <Page actionBarHidden="true">
      <GridLayout rows="auto, *">
        <!-- Header in the first row -->
        <GridLayout row="0" columns="auto, *" class="header">
          <Button text="←" @tap="retour" class="btn-retour" col="0" />
          <Label text="Inscription" class="page-title" col="1" />
        </GridLayout>
        
        <!-- Content in the second row -->
        <ScrollView row="1">
          <StackLayout class="inscription-container">
            <!-- Logo -->
            <Image src="~/assets/images/pelo-logo.png" class="logo" stretch="aspectFit" />
            
            <!-- Message d'erreur -->
            <Label v-if="errorMessage" class="error-message" :text="errorMessage" textWrap="true" />
            
            <!-- Formulaire d'inscription -->
            <StackLayout class="form-container">
              <!-- Nom et prénom -->
              <StackLayout class="input-container">
                <Label text="Nom:" class="input-label" />
                <TextField v-model="nom" class="text-field" />
              </StackLayout>
              
              <StackLayout class="input-container">
                <Label text="Prénom:" class="input-label" />
                <TextField v-model="prenom" class="text-field" />
              </StackLayout>
              
              <!-- Date de naissance -->
              <StackLayout class="input-container">
                <Label text="Date de Naissance:" class="input-label" />
                <DatePicker v-model="dateNaissance" class="date-picker" />
              </StackLayout>
              
              <!-- Genre -->
              <StackLayout class="input-container">
                <Label text="Genre:" class="input-label" />
                <StackLayout orientation="horizontal" class="gender-options">
                  <Label :text="'Homme'" :class="genre === 'Homme' ? 'gender-option selected' : 'gender-option'" @tap="genre = 'Homme'" />
                  <Label :text="'Femme'" :class="genre === 'Femme' ? 'gender-option selected' : 'gender-option'" @tap="genre = 'Femme'" />
                  <Label :text="'Autre'" :class="genre === 'Autre' ? 'gender-option selected' : 'gender-option'" @tap="genre = 'Autre'" />
                </StackLayout>
              </StackLayout>
              
              <!-- Téléphone -->
              <StackLayout class="input-container">
                <Label text="Téléphone:" class="input-label" />
                <GridLayout rows="auto" columns="auto, *" class="phone-input">
                  <Image src="~/assets/images/dz-flag.png" width="24" class="country-flag" row="0" col="0" />
                  <TextField hint="+213" v-model="telephone" keyboardType="phone" class="phone-field" row="0" col="1" />
                </GridLayout>
              </StackLayout>
              
              <!-- Mot de passe -->
              <StackLayout class="input-container">
                <Label text="Mot de passe:" class="input-label" />
                <TextField v-model="motDePasse" secure="true" class="text-field" />
              </StackLayout>
              
              <!-- Confirmation mot de passe -->
              <StackLayout class="input-container">
                <Label text="Confirmer le mot de passe:" class="input-label" />
                <TextField v-model="confirmMotDePasse" secure="true" class="text-field" />
              </StackLayout>
              
              <!-- Email (facultatif) -->
              <StackLayout class="input-container">
                <Label text="Email: (facultatif)" class="input-label" />
                <TextField v-model="email" hint="Votre email" keyboardType="email" class="text-field" />
              </StackLayout>
              
              <!-- Bouton S'inscrire -->
              <Button text="S'inscrire" @tap="inscription" class="btn-inscription" :isEnabled="!isLoading" />
              <ActivityIndicator v-if="isLoading" busy="true" color="#FFCC33" />
            </StackLayout>
          </StackLayout>
        </ScrollView>
      </GridLayout>
    </Page>
  </template>
  
  <script>
  import { authService } from '../services/api';
  import { formatDate } from '../utils/helpers';
  
  export default {
    data() {
      return {
        nom: '',
        prenom: '',
        dateNaissance: new Date(2000, 0, 1),
        genre: 'Homme',
        genreOptions: ['Homme', 'Femme', 'Autre'],
        telephone: '',
        motDePasse: '',
        confirmMotDePasse: '',
        email: '',
        errorMessage: '',
        isLoading: false
      };
    },
    methods: {
      retour() {
        this.$navigateBack();
      },
      
      async inscription() {
        // Validation
        if (!this.nom || !this.prenom || !this.telephone || !this.motDePasse) {
          this.errorMessage = 'Veuillez remplir tous les champs obligatoires';
          return;
        }
        
        if (this.motDePasse !== this.confirmMotDePasse) {
          this.errorMessage = 'Les mots de passe ne correspondent pas';
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
          console.error('Erreur inscription:', error);
          this.errorMessage = error.message || 'Erreur lors de l\'inscription';
        } finally {
          this.isLoading = false;
        }
      }
    }
  };
  </script>
  
  <style scoped>
  .inscription-container {
    background-color: #000000;
    padding: 20;
  }
  
  .header {
    background-color: #000000;
    padding: 10;
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
  
  .input-label, .text-field {
    color: #ffffff;
  }
  
  .page-title {
    color: #ffffff;
    font-size: 24;
    font-weight: bold;
    text-align: center;
  }
  
  .logo {
    width: 120;
    height: 120;
    margin-top: 10;
    margin-bottom: 10;
    align-self: center;
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
    margin-bottom: 15;
    background-color: #333333;
    border-radius: 10;
    padding: 15;
  }
  
  .input-label {
    color: #ffffff;
    font-size: 16;
    margin-bottom: 5;
  }
  
  .text-field {
    color: #ffffff;
    font-size: 16;
  }
  
  .date-picker {
    color: #ffffff;
    background-color: #444444;
    border-radius: 5;
  }
  
  .gender-options {
    justify-content: space-between;
    margin-top: 5;
  }
  
  .gender-option {
    background-color: #444444;
    color: #ffffff;
    padding: 10 15;
    text-align: center;
    border-radius: 5;
    width: 30%;
  }
  
  .gender-option.selected {
    background-color: #FFCC33;
    color: #000000;
    font-weight: bold;
  }
  
  .dropdown {
    background-color: #444444;
    border-radius: 5;
    color: #FFCC33;
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
  
  .btn-inscription {
    background-color: #FFCC33;
    color: #000000;
    font-size: 18;
    font-weight: bold;
    border-radius: 20;
    height: 50;
    margin-top: 20;
    margin-bottom: 20;
  }
  </style>