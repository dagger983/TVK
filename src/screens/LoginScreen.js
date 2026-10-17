import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { useLanguage } from '../context/LanguageContext';
import { useApp } from '../context/AppContext';
import { performGoogleSignIn } from '../services/googleAuthService';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const { language, setLanguage, t } = useLanguage();
  const { handleGoogleLogin } = useApp();
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    try {
      const result = await performGoogleSignIn(language);
      if (result.success && result.user) {
        handleGoogleLogin(result.user);
      }
    } catch (e) {
      console.warn('Google sign-in error:', e);
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      {/* Top Bar with Language Toggle */}
      <View style={styles.topBar}>
        <View style={styles.langContainer}>
          <TouchableOpacity
            style={[styles.langBtn, language === 'ta' && styles.langBtnActive]}
            onPress={() => setLanguage('ta')}
          >
            <Text style={[styles.langBtnText, language === 'ta' && styles.langBtnTextActive]}>
              தமிழ்
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.langBtn, language === 'en' && styles.langBtnActive]}
            onPress={() => setLanguage('en')}
          >
            <Text style={[styles.langBtnText, language === 'en' && styles.langBtnTextActive]}>
              ENG
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.container}>
        {/* Leadership Image */}
        <View style={styles.imageContainer}>
          <Image
            source={require('../../assets/tvk-logo.png')}
            style={styles.leaderImage}
            resizeMode="contain"
          />
        </View>

        {/* Headings */}
        <View style={styles.textContainer}>
          <Text style={styles.brandTitleEnglish}>MANAVAI TVK (V)</Text>
          <Text style={styles.brandTitleTamil}>மணவை TVK (V)</Text>

          <Text style={styles.welcomeText}>{t('welcomeTitle')}</Text>
          <Text style={styles.descriptionText}>{t('welcomeSubtitle')}</Text>
        </View>

        {/* Action: Google Login First */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={styles.googleButtonPrimary}
            activeOpacity={0.85}
            onPress={handleGoogleSignIn}
            disabled={isSigningIn}
          >
            {isSigningIn ? (
              <ActivityIndicator size="small" color="#1F2937" style={styles.googleIcon} />
            ) : (
              <View style={styles.googleIconBox}>
                <Ionicons name="logo-google" size={20} color="#EA4335" />
              </View>
            )}
            <Text style={styles.googleButtonTextPrimary}>
              {isSigningIn
                ? (language === 'ta' ? 'கூகுள் இணைக்கப்படுகிறது...' : 'Connecting to Google...')
                : t('signInGoogle')}
            </Text>
          </TouchableOpacity>

          <View style={styles.secureBadgeRow}>
            <Ionicons name="shield-checkmark" size={14} color="#10B981" />
            <Text style={styles.secureBadgeText}>
              {language === 'ta'
                ? 'கூகுள் மூலம் பாதுகாப்பான உள்நுழைவு'
                : 'Fast & Secure Google Login'}
            </Text>
          </View>
        </View>

        {/* Terms Footer */}
        <View style={styles.footerContainer}>
          <Text style={styles.termsText}>{t('termsAgreement')}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topBar: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 30 : 10,
    alignItems: 'flex-end',
  },
  langContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    padding: 3,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  langBtn: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
  },
  langBtnActive: {
    backgroundColor: COLORS.primary,
  },
  langBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  langBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingBottom: 24,
  },
  imageContainer: {
    width: '100%',
    height: height * 0.35,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  leaderImage: {
    width: '100%',
    height: '100%',
  },
  textContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  brandTitleEnglish: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 2,
    marginBottom: 4,
  },
  brandTitleTamil: {
    fontSize: 26,
    fontWeight: '900',
    color: '#111827',
    marginBottom: 10,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 6,
    textAlign: 'center',
  },
  descriptionText: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 19,
    paddingHorizontal: 16,
  },
  actionContainer: {
    width: '100%',
    marginTop: 10,
  },
  googleButtonPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    paddingVertical: 14,
    borderRadius: 14,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  googleIconBox: {
    marginRight: 10,
  },
  googleIcon: {
    marginRight: 10,
  },
  googleButtonTextPrimary: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
  },
  secureBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 4,
  },
  secureBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#059669',
  },
  footerContainer: {
    alignItems: 'center',
    marginTop: 10,
    paddingHorizontal: 10,
  },
  termsText: {
    fontSize: 11,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 16,
  },
});
