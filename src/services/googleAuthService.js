// src/services/googleAuthService.js
import { Alert } from 'react-native';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';

// Web Client ID from google-services.json
export const GOOGLE_WEB_CLIENT_ID = '845484440157-gft36os4qtj1secueh8ihch3dmp214su.apps.googleusercontent.com';

let isConfigured = false;

/**
 * Configure Google Sign In client
 */
export function configureGoogleSignIn() {
  if (isConfigured) return;
  try {
    GoogleSignin.configure({
      webClientId: GOOGLE_WEB_CLIENT_ID,
      scopes: ['profile', 'email'],
      offlineAccess: true,
      forceCodeForRefreshToken: true,
    });
    isConfigured = true;
    console.log('✅ Google Sign-in configured with client ID:', GOOGLE_WEB_CLIENT_ID);
  } catch (err) {
    console.warn('⚠️ GoogleSignin.configure error:', err.message);
  }
}

/**
 * Perform real Original Google Sign In on Android / iOS
 * Returns: { success: boolean, user?: { id, name, email, avatar_url, idToken }, cancelled?: boolean, error?: string }
 */
export async function performGoogleSignIn(language = 'ta') {
  try {
    configureGoogleSignIn();

    // 1. Verify Google Play Services is available
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

    // 2. Launch native Google Sign In dialog
    const response = await GoogleSignin.signIn();

    // 3. Handle user cancellation in response (v13+)
    if (response?.type === 'cancelled') {
      console.log('User cancelled Google sign in dialog');
      return { success: false, cancelled: true };
    }

    // 4. Extract user information
    const data = response?.data || response;
    const userData = data?.user || data;
    const idToken = data?.idToken || response?.idToken;

    if (userData && userData.email) {
      const googleUser = {
        id: userData.id || `google_${Date.now()}`,
        name: userData.name || userData.givenName || 'Google User',
        email: userData.email,
        avatar_url: userData.photo || null,
        idToken: idToken || null,
      };

      console.log('✅ Google Sign In success:', googleUser.name, googleUser.email);
      return { success: true, user: googleUser };
    }

    return {
      success: false,
      error: language === 'ta' ? 'Google கணக்கு விவரங்கள் கிடைக்கவில்லை' : 'No user data received from Google',
    };
  } catch (error) {
    console.warn('Google Sign-in error details:', error);

    if (error.code === statusCodes.SIGN_IN_CANCELLED) {
      console.log('User cancelled Google sign in dialog');
      return { success: false, cancelled: true };
    } else if (error.code === statusCodes.IN_PROGRESS) {
      return { success: false, error: 'Sign in already in progress' };
    } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      Alert.alert(
        language === 'ta' ? 'Google Play சேவைகள் இல்லை' : 'Play Services Not Available',
        language === 'ta'
          ? 'உங்கள் சாதனத்தில் Google Play Services புதுப்பிக்கப்பட வேண்டும்.'
          : 'Google Play Services is not available or outdated.'
      );
      return { success: false, error: 'Play Services not available' };
    } else if (error.code === '10' || error.message?.includes('DEVELOPER_ERROR') || error.message?.includes('10:')) {
      // Developer error - SHA-1 mismatch
      Alert.alert(
        language === 'ta' ? 'Google உள்நுழைவு பிழை (DEVELOPER_ERROR 10)' : 'Google Sign-In Error (10)',
        language === 'ta'
          ? 'Firebase Console-ல் SHA-1 fingerprint சேர்க்கப்பட வேண்டும்.\nDebug SHA-1:\n5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25'
          : 'Firebase Console requires SHA-1 fingerprint for this app.\nDebug SHA-1:\n5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25'
      );
      return { success: false, error: 'DEVELOPER_ERROR (10): SHA-1 not registered in Firebase' };
    }

    Alert.alert(
      language === 'ta' ? 'Google உள்நுழைவு பிழை' : 'Google Sign-In Error',
      error.message || 'Unknown error occurred during Google Sign In'
    );
    return { success: false, error: error.message };
  }
}

/**
 * Sign out from Google account
 */
export async function performGoogleSignOut() {
  try {
    configureGoogleSignIn();
    await GoogleSignin.signOut();
    console.log('Signed out from Google');
  } catch (err) {
    console.warn('Google sign out error:', err.message);
  }
}
