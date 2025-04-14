// app/utils/config.js 
import { isAndroid, isIOS } from '@nativescript/core/platform';
import * as ApplicationSettings from '@nativescript/core/application-settings';

const getApiHost = () => {
  if (isAndroid) {
    return '10.0.2.2'; // Android emulator
  } else if (isIOS) {
    return 'localhost'; // iOS simulator
  }
  return 'localhost'; // Default
};

// Function to get settings from local storage or use defaults
const getSetting = (key, defaultValue) => {
  const settingValue = ApplicationSettings.getString(`app_setting_${key}`, null);
  return settingValue ? settingValue : defaultValue;
};

export default {
  API_URL: `http://${getApiHost()}:3000/api`,
  DEFAULT_LOADING_MESSAGE: getSetting('loading_message', "Loading..."),
  DEFAULT_ERROR_MESSAGE: getSetting('error_message', "Something went wrong. Please try again later."),
  PLACEHOLDER_IMAGES: {
    BARBER: getSetting('barber_placeholder', "~/assets/images/default-barber.jpg"),
    USER: getSetting('user_placeholder', "~/assets/images/user-avatar.png"),
    SERVICE: getSetting('service_placeholder', "~/assets/images/default-service.jpg")
  },
  COLORS: {
    PRIMARY: getSetting('primary_color', "#FFCC33"),
    SECONDARY: getSetting('secondary_color', "#212121"),
    BACKGROUND: getSetting('background_color', "#000000"),
    TEXT: getSetting('text_color', "#FFFFFF"),
    TEXT_LIGHT: getSetting('text_light_color', "#CCCCCC"),
    DANGER: getSetting('danger_color', "#ff4d4d"),
    SUCCESS: getSetting('success_color', "#4CD964")
  },
  // Method to refresh settings from the server
  async refreshSettings() {
    try {
      const response = await fetch(`http://${getApiHost()}:3000/api/settings`);
      if (response.ok) {
        const settings = await response.json();
        if (settings) {
          // Save each setting to local storage
          Object.keys(settings).forEach(key => {
            const value = settings[key];
            if (value !== null && value !== undefined) {
              ApplicationSettings.setString(`app_setting_${key}`, value.toString());
            }
          });
          console.log('App settings refreshed from server');
        }
      }
    } catch (error) {
      console.error('Failed to refresh settings from server', error);
    }
  }
};