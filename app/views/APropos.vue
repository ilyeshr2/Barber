<!-- app/views/APropos.vue -->
<template>
  <Page actionBarHidden="true">
    <GridLayout rows="auto, *">
      <!-- En-tête -->
      <GridLayout columns="auto, *" class="header" row="0">
        <Button text="<" @tap="retour" class="btn-retour" col="0" />
        <Label text="À Propos" class="page-title" col="1" />
      </GridLayout>
      
      <!-- Contenu principal -->
      <ScrollView row="1">
        <StackLayout class="about-container">
          <!-- Logo -->
          <Image :src="salonLogo" class="logo" stretch="aspectFit" />
          
          <!-- Contenu à propos -->
          <StackLayout class="about-content">
            <Label :text="salonName + ' - Votre Compagnon Beauté pour Hommes'" class="about-title" />
            
            <Label :text="'Découvrez une expérience de beauté exceptionnelle avec ' + salonName + ', l\'application tout-en-un qui vous permet de rester informé sur l\'actualité passionnante du monde de la beauté masculine tout en réservant facilement des rendez-vous pour une variété de services.'" class="about-text" textWrap="true" />
            
            <Label text="Actualités et Tendances" class="section-title" />
            <Label text="Restez à jour avec les dernières tendances beauté pour hommes avec Yaniso Studio. Explorez notre flux d'actualités pour découvrir des conseils et astuces beauté, des recommandations de produits de qualité, et des idées de coiffure à la pointe de la mode. Inspirez-vous et soyez toujours prêt à afficher votre meilleur look." class="about-text" textWrap="true" />
            
            <Label text="Réservation Facile" class="section-title" />
            <Label text="Grâce à notre application conviviale, vous pouvez rapidement et facilement prendre rendez-vous avec nos experts en beauté. Que vous ayez besoin d'une coupe de cheveux fraîche, d'un soin du visage relaxant ou d'un massage revitalisant, Pelo Studio vous connecte avec des coiffeurs, masseurs et autres professionnels qualifiés pour vous aider à avoir une apparence et une sensation optimales." class="about-text" textWrap="true" />
            
            <Label text="Facilité d'Utilisation" class="section-title" />
            <Label text="Notre application facile à utiliser rend la prise de rendez-vous chez Yaniso Studio simple et rapide. Utilisez notre calendrier en ligne, choisissez le créneau horaire qui vous convient le mieux, sélectionnez votre service préféré, et réservez en quelques clics. Vous recevrez une confirmation instantanée de votre réservation, et vous serez prêt à vous faire plaisir." class="about-text" textWrap="true" />
            
            <Label :text="'Avec ' + salonName + ', découvrez l\'expérience beauté ultime pour hommes. Réservez vos rendez-vous, inspirez-vous des dernières tendances, et profitez de services de qualité supérieure. Soyez au top de votre style avec ' + salonName + ' !'" class="about-text" textWrap="true" />
            
            <!-- Informations de contact -->
            <Label text="Service client: 438-686-6697" class="contact-info" />
            
            <!-- Réseaux sociaux -->
            <Label :text="'Rejoignez la Communauté ' + salonName" class="social-title" />
            <GridLayout columns="*, *, *" class="social-container">
              <Image src="~/assets/images/facebook-icon.png" class="social-icon" col="0" />
              <Image src="~/assets/images/instagram-icon.png" class="social-icon" col="1" />
              <Image src="~/assets/images/tiktok-icon.png" class="social-icon" col="2" />
            </GridLayout>
            
            <!-- Crédits -->
            <Label text="Conçu et Développé Par" class="credits-text" />
            <Label text="Institut Grasset" class="developer-name" />
          </StackLayout>
        </StackLayout>
      </ScrollView>
    </GridLayout>
  </Page>
</template>
  
<script>
import { salonService } from '../services/api';

export default {
  data() {
    return {
      salonLogo: '~/assets/images/yaniso-logo.png', // Default logo
      salonName: 'Yaniso Studio' // Default name
    };
  },
  mounted() {
    this.loadSalonInfo();
  },
  methods: {
    retour() {
      this.$navigateBack();
    },
    
    async loadSalonInfo() {
      try {
        console.log('APropos.vue: Requesting salon info...');
        const salon = await salonService.getSalonInfo();
        
        if (salon) {
          if (salon.name) {
            this.salonName = salon.name;
          }
          
          if (salon.logoUrl) {
            console.log('APropos.vue: Setting salon logo to:', salon.logoUrl);
            // Add a timestamp to avoid caching
            if (salon.logoUrl.startsWith('http')) {
              this.salonLogo = `${salon.logoUrl}?t=${new Date().getTime()}`;
            } else {
              this.salonLogo = salon.logoUrl;
            }
          }
        }
      } catch (error) {
        console.error('Error loading salon info:', error);
        // Keep default values if the API fails
      }
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
font-size: 30;
background-color: #212121;
color: #ffffff;
border-radius: 20;
width: 40;
height: 40;
padding: 0;
text-align: center;
}

.page-title {
  color: #ffffff;
  font-size: 20;
  font-weight: bold;
  text-align: center;
}

.about-container {
  background-color: #000000;
  padding: 20;
}

.logo {
  width: 120;
  height: 120;
  margin-top: 20;
  margin-bottom: 20;
  align-self: center;
}

.about-content {
  margin-top: 10;
}

.about-title {
  color: #ffffff;
  font-size: 18;
  font-weight: bold;
  margin-bottom: 15;
}

.about-text {
  color: #cccccc;
  font-size: 14;
  margin-bottom: 15;
  text-align: justify;
}

.section-title {
  color: #ffffff;
  font-size: 16;
  font-weight: bold;
  margin-top: 10;
  margin-bottom: 5;
}

.contact-info {
  color: #4da6ff;
  font-size: 14;
  margin-top: 20;
  margin-bottom: 20;
}

.social-title {
  color: #ffffff;
  font-size: 16;
  font-weight: bold;
  margin-bottom: 10;
}

.social-container {
  margin-bottom: 20;
}

.social-icon {
  width: 40;
  height: 40;
}

.credits-text {
  color: #999999;
  font-size: 12;
  text-align: center;
  margin-top: 20;
}

.developer-name {
  color: #ffffff;
  font-size: 14;
  font-weight: bold;
  text-align: center;
  margin-bottom: 20;
}
</style>