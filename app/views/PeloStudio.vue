<template>
  <Page actionBarHidden="true">
    <GridLayout rows="auto, *, auto">
      <!-- En-tête -->
      <GridLayout columns="auto, *, auto" class="header" row="0">
        <Image :src="userAvatar" class="user-avatar" col="0" />
        <Image :src="salonLogo" class="app-icon" col="2" />
      </GridLayout>
      
      <!-- Contenu principal (feed) -->
      <GridLayout row="1" rows="auto, *">
        <!-- Message de bienvenue -->
        <StackLayout row="0" class="welcome-container">
          <Label :text="salonName" class="welcome-title" />
          <Label :text="'Bonjour, ' + userName" class="welcome-text" />
          <Button text="Donnez-nous votre avis" class="review-button" />
        </StackLayout>
        
        <!-- Publications -->
        <ScrollView row="1">
          <StackLayout class="feed-container">
            <!-- Loading indicator -->
            <ActivityIndicator v-if="loading" busy="true" :color="config.COLORS.PRIMARY" class="loading-indicator" />
            
            <!-- Error message -->
            <Label v-if="error" class="error-message" :text="error" textWrap="true" />
            
            <!-- Publications -->
            <StackLayout v-if="!loading && !error" class="post-container" v-for="(post, index) in publications" :key="index">
              <Image :src="post.imageUrl" class="post-image" stretch="aspectFill" />
              
              <StackLayout class="post-footer">
                <StackLayout class="post-reactions" v-if="post.reactions">
                  <Label :text="post.reactions" class="post-emoji" />
                </StackLayout>
                
                <StackLayout v-if="post.title || post.description" class="post-description">
                  <Label v-if="post.title" :text="post.title" class="post-title" />
                  <Label v-if="post.description" :text="post.description" class="post-text" textWrap="true" />
                  <Label v-if="post.description && post.description.length > 100" text="voir plus" class="see-more" />
                </StackLayout>
                
                <GridLayout columns="auto, *, auto" class="post-author">
                  <Image :src="post.authorImage" class="author-avatar" col="0" />
                  <Label :text="post.authorName + ' • ' + post.date" class="author-info" col="1" />
                  <GridLayout columns="auto, auto" class="like-button-container" col="2" @tap="likePost(index)">
                    <Image :src="post.liked ? '~/assets/images/heart-filled.png' : '~/assets/images/heart.png'" width="24" height="24" col="0" class="like-icon" />
                    <Label text="J'aime" class="like-text" col="1" />
                  </GridLayout>
                </GridLayout>
              </StackLayout>
            </StackLayout>
          </StackLayout>
        </ScrollView>
      </GridLayout>
      
      <!-- Barre de navigation -->
      <NavigationBar row="2" currentPage="PeloStudio" />
      
    </GridLayout>
  </Page>
</template>

<script>
import { authService, publicationService, salonService } from '../services/api';
import NavigationBar from '../components/NavigationBar';
import config from '../utils/config';

export default {
  components: {
    NavigationBar
  },
  data() {
    return {
      userAvatar: config.PLACEHOLDER_IMAGES.USER,
      salonLogo: "~/assets/images/yaniso-logo.png",
      salonName: "Yaniso Studio",
      publications: [],
      userInfo: null,
      loading: true,
      error: null,
      config: config
    };
  },
  computed: {
    userName() {
      if (this.userInfo && this.userInfo.prenom) {
        return this.userInfo.prenom;
      }
      const user = authService.getUser();
      return user ? user.prenom : 'Utilisateur';
    }
  },
  mounted() {
    this.refreshUserInfo();
    this.loadPublications();
    this.loadSalonInfo();
    
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
    async loadPublications() {
      this.loading = true;
      this.error = null;
      
      try {
        // Fetch posts from the server
        this.publications = await publicationService.getAllPublications();
      } catch (error) {
        console.error('Error loading publications:', error);
        this.error = 'Could not load feed. Please check your internet connection and try again.';
        
        // Fallback to static content if API fails
        this.publications = [
          {
            id: 1,
            imageUrl: '~/assets/images/post1.png',
            reactions: '😘😘',
            authorName: 'Mahmoud',
            authorImage: '~/assets/images/mahmoud.jpg',
            date: '09 Jan',
            description: '',
            liked: false
          },
          {
            id: 2,
            imageUrl: '~/assets/images/post2.png',
            reactions: '💈 🔥',
            authorName: 'Islem',
            authorImage: '~/assets/images/islem.jpg',
            date: '08 Jan',
            description: '',
            liked: false
          }
        ];
      } finally {
        this.loading = false;
      }
    },
    
    async loadSalonInfo() {
      try {
        const salon = await salonService.getSalonInfo();
        if (salon) {
          this.salonName = salon.name;
          if (salon.logo_url) {
            this.salonLogo = salon.logo_url;
          }
        }
      } catch (error) {
        console.error('Error loading salon info:', error);
        // Keep default values if the API fails
      }
    },
    
    likePost(index) {
      this.publications[index].liked = !this.publications[index].liked;
      
      // Send like to server if post has an ID
      if (this.publications[index].id) {
        publicationService.likePublication(this.publications[index].id)
          .catch(err => console.error('Error liking post:', err));
      }
    },
    
    refreshUserInfo() {
      this.userInfo = authService.getUser();
    },
    
    onNavigatedTo() {
      this.refreshUserInfo();
    }
  }
};;
</script>


<style scoped>
.header {
  background-color: #000000;
  padding: 10;
  height: 70;
}

.user-avatar {
  width: 40;
  height: 40;
  border-radius: 20;
  margin-left: 5;
}

.app-title {
  color: #ffffff;
  font-size: 20;
  font-weight: bold;
  text-align: center;
}

.app-icon {
  width: 70;
  height: 70;
  margin-right: 5;
}

.welcome-container {
  background-color: #000000;
  padding: 0 15 15 15;
}

.welcome-title {
  color: #ffffff;
  font-size: 28;
  font-weight: bold;
  margin-bottom: 0;
}

.welcome-text {
  color: #999999;
  font-size: 16;
  margin-bottom: 15;
}

.review-button {
  background-color: transparent;
  color: #ffcc33;
  border-width: 1;
  border-color: #ffcc33;
  border-radius: 20;
  height: 40;
  text-transform: none;
  font-size: 16;
  width: 100%;
}

.feed-container {
  background-color: #000000;
  padding: 0;
}

.post-container {
  margin-bottom: 15;
  border-radius: 20;
  background-color: #212121;
  overflow: hidden;
}

.post-image {
  width: 100%;
  height: 450; 
  max-height: 300px; 
  border-radius: 20px;
  object-fit: contain; 
}

.post-footer {
  padding: 5 15;
  background-color: #212121;
  border-radius: 20;
}

.post-reactions {
  margin-top: 5;
  margin-bottom: 5;
}

.post-emoji {
  font-size: 16;
}

.post-description {
  margin-bottom: 8;
}

.post-title {
  color: #ffffff;
  font-size: 18;
  font-weight: bold;
  margin-top: 5;
}

.post-text {
  color: #cccccc;
  font-size: 14;
  margin-top: 2;
}

.see-more {
  color: #ffcc33;
  font-size: 14;
  margin-top: 2;
}

.post-author {
  height: 40;
  padding-top: 5;
  padding-bottom: 5;
  border-top-width: 0.5;
  border-top-color: #333333;
}

.author-avatar {
  width: 30;
  height: 30;
  border-radius: 15;
}

.author-info {
  color: #ffffff;
  font-size: 14;
  margin-left: 5;
  vertical-align: center;
}

.like-button-container {
  horizontal-align: right;
  vertical-align: center;
}

.like-icon {
  vertical-align: center;
}

.like-text {
  color: #ffffff;
  font-size: 14;
  vertical-align: center;
  margin-left: 5;
}

.error-message {
  color: #ff4d4d;
  font-size: 16;
  text-align: center;
  margin: 20;
  padding: 10;
}

.loading-indicator {
  margin: 50;
}
</style>