<!-- app/components/NavigationBar.vue -->
<template>
    <GridLayout columns="*, *, *, *" class="nav-bar">
      <StackLayout col="0" class="nav-item" :class="{ 'active': currentPage === 'PeloStudio' }" @tap="goToPage('PeloStudio')">
        <Image src="~/assets/images/home-icon.png" class="nav-icon" />
        <Label text="Yaniso Studio" class="nav-text" />
      </StackLayout>
      <StackLayout col="1" class="nav-item" :class="{ 'active': currentPage === 'Barbiers' }" @tap="goToPage('Barbiers')">
        <Image src="~/assets/images/barber-icon.png" class="nav-icon" />
        <Label text="Barbiers" class="nav-text" />
      </StackLayout>
      <StackLayout col="2" class="nav-item" :class="{ 'active': currentPage === 'Rendez-vous' }" @tap="goToPage('Rendez-vous')">
        <Image src="~/assets/images/calendar-icon.png" class="nav-icon" />
        <Label text="Rendez-vous" class="nav-text" />
      </StackLayout>
      <StackLayout col="3" class="nav-item" :class="{ 'active': currentPage === 'Parametres' }" @tap="goToPage('Parametres')">
        <Image src="~/assets/images/settings-icon.png" class="nav-icon" />
        <Label text="Paramètres" class="nav-text" />
      </StackLayout>
    </GridLayout>
  </template>
  
  <script>
  export default {
    props: {
      currentPage: {
        type: String,
        required: true
      }
    },
    methods: {
      goToPage(page) {
        if (page === this.currentPage) return;
        this.$navigateTo(require(`../views/${page}`).default);
      }
    }
  };
  </script>
  
  <style scoped>
  .nav-bar {
    background-color: #000000;
    border-top-width: 1;
    border-top-color: #333333;
    height: 60;
    padding-bottom: 5;
  }
  
  .nav-item {
    text-align: center;
    padding: 5 0;
  }
  
  .nav-icon {
    width: 22;
    height: 22;
    margin-bottom: 3;
    opacity: 0.6;
  }
  
  .nav-text {
    color: #888888;
    font-size: 12;
    text-align: center;
  }
  
  .active .nav-text {
    color: #FFCC33;
  }
  
  .active .nav-icon {
    opacity: 1;
  }
  </style>