<!-- app/views/PeloStudio.vue -->
<template>
  <Page actionBarHidden="true">
    <GridLayout rows="auto, *, auto">
      <!-- En-tête -->
      <GridLayout columns="auto, *, auto" class="header" row="0">
        <Image :src="userAvatar" class="user-avatar" col="0" />
        <Image src="~/assets/images/yaniso-logo.png" class="app-icon" col="2" />
      </GridLayout>
      
      <!-- Contenu principal (feed) -->
      <GridLayout row="1" rows="auto, *">
        <!-- Message de bienvenue -->
        <StackLayout row="0" class="welcome-container">
          <Label text="Pelo Studio" class="welcome-title" />
          <Label :text="'Bonjour, ' + userName" class="welcome-text" />
          <Button text="Donnez-nous votre avis" class="review-button" />
        </StackLayout>
        
        <!-- Publications -->
        <ScrollView row="1">
          <StackLayout class="feed-container">
            <!-- Loading indicator -->
            <ActivityIndicator v-if="loading" busy="true" color="#ffcd50" class="loading-indicator" />
            
            <!-- Error message -->
            <Label v-if="error" class="error-message" :text="error" textWrap="true" />
            
            <!-- Publications statiques pour cette version -->
            <StackLayout v-if="!loading && !error" class="post-container" v-for="(post, index) in publications" :key="index">
              <Image :src="post.imageUrl" class="post-image" stretch="aspectFill" />
              
              <StackLayout class="post-footer">
                <StackLayout class="post-reactions" v-if="post.reactions">
                  <Label :text="post.reactions" class="post-emoji" />
                </StackLayout>
                
                <StackLayout v-if="post.title || post.description" class="post-description">
                  <Label v-if="post.title" :text="post.title" class="post-title" />
                  <Label v-if="post.description" :text="post.description" class="post-text" textWrap="true" />
                  <Label v-if="post.seeMore" text="voir plus" class="see-more" />
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
      <GridLayout columns="*, *, *, *" class="nav-bar" row="2">
        <StackLayout col="0" class="nav-item active" @tap="allerVersPage('PeloStudio')">
          <Image src="~/assets/images/pelo-icon-gold.png" class="nav-icon" />
          <Label text="Pelo Studio" class="nav-text" />
        </StackLayout>
        <StackLayout col="1" class="nav-item" @tap="allerVersPage('Barbiers')">
          <Image src="~/assets/images/barber-chair.png" class="nav-icon" />
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
import { authService } from '../services/api';

export default {
  data() {
    return {
      userAvatar: '~/assets/images/user-avatar.png',
      publications: [
        {
          imageUrl: '~/assets/images/post1.jpg',
          reactions: '😘😘',
          authorName: 'Mahmoud',
          authorImage: '~/assets/images/mahmoud.jpg',
          date: '09 Jan',
          description: '',
          liked: false
        },
        {
          imageUrl: '~/assets/images/post2.jpg',
          reactions: '💈 🔥',
          authorName: 'Islem',
          authorImage: '~/assets/images/islem.jpg',
          date: '08 Jan',
          description: '',
          liked: false
        },
        {
          imageUrl: '~/assets/images/post3.jpg',
          title: 'Naps nous rend visite',
          description: 'Une journée extraordinaire chez Pelo Studio ! 🎤 ✨ Nous avons eu l\'honneur d\'accueillir le talentueux rappeur Naps dans notre salon. Une expérience unique...',
          authorName: 'Rafik Pelo',
          authorImage: '~/assets/images/rafik.jpg',
          date: '16 Dec',
          reactions: '',
          seeMore: true,
          liked: false
        },
        {
          imageUrl: '~/assets/images/post4.jpg',
          authorName: 'Rafik Pelo',
          authorImage: '~/assets/images/rafik.jpg',
          date: '26 Aug',
          description: 'تريد الاستفادة من بطاقة حرفي قرض angem أو ansej مرافقة إدارية - تريد تأسيس مشروعك الخاص نرافقك حتى فتح محل للحلاقة ✂️...',
          seeMore: true,
          liked: false
        }
      ],
      userInfo: null,
      loading: false,
      error: null
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
    allerVersPage(page) {
      if (page === 'PeloStudio') {
        return; // Déjà sur cette page
      }
      this.$navigateTo(require(`./${page}`).default);
    },
    likePost(index) {
      this.publications[index].liked = !this.publications[index].liked;
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
.header {
  background-color: #000000;
  padding: 10;
  height: 60;
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
  width: 34;
  height: 34;
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
  height: 240;
  border-radius: 20;
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

.nav-bar {
  background-color: #000000;
  border-top-width: 0.5;
  border-top-color: #333333;
  height: 60;
  padding-bottom: 5;
}

.nav-item {
  text-align: center;
  padding: 5 0;
}

.nav-icon {
  width: 24;
  height: 24;
  margin-bottom: 3;
}

.nav-text {
  color: #999999;
  font-size: 12;
}

.active .nav-text {
  color: #ffcc33;
  font-weight: bold;
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