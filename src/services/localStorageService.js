// src/services/localStorageService.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  USER_PROFILE: '@tvk_user_profile',
  AUTH_TOKEN: '@tvk_auth_token',
  IS_LOGGED_IN: '@tvk_is_logged_in',
  APP_LANGUAGE: '@tvk_app_language',
  LANGUAGE_CHOSEN: '@tvk_has_chosen_language',
};

/**
 * Save user profile and set auth status in AsyncStorage
 */
export async function saveUserSession(profile) {
  try {
    if (!profile) return false;
    const jsonValue = JSON.stringify(profile);
    await AsyncStorage.multiSet([
      [KEYS.USER_PROFILE, jsonValue],
      [KEYS.IS_LOGGED_IN, 'true'],
      [KEYS.AUTH_TOKEN, profile.id || `token_${Date.now()}`],
    ]);
    console.log('✅ User session saved locally for:', profile.name, profile.phone);
    return true;
  } catch (error) {
    console.warn('⚠️ Error saving user session:', error);
    return false;
  }
}

/**
 * Get stored user profile from AsyncStorage
 */
export async function getUserSession() {
  try {
    const values = await AsyncStorage.multiGet([KEYS.USER_PROFILE, KEYS.IS_LOGGED_IN]);
    const userProfileStr = values[0][1];
    const isLoggedIn = values[1][1] === 'true';

    if (isLoggedIn && userProfileStr) {
      const parsed = JSON.parse(userProfileStr);
      return { isLoggedIn: true, user: parsed };
    }
    return { isLoggedIn: false, user: null };
  } catch (error) {
    console.warn('⚠️ Error reading user session:', error);
    return { isLoggedIn: false, user: null };
  }
}

/**
 * Clear user session upon Logout
 */
export async function clearUserSession() {
  try {
    await AsyncStorage.multiRemove([
      KEYS.USER_PROFILE,
      KEYS.IS_LOGGED_IN,
      KEYS.AUTH_TOKEN,
    ]);
    console.log('✅ Local user session cleared');
    return true;
  } catch (error) {
    console.warn('⚠️ Error clearing user session:', error);
    return false;
  }
}

/**
 * Save selected language preference
 */
export async function saveAppLanguage(lang) {
  try {
    await AsyncStorage.multiSet([
      [KEYS.APP_LANGUAGE, lang],
      [KEYS.LANGUAGE_CHOSEN, 'true'],
    ]);
    return true;
  } catch (error) {
    console.warn('⚠️ Error saving language:', error);
    return false;
  }
}

/**
 * Get stored language preference and whether user explicitly made a selection
 */
export async function getAppLanguage() {
  try {
    const values = await AsyncStorage.multiGet([KEYS.APP_LANGUAGE, KEYS.LANGUAGE_CHOSEN]);
    const lang = values[0][1];
    const hasChosen = values[1][1] === 'true';
    return {
      language: lang || 'ta',
      hasChosenLanguage: hasChosen,
    };
  } catch (error) {
    console.warn('⚠️ Error reading language preference:', error);
    return { language: 'ta', hasChosenLanguage: false };
  }
}
