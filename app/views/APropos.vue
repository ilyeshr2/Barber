<!-- app/views/APropos.vue -->
<template>
    <Page actionBarHidden="true">
      <GridLayout rows="auto, *">
        <!-- En-tête -->
        <GridLayout columns="auto, *" class="header" row="0">
          <Button text="←" @tap="retour" class="btn-retour" col="0" />
          <Label text="About Us" class="page-title" col="1" />
        </GridLayout>
        
        <!-- Contenu principal -->
        <ScrollView row="1">
          <StackLayout class="about-container">
            <!-- Logo -->
            <Image src="~/assets/images/pelo-logo.png" class="logo" stretch="aspectFit" />
            
            <!-- Contenu à propos -->
            <StackLayout class="about-content">
              <Label text="Pelo Studio - Your Beauty Companion for Men" class="about-title" />
              
              <Label text="Discover an exceptional beauty experience with Pelo Studio, the all-in-one application that allows you to stay updated on the passionate news of the world of men's beauty while easily booking appointments for a variety of services." class="about-text" textWrap="true" />
              
              <Label text="News and Trends" class="section-title" />
              <Label text="Stay up-to-date with the latest beauty trends for men with Pelo Studio. Explore our news feed to discover beauty tips and tricks, quality product recommendations, and cutting-edge hairstyle ideas. Be inspired and always be ready to showcase your best look." class="about-text" textWrap="true" />
              
              <Label text="Easy Booking" class="section-title" />
              <Label text="Thanks to our user-friendly application, you can quickly and easily book an appointment with our beauty experts. Whether you need a fresh haircut, a relaxing facial treatment, or a revitalizing massage, Pelo Studio connects you with qualified hairdressers, masseurs, and other professionals to help you look and feel your best." class="about-text" textWrap="true" />
              
              <Label text="Ease of Use" class="section-title" />
              <Label text="Our user-friendly app makes booking an appointment at Pelo Studio easy and fast. Use our online calendar, choose the time slot that suits you best, select your preferred service, and book in just a few clicks. You'll receive an instant confirmation of your reservation, and you'll be ready to indulge yourself." class="about-text" textWrap="true" />
              
              <Label text="With Pelo Studio, discover the ultimate beauty experience for men. Book your appointments, get inspired by the latest trends, and enjoy top-quality services. Be at the top of your style with Pelo Studio!" class="about-text" textWrap="true" />
              
              <!-- Informations de contact -->
              <Label text="Customer Service: 041 70 95 95" class="contact-info" />
              
              <!-- Réseaux sociaux -->
              <Label text="Join the Pelo Community" class="social-title" />
              <GridLayout columns="*, *, *" class="social-container">
                <Image src="~/assets/images/facebook-icon.png" class="social-icon" col="0" />
                <Image src="~/assets/images/instagram-icon.png" class="social-icon" col="1" />
                <Image src="~/assets/images/tiktok-icon.png" class="social-icon" col="2" />
              </GridLayout>
              
              <!-- Crédits -->
              <Label text="Designed and Developed By" class="credits-text" />
              <Label text="Mohamed SAHNINE" class="developer-name" />
            </StackLayout>
          </StackLayout>
        </ScrollView>
      </GridLayout>
    </Page>
  </template>
  
  <script>
  export default {
    methods: {
      retour() {
        this.$navigateBack();
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