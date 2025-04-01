<!-- app/views/PeloStudio.vue -->
<template>
    <Page actionBarHidden="true">
      <GridLayout rows="auto, *, auto">
        <!-- En-tête -->
        <GridLayout columns="auto, *, auto" class="header" row="0">
          <Image :src="userAvatar" class="user-avatar" col="0" />
          <Label text="Pelo Studio" class="app-title" col="1" />
          <Image src="~/assets/images/pelo-icon.png" class="app-icon" col="2" />
        </GridLayout>
        
        <!-- Contenu principal (feed) -->
        <GridLayout row="1" rows="auto, *">
          <!-- Message de bienvenue -->
          <StackLayout row="0" class="welcome-container">
            <Label :text="'Bonjour, ' + userName" class="welcome-text" />
            <Button text="Laissez-nous un commentaire" class="review-button" />
          </StackLayout>
          
          <!-- Publications -->
          <ScrollView row="1">
            <StackLayout class="feed-container">
              <!-- Publications statiques pour cette version -->
              <StackLayout class="post-container" v-for="(post, index) in publications" :key="index">
                <Image :src="post.imageUrl" class="post-image" stretch="aspectFill" />
                <StackLayout class="post-footer">
                  <StackLayout class="post-reactions" v-if="post.reactions">
                    <Label :text="post.reactions" class="post-emoji" />
                  </StackLayout>
                  <GridLayout columns="auto, *, auto" class="post-author">
                    <Image :src="post.authorImage" class="author-avatar" col="0" />
                    <Label :text="post.authorName + ' • ' + post.date" class="author-info" col="1" />
                    <Button text="Like" class="like-button" col="2" @tap="likePost(index)" />
                  </GridLayout>
                  <StackLayout v-if="post.title || post.description" class="post-description">
                    <Label v-if="post.title" :text="post.title" class="post-title" />
                    <Label v-if="post.description" :text="post.description" class="post-text" textWrap="true" />
                    <Label v-if="post.description && post.description.length > 100" text="voir plus" class="see-more" />
                  </StackLayout>
                </StackLayout>
              </StackLayout>
            </StackLayout>
          </ScrollView>
        </GridLayout>
        
        <!-- Barre de navigation -->
        <GridLayout columns="*, *, *, *" class="nav-bar" row="2">
          <StackLayout col="0" class="nav-item active" @tap="allerVersPage('PeloStudio')">
            <Image src="~/assets/images/home-icon.png" class="nav-icon" />
            <Label text="Pelo Studio" class="nav-text" />
          </StackLayout>
          <StackLayout col="1" class="nav-item" @tap="allerVersPage('Barbiers')">
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
          description: ''
        },
        {
          imageUrl: '~/assets/images/post2.jpg',
          reactions: '💈 🔥',
          authorName: 'Islem',
          authorImage: '~/assets/images/islem.jpg',
          date: '08 Jan',
          description: ''
        },
        {
          imageUrl: '~/assets/images/post3.jpg',
          title: 'Naps nous rend visite',
          description: 'Une journée extraordinaire chez Pelo Studio ! 🎤 ✨ Nous avons eu l\'honneur d\'accueillir le talentueux rappeur Naps dans notre salon. Une expérience unique...',
          authorName: 'Rafik Pelo',
          authorImage: '~/assets/images/rafik.jpg',
          date: '16 Dec',
          reactions: ''
        }
      ],
      userInfo: null
    };
  },
  computed: {
    userName() {
      if (this.userInfo && this.userInfo.prenom) {
        return this.userInfo.prenom;
      }
      const user = authService.getUser();
      return user ? user.prenom : 'Invité';
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
      // Simulate liking a post
      alert("Vous avez aimé cette publication!");
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
  height: 50;
}

.user-avatar {
  width: 40;
  height: 40;
  border-radius: 20;
}

.app-title {
  color: #ffffff;
  font-size: 20;
  font-weight: bold;
  text-align: center;
}

.app-icon {
  width: 30;
  height: 30;
}

.welcome-container {
  background-color: #000000;
  padding: 10;
}

.welcome-text {
  color: #999999;
  font-size: 16;
  margin-bottom: 10;
}

.review-button {
  background-color: #333333;
  color: #FFCC33;
  border-width: 1;
  border-color: #FFCC33;
  border-radius: 20;
  height: 40;
  margin-bottom: 15;
}

.feed-container {
  background-color: #000000;
  padding: 10;
}

.post-container {
  margin-bottom: 20;
}

.post-image {
  width: 100%;
  height: 200;
  border-radius: 10;
}

.post-footer {
  margin-top: 5;
}

.post-reactions {
  margin-bottom: 5;
}

.post-emoji {
  font-size: 16;
}

.post-author {
  margin-bottom: 5;
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
}

.like-button {
  color: #ffffff;
  background-color: transparent;
  font-size: 14;
  padding: 0;
}

.post-description {
  margin-top: 5;
}

.post-title {
  color: #ffffff;
  font-size: 16;
  font-weight: bold;
}

.post-text {
  color: #cccccc;
  font-size: 14;
}

.see-more {
  color: #FFCC33;
  font-size: 14;
}

.nav-bar {
  background-color: #000000;
  border-top-width: 1;
  border-top-color: #333333;
  height: 60;
}

.nav-item {
  text-align: center;
  padding: 10;
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
  color: #FFCC33;
}

.active .nav-icon {
  filter: sepia(100%) saturate(10000%) hue-rotate(20deg);
}
</style>