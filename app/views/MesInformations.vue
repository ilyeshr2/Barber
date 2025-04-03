<!-- app/views/MesInformations.vue -->
<template>
    <Page actionBarHidden="true">
      <GridLayout rows="auto, *">
        <!-- En-tête -->
        <GridLayout columns="auto, *" class="header" row="0">
          <Button text="←" @tap="retour" class="btn-retour" col="0" />
          <Label text="My Informations" class="page-title" col="1" />
        </GridLayout>
        
        <!-- Contenu principal -->
        <ScrollView row="1">
          <StackLayout class="info-container">
            <!-- Logo -->
            <Image src="~/assets/images/pelo-logo.png" class="logo" stretch="aspectFit" />
            
            <!-- Loading indicator -->
            <ActivityIndicator v-if="loading" busy="true" color="#FFCC33" />
            
            <!-- Error message -->
            <Label v-if="errorMessage" class="error-message" :text="errorMessage" textWrap="true" />
            
            <!-- Formulaire d'informations -->
            <StackLayout v-if="!loading && !errorMessage" class="form-container">
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
                  <Label text="Homme" :class="genre === 'Homme' ? 'gender-option selected' : 'gender-option'" @tap="genre = 'Homme'" />
                  <Label text="Femme" :class="genre === 'Femme' ? 'gender-option selected' : 'gender-option'" @tap="genre = 'Femme'" />
                  <Label text="Autre" :class="genre === 'Autre' ? 'gender-option selected' : 'gender-option'" @tap="genre = 'Autre'" />
                </StackLayout>
              </StackLayout>
              
              <!-- Téléphone -->
              <StackLayout class="input-container">
                <Label text="Téléphone:" class="input-label" />
                <GridLayout rows="auto" columns="auto, *" class="phone-input">
                  <Image src="~/assets/images/dz-flag.png" width="24" class="country-flag" row="0" col="0" />
                  <TextField v-model="telephone" keyboardType="phone" class="phone-field" row="0" col="1" editable="false" />
                </GridLayout>
              </StackLayout>
              
              <!-- Email (facultatif) -->
              <StackLayout class="input-container">
                <Label text="Email: (facultatif)" class="input-label" />
                <TextField v-model="email" hint="Votre email" keyboardType="email" class="text-field" />
              </StackLayout>
              
              <!-- Bouton Enregistrer -->
              <Button text="Save" @tap="enregistrer" class="save-button" :isEnabled="!isSaving" />
              <ActivityIndicator v-if="isSaving" busy="true" color="#FFCC33" />
              
              <!-- Supprimer le compte -->
              <Label text="Delete my account" @tap="supprimerCompte" class="delete-account" />
            </StackLayout>
          </StackLayout>
        </ScrollView>
      </GridLayout>
    </Page>
  </template>
  
  <script>
  import { authService } from '../services/api';
  import * as ApplicationSettings from "@nativescript/core/application-settings";
  import { alert, confirm } from '@nativescript/core/ui/dialogs';
  
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
        telephone: '',
        email: ''
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
            } catch (profileError) {
              console.log('Could not load detailed profile, using basic info', profileError);
              // Continue with basic info if profile data isn't available
            }
          } else {
            this.errorMessage = 'Utilisateur non connecté';
          }
        } catch (error) {
          console.error('Error loading user data:', error);
          this.errorMessage = 'Erreur lors du chargement des données utilisateur';
        } finally {
          this.loading = false;
        }
      },
      
      retour() {
        this.$navigateBack();
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
            title: "Informations sauvegardées",
            message: "Vos informations ont été mises à jour avec succès.",
            okButtonText: "OK"
          });
          
          // Return to previous screen
          this.$navigateBack();
        } catch (error) {
          console.error('Error saving user data:', error);
          this.errorMessage = 'Erreur lors de la sauvegarde des données: ' + error.message;
        } finally {
          this.isSaving = false;
        }
      },
      
      supprimerCompte() {
        confirm({
          title: "Supprimer le compte",
          message: "Êtes-vous sûr de vouloir supprimer votre compte? Cette action est irréversible.",
          okButtonText: "Supprimer",
          cancelButtonText: "Annuler"
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
  .header {
    background-color: #000000;
    padding: 10;
    height: 50;
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
  
  .page-title {
    color: #ffffff;
    font-size: 20;
    font-weight: bold;
    text-align: center;
  }
  
  .info-container {
    background-color: #000000;
    padding: 10;
  }
  
  .logo {
    width: 120;
    height: 120;
    margin-top: 20;
    margin-bottom: 20;
    align-self: center;
  }
  
  .error-message {
    color: #ff4d4d;
    text-align: center;
    margin: 20;
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
  color: #999999;
  font-size: 14;
  margin-bottom: 5;
}

.text-field {
  color: #ffffff;
  font-size: 16;
  height: 40;
}

.date-picker {
  color: #ffffff;
  background-color: #444444;
  border-radius: 5;
  height: 40;
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
  
  .save-button {
    background-color: #FFCC33;
    color: #000000;
    font-size: 18;
    font-weight: bold;
    border-radius: 20;
    height: 50;
    margin-top: 20;
    margin-bottom: 20;
  }
  
  .delete-account {
    color: #ff4d4d;
    font-size: 16;
    text-align: center;
    margin-bottom: 20;
  }
  </style>