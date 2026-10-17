import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { useLanguage } from '../context/LanguageContext';
import { useApp } from '../context/AppContext';

export default function PhoneVerificationScreen() {
  const { t, language } = useLanguage();
  const { navigateTo, goBack, pendingGoogleUser, completeAuthWithPhone, userProfile } = useApp();

  const [mobileNumber, setMobileNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const activeUser = pendingGoogleUser || userProfile;

  const handleVerify = async () => {
    const cleanNumber = mobileNumber.replace(/\D/g, '');
    if (!cleanNumber || cleanNumber.length < 10) {
      Alert.alert(
        language === 'ta' ? 'அலைபேசி எண் பிழை' : 'Invalid Mobile Number',
        language === 'ta'
          ? 'தயவுசெய்து 10 இலக்க அலைபேசி எண்ணை உள்ளிடவும்.'
          : 'Please enter a valid 10-digit mobile number.'
      );
      return;
    }

    try {
      setLoading(true);
      await completeAuthWithPhone(cleanNumber);
    } catch (e) {
      console.warn('Auth phone verify error:', e);
      navigateTo('main', { tab: 'home' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
          {/* Header */}
          <TouchableOpacity style={styles.backButton} onPress={goBack} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>

          <View style={styles.content}>
            <Text style={styles.title}>
              {language === 'ta' ? 'அலைபேசி எண்ணை உள்ளிடவும்' : 'Enter Your Mobile Number'}
            </Text>
            <Text style={styles.subtitle}>
              {language === 'ta'
                ? 'கூகுள் கணக்கு இணைக்கப்பட்டது! SMS மற்றும் புகார் நிலவரங்களை அறிய உங்கள் அலைபேசி எண்ணை உள்ளிடவும்.'
                : 'Google account connected! Please enter your mobile number to receive complaint SMS notifications.'}
            </Text>

            {/* Google Account Card */}
            {activeUser && (
              <View style={styles.googleAccountCard}>
                <Image
                  source={{ uri: activeUser.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80' }}
                  style={styles.googleAvatar}
                />
                <View style={styles.googleInfoCol}>
                  <View style={styles.googleBadgeRow}>
                    <Ionicons name="logo-google" size={13} color="#EA4335" />
                    <Text style={styles.googleBadgeText}>Google Account Verified</Text>
                    <Ionicons name="checkmark-circle" size={13} color="#10B981" style={{ marginLeft: 4 }} />
                  </View>
                  <Text style={styles.googleNameText}>{activeUser.name || 'Citizen'}</Text>
                  <Text style={styles.googleEmailText}>{activeUser.email || 'user@gmail.com'}</Text>
                </View>
              </View>
            )}

            {/* Mobile Number Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('mobileNumber')}</Text>
              <View style={styles.phoneInputRow}>
                <View style={styles.countryCodeBox}>
                  <Text style={styles.countryCodeText}>+91</Text>
                  <Ionicons name="chevron-down" size={14} color="#6B7280" />
                </View>
                <TextInput
                  style={styles.phoneInput}
                  value={mobileNumber}
                  onChangeText={setMobileNumber}
                  placeholder={t('enter10Digit')}
                  placeholderTextColor="#9CA3AF"
                  keyboardType="phone-pad"
                  maxLength={10}
                />
              </View>
            </View>

            {/* Helper note */}
            <View style={styles.infoRow}>
              <Ionicons name="information-circle-outline" size={16} color="#6B7280" />
              <Text style={styles.infoText}>
                {language === 'ta'
                  ? 'இந்த எண் உங்கள் கூகுள் சுயவிவரத்துடன் இணைக்கப்பட்டு சேமிக்கப்படும்.'
                  : 'This phone number will be stored with your Google profile in the database.'}
              </Text>
            </View>
          </View>

          {/* Action Button: Save & Go to Home */}
          <View style={styles.bottomContainer}>
            <TouchableOpacity
              style={[styles.verifyButton, loading && { opacity: 0.85 }]}
              activeOpacity={0.8}
              onPress={handleVerify}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.verifyButtonText}>
                  {language === 'ta' ? 'பதிவு செய்து தொடரவும் →' : 'Complete & Continue to Home →'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'android' ? 30 : 10,
    paddingBottom: 24,
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 20,
    lineHeight: 19,
  },
  googleAccountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 22,
  },
  googleAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    backgroundColor: '#E5E7EB',
  },
  googleInfoCol: {
    flex: 1,
  },
  googleBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  googleBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#4B5563',
    marginLeft: 4,
    letterSpacing: 0.3,
  },
  googleNameText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
  },
  googleEmailText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 1,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  phoneInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countryCodeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginRight: 10,
  },
  countryCodeText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginRight: 4,
  },
  phoneInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1F2937',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    paddingHorizontal: 2,
  },
  infoText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 6,
    lineHeight: 16,
    flex: 1,
  },
  bottomContainer: {
    width: '100%',
    paddingTop: 20,
  },
  verifyButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 3,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  verifyButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
