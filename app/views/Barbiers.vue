<!-- app/views/Barbiers.vue -->
<template>
  <Page actionBarHidden="true">
    <GridLayout rows="auto, *, auto">
      <!-- Header -->
      <GridLayout row="0" columns="auto, *, auto" class="header">
        <Image src="~/assets/images/user-avatar.png" class="user-avatar" col="0" />
        <Image src="~/assets/images/yaniso-logo.png" class="app-logo" col="2" />
      </GridLayout>

      <!-- Main content area -->
      <ScrollView row="1" class="content-area">
        <StackLayout>
          <!-- Welcome section -->
          <StackLayout class="welcome-section">
            <Label text="Barbiers" class="page-title" col="1" />
            <Label :text="'Bonjour, ' + userName" class="welcome-text" />
            <Button text="Donnez-nous votre avis" class="review-button" />
          </StackLayout>

          <!-- Salon info -->
          <GridLayout columns="auto, *" class="salon-info">
            <StackLayout class="store-box">
              <Image src="~/assets/images/shop-icon.png" class="salon-icon" col="0" />
            </StackLayout>
            <Label text="Le Pelo Cité Djamel, Oran" class="salon-name" col="1" />
          </GridLayout>

          <!-- Loading indicator -->
          <ActivityIndicator v-if="loading" busy="true" color="#FFCC33" />

          <!-- Error message -->
          <Label v-if="error" class="error-message" :text="error" textWrap="true" />

          <!-- Barbers list -->
          <StackLayout v-if="!loading && !error" class="barbers-list">
            <StackLayout v-for="barbier in barbiers" :key="barbier.id" class="barber-card" @tap="voirDetailsBarbier(barbier)">
              <GridLayout rows="*">
                <Image :src="getBarbierImage(barbier)" class="barber-image" stretch="aspectFill" />
                <StackLayout class="barber-info-overlay" horizontalAlignment="center" verticalAlignment="bottom" margin="0 0 20 0">
                  <GridLayout columns="*, auto" rows="auto" class="barber-info-container">
                    <StackLayout col="0" class="barber-info">
                      <Label :text="barbier.nom" class="barber-name" />
                      <Label text="Barbier" class="barber-title" />
                    </StackLayout>
                    <GridLayout col="1" columns="auto, auto" class="rating-container">
                      <Label :text="barbier.note.toFixed(1)" class="rating-value" col="0" />
                      <Label text="★" class="rating-star" col="1" />
                    </GridLayout>
                  </GridLayout>
                </StackLayout>
              </GridLayout>
            </StackLayout>
          </StackLayout>
        </StackLayout>
      </ScrollView>

      <!-- Bottom navigation bar -->
      <GridLayout row="2" columns="*, *, *, *" class="nav-bar">
        <StackLayout col="0" class="nav-item" @tap="allerVersPage('PeloStudio')">
          <Image src="~/assets/images/home-icon.png" class="nav-icon" />
          <Label text="Pelo Studio" class="nav-text" />
        </StackLayout>
        <StackLayout col="1" class="nav-item active" @tap="allerVersPage('Barbiers')">
          <Image src="~/assets/images/barber-icon.png" class="nav-icon" />
          <Label text="Barbiers" class="nav-text" />
        </StackLayout>
        <StackLayout col="2" class="nav-item" @tap="allerVersPage('Rendez-vous')">
          <Image src="~/assets/images/calendar-icon.png" class="nav-icon" />
          <Label text="Rendez-vous" class="nav-text" />
        </StackLayout>
        <StackLayout col="3" class="nav-item" @tap="allerVersPage('Parametres')">
          <Image src="~/assets/images/settings-icon.png" class="nav-icon" />
          <Label text="Paramètres" class="nav-text" />
        </StackLayout>
      </GridLayout>
    </GridLayout>
  </Page>
</template>

<script>
import { barbierService, authService } from '../services/api';

export default {
  data() {
    return {
      barbiers: [],
      loading: true,
      error: null,
      userInfo: null
    };
  },
  computed: {
    userName() {
      if (this.userInfo && this.userInfo.prenom) {
        return this.userInfo.prenom;
      }
      const user = authService.getUser();
      return user ? user.prenom : 'Citric acid';
    }
  },
  mounted() {
    this.loadBarbers();
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
    async loadBarbers() {
      this.loading = true;
      this.error = null;

      try {
        this.barbiers = await barbierService.getAllBarbers();
      } catch (error) {
        console.error('Error loading barbers:', error);
        this.error = 'Error loading barbers';
      } finally {
        this.loading = false;
      }
    },

    allerVersPage(page) {
      if (page === 'Barbiers') {
        return; // Already on this page
      }
      this.$navigateTo(require(`./${page}`).default);
    },

    voirDetailsBarbier(barbier) {
      this.$navigateTo(require('./DetailsBarbier').default, {
        props: { barbierId: barbier.id }
      });
    },

    getBarbierImage(barbier) {
      // Fallback to default image if photoUrl is missing or invalid
      if (!barbier.photoUrl || barbier.photoUrl.includes('imgur')) {
        return `~/assets/images/barber-${barbier.id}.jpg`;
      }
      return barbier.photoUrl;
    },

    refreshUserInfo() {
      this.userInfo = authService.getUser();
    },

    onNavigatedTo() {
      this.refreshUserInfo();
    }
  }
};
</script>

<style scoped>
/* Header styles */
.header {
  background-color: #000000;
  padding: 0 16;
  height: 50;
}

.store-box{
  border-radius: 18;
  background-color: #3a3a3a;
  width: 44;
  height: 44;
  vertical-align: center;
  margin-right: 10;
  margin-left: 0;
}

.user-avatar {
  width: 30;
  height: 30;
  border-radius: 20;
}

.page-title {
  color: #ffffff;
  font-size: 40;
  font-weight: bold;
}

.app-logo {
  margin-top: 10;
  width: 60;
  height: 60;
}

/* Content area */
.content-area {
  background-color: #000000;
}

/* Welcome section */
.welcome-section {
  padding: 0 16 20 16;
}

.welcome-text {
  color: #999999;
  font-size: 16;
  margin-bottom: 12;
}

.review-button {
  background-color: transparent;
  color: #ffcd50;
  border-width: 1;
  border-color: #ffcd50;
  border-radius: 20;
  height: 40;
  text-transform: none;
  font-size: 14;
}

/* Salon info */
.salon-info {
  background-color: #212121;
  border-radius: 20;
  padding: 5 10;
  margin: 0 16 16 16;
}

.salon-icon {
  width: 22;
  height: 22;
  margin-right: 10;
  margin-left: 10;
  vertical-align: middle;
}

.salon-name {
  color: #ffffff;
  font-size: 16;
  vertical-align: middle;
}

/* Barbers list */
.barbers-list {
  padding: 0 16;
}

.barber-card {
  margin-bottom: 20;
  border-radius: 20;
  overflow: hidden;
  height: 280;
}

.barber-image {
  width: 100%;
  height: 100%;
  border-radius: 20;
}

.barber-info-overlay {
  width: 80%;
}

.barber-info-container {
  background-color: rgba(60, 60, 60, 0.7);
  backdrop-filter: blur(10);
  padding: 5 16;
  border-radius: 20;
  margin-bottom: 10;
}

.barber-info {
  vertical-align: center;
}

.barber-name {
  color: #ffffff;
  font-size: 20;
  font-weight: bold;
}

.barber-title {
  color: #cccccc;
  font-size: 14;
  margin-top: 0;
}

.rating-container {
  vertical-align: center;
}

.rating-value {
  color: #ffffff;
  font-size: 16;
  font-weight: bold;
  vertical-align: middle;
}

.rating-star {
  color: #ffcd50;
  font-size: 16;
  vertical-align: middle;
  margin-left: 2;
}

.error-message {
  color: #ff4d4d;
  text-align: center;
  margin: 20;
  padding: 20;
  font-size: 16;
}

/* Navigation bar */
.nav-bar {
  background-color: #000000;
  height: 70;
  border-top-width: 1;
  border-top-color: #1a1a1a;
}

.nav-item {
  text-align: center;
  padding: 10 0;
}

.nav-icon {
  width: 24;
  height: 24;
  margin-bottom: 5;
}

.nav-text {
  color: #999999;
  font-size: 12;
}

.active .nav-text {
  color: #ffcd50;
}

.active .nav-icon {
  filter: sepia(100%) saturate(10000%) hue-rotate(20deg);
}

.loading-indicator {
  margin: 50;
}
</style>