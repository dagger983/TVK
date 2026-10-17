import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { useLanguage } from '../context/LanguageContext';
import { useApp } from '../context/AppContext';
import { saveUserProfile } from '../services/supabaseService';

export default function UserDetailsScreen() {
  const { language, setLanguage, t } = useLanguage();
  const { navigateTo, goBack, userProfile, setUserProfile } = useApp();

  const [name, setName] = useState(userProfile.name);
  const [district, setDistrict] = useState(userProfile.district);
  const [ward, setWard] = useState(userProfile.ward);

  const handleGetStarted = async () => {
    const updated = {
      ...userProfile,
      name,
      district,
      ward,
    };
    setUserProfile(updated);
    await saveUserProfile(updated);
    navigateTo('main', { tab: 'home' });
  };

  const handleSkip = () => {
    navigateTo('main', { tab: 'home' });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
          {/* Header Row */}
          <View style={styles.headerRow}>
            <TouchableOpacity style={styles.iconButton} onPress={goBack} activeOpacity={0.7}>
              <Ionicons name="arrow-back" size={24} color={COLORS.text} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSkip} activeOpacity={0.7}>
              <Text style={styles.skipText}>{t('skip')}</Text>
            </TouchableOpacity>
          </View>

          {/* Heading */}
          <View style={styles.headerTextWrapper}>
            <Text style={styles.title}>{t('completeProfileTitle')}</Text>
            <Text style={styles.subtitle}>{t('completeProfileSubtitle')}</Text>
          </View>

          {/* Avatar with edit badge */}
          <View style={styles.avatarWrapper}>
            <View style={styles.avatarCircle}>
              <Ionicons name="person" size={44} color="#9CA3AF" />
              <TouchableOpacity style={styles.cameraBadge} activeOpacity={0.8}>
                <Ionicons name="camera" size={14} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Form Fields */}
          <View style={styles.formContainer}>
            {/* Full Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t('fullName')}</Text>
              <View style={styles.inputWithIcon}>
                <Ionicons name="person-outline" size={18} color="#9CA3AF" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  value={name}
                  onChangeText={setName}
                  placeholder={t('enterFullName')}
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            {/* District Dropdown */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t('district')}</Text>
              <View style={styles.dropdownBox}>
                <Text style={styles.dropdownValue}>{district}</Text>
                <Ionicons name="chevron-down" size={18} color="#6B7280" />
              </View>
            </View>

            {/* Ward / Area */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t('wardArea')}</Text>
              <View style={styles.inputWithIcon}>
                <Ionicons name="location-outline" size={18} color="#9CA3AF" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  value={ward}
                  onChangeText={setWard}
                  placeholder={t('enterWardArea')}
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            {/* Preferred Language Selector */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t('preferredLanguage')}</Text>
              <View style={styles.langChoiceContainer}>
                <TouchableOpacity
                  style={[
                    styles.langChoiceBtn,
                    language === 'ta' && styles.langChoiceBtnActive,
                  ]}
                  activeOpacity={0.8}
                  onPress={() => setLanguage('ta')}
                >
                  {language === 'ta' && (
                    <Ionicons name="checkmark" size={16} color={COLORS.primary} style={styles.checkIcon} />
                  )}
                  <Text
                    style={[
                      styles.langChoiceText,
                      language === 'ta' && styles.langChoiceTextActive,
                    ]}
                  >
                    {t('tamilLang')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.langChoiceBtn,
                    language === 'en' && styles.langChoiceBtnActive,
                  ]}
                  activeOpacity={0.8}
                  onPress={() => setLanguage('en')}
                >
                  {language === 'en' && (
                    <Ionicons name="checkmark" size={16} color={COLORS.primary} style={styles.checkIcon} />
                  )}
                  <Text
                    style={[
                      styles.langChoiceText,
                      language === 'en' && styles.langChoiceTextActive,
                    ]}
                  >
                    {t('englishLang')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Action Button */}
          <View style={styles.bottomContainer}>
            <TouchableOpacity
              style={styles.getStartedButton}
              activeOpacity={0.8}
              onPress={handleGetStarted}
            >
              <Text style={styles.getStartedButtonText}>{t('getStarted')}</Text>
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
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconButton: {
    padding: 6,
  },
  skipText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
  headerTextWrapper: {
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  avatarWrapper: {
    alignItems: 'center',
    marginVertical: 12,
  },
  avatarCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  formContainer: {
    marginTop: 10,
  },
  inputGroup: {
    marginBottom: 18,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1F2937',
  },
  dropdownBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  dropdownValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
  },
  langChoiceContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  langChoiceBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  langChoiceBtnActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  checkIcon: {
    marginRight: 6,
  },
  langChoiceText: {
    fontSize: 14,
    color: '#4B5563',
    fontWeight: '500',
  },
  langChoiceTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  bottomContainer: {
    marginTop: 20,
    marginBottom: 10,
  },
  getStartedButton: {
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
  getStartedButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
