<!-- app/views/Barbiers.vue (Updated for Dynamic Data) -->
<template>
  <Page actionBarHidden="true">
    <GridLayout rows="auto, *, auto">
      <!-- Header -->
      <GridLayout row="0" columns="auto, *, auto" class="header">
        <Image :src="userInfo && userInfo.photoUrl ? userInfo.photoUrl : '~/assets/images/user-avatar.png'" class="user-avatar" col="0" />
        <Label text="" col="1" />
        <Image :src="salonLogo" class="app-logo" col="2" />
      </GridLayout>

      <!-- Main content area -->
      <ScrollView row="1" class="content-area">
        <StackLayout>
          <!-- Welcome section -->
          <StackLayout class="welcome-section">
            <Label text="Barbiers" class="page-title" col="1" />
            <Label :text="'Bonjour, ' + userName" class="welcome-text" />
            <Button text="Donnez-nous votre avis" class="review-button" @tap="giveReview" />
          </StackLayout>

          <!-- Salon info - now dynamic -->
          <GridLayout columns="auto, *" class="salon-info" @tap="showSalonDetails">
            <StackLayout class="store-box">
              <Image src="~/assets/images/shop-icon.png" class="salon-icon" col="0" />
            </StackLayout>
            <Label :text="salonAddress" class="salon-name" col="1" />
          </GridLayout>

          <!-- Loading indicator -->
          <ActivityIndicator v-if="loading" busy="true" color="#FFCC33" class="loading-indicator" />

          <!-- Error message with retry button -->
          <StackLayout v-else-if="error" class="error-container">
            <Label class="error-message" :text="error" textWrap="true" />
            <Button text="Réessayer" @tap="loadBarbers" class="retry-button" />
          </StackLayout>

          <!-- Barbers list -->
          <StackLayout v-else class="barbers-list">
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
                      <Label :text="(barbier.note !== null && barbier.note !== undefined && !isNaN(Number(barbier.note))) ? Number(barbier.note).toFixed(1) : '0.0'" class="rating-value" col="0" />
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
      <NavigationBar row="2" currentPage="Barbiers" />
    </GridLayout>
  </Page>
</template>

<script>
import { barbierService, authService } from '../services/api';
import NavigationBar from '../components/NavigationBar';

export default {
  components: {
    NavigationBar
  },
  data() {
    return {
      barbiers: [],
      loading: true,
      error: null,
      userInfo: null,
      salonInfo: {},
      salonLogo: "~/assets/images/yaniso-logo.png",
      salonAddress: "Rue Jean-Talon E, Montréal"
    };
  },
  computed: {
    userName() {
      if (this.userInfo && this.userInfo.prenom) {
        return this.userInfo.prenom;
      }
      const user = authService.getUser();
      return user ? user.prenom : 'Visiteur';
    }
  },
  mounted() {
    this.loadBarbers();
    this.loadSalonInfo();
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
        const barbers = await barbierService.getAllBarbers();
        console.log('Response from barbers API:', JSON.stringify(barbers));
        this.barbiers = barbers;
      } catch (error) {
        console.error('Error loading barbers:', error);
        this.error = 'Unable to load barbers. Please check your connection and try again.';
      } finally {
        this.loading = false;
      }
    },

    async loadSalonInfo() {
      try {
        // If you've implemented the salonService as suggested in the previous code
        if (typeof salonService !== 'undefined') {
          const salon = await salonService.getSalonInfo();
          if (salon) {
            this.salonInfo = salon;
            if (salon.address) {
              this.salonAddress = salon.address;
            }
            if (salon.logo_url) {
              this.salonLogo = salon.logo_url;
            }
          }
        }
      } catch (error) {
        console.error('Error loading salon info:', error);
        // Keep default values if the API fails
      }
    },

    voirDetailsBarbier(barbier) {
      this.$navigateTo(require('./DetailsBarbier').default, {
        props: { 
          barbierId: barbier.id,
          barbierInfo: barbier 
        }
      });
    },

    getBarbierImage(barbier) {
      if (!barbier || !barbier.photoUrl) {
        return '~/assets/images/barber-1.jpg';
      }
      
      // If photoUrl starts with /, add the server URL
      if (barbier.photoUrl.startsWith('/')) {
        return `http://10.0.2.2:3000${barbier.photoUrl}`;
      }
      
      return barbier.photoUrl;
    },

    refreshUserInfo() {
      this.userInfo = authService.getUser();
    },

    onNavigatedTo() {
      this.refreshUserInfo();
    },

    giveReview() {
      // Implement the review functionality
      alert("Cette fonctionnalité sera disponible prochainement!");
    },

    showSalonDetails() {
      // Navigate to salon details page if it exists
      try {
        this.$navigateTo(require('./SalonDetails').default, {
          props: { salonInfo: this.salonInfo }
        });
      } catch (error) {
        console.error('SalonDetails view not found:', error);
        alert("Cette fonctionnalité sera disponible prochainement!");
      }
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

.loading-indicator {
  margin: 50;
}
</style>