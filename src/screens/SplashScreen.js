// src/screens/SplashScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { useLanguage } from '../context/LanguageContext';
import { useApp } from '../context/AppContext';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  const { language, setLanguage, chooseLanguage, hasChosenLanguage, isLanguageLoaded, t } = useLanguage();
  const { navigateTo, isAuthenticated } = useApp();

  const [isLangModalOpen, setIsLangModalOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState(language || 'ta');

  // When language loads from storage, if user hasn't explicitly chosen language yet, prompt them!
  useEffect(() => {
    if (isLanguageLoaded && !hasChosenLanguage) {
      setIsLangModalOpen(true);
    }
  }, [isLanguageLoaded, hasChosenLanguage]);

  const handleContinue = () => {
    if (!hasChosenLanguage) {
      setIsLangModalOpen(true);
      return;
    }
    if (isAuthenticated) {
      navigateTo('main', { tab: 'home' });
    } else {
      navigateTo('login');
    }
  };

  const handleConfirmLanguage = () => {
    chooseLanguage(selectedLang);
    setIsLangModalOpen(false);
    if (isAuthenticated) {
      navigateTo('main', { tab: 'home' });
    } else {
      navigateTo('login');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      {/* Language Quick Toggle in top right */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.langPillContainer}
          activeOpacity={0.8}
          onPress={() => setIsLangModalOpen(true)}
        >
          <Ionicons name="globe-outline" size={14} color={COLORS.primary} style={{ marginRight: 4 }} />
          <View style={[styles.langPill, language === 'ta' && styles.langPillActive]}>
            <Text style={[styles.langText, language === 'ta' && styles.langTextActive]}>தமிழ்</Text>
          </View>
          <View style={[styles.langPill, language === 'en' && styles.langPillActive]}>
            <Text style={[styles.langText, language === 'en' && styles.langTextActive]}>ENG</Text>
          </View>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.content}
        activeOpacity={0.95}
        onPress={handleContinue}
      >
        {/* Leaders Header Image */}
        <View style={styles.imageWrapper}>
          <Image
            source={require('../../assets/tvk-logo.png')}
            style={styles.leaderImage}
            resizeMode="contain"
          />
        </View>

        {/* Branding Typography */}
        <View style={styles.brandContainer}>
          <Text style={styles.brandEnglish}>MANAVAI TVK (V)</Text>
          <Text style={styles.brandSubEnglish}>
            {language === 'ta' ? 'பொது குறைதீர்ப்பு & புகார் கண்காணிப்பு' : 'Public Grievance & Complaint Tracking'}
          </Text>

          <Text style={styles.brandTamilText}>மக்கள் குரல்</Text>

          <View style={styles.dividerContainer}>
            <View style={styles.redBar} />
            <Text style={styles.govtText}>
              {language === 'ta' ? 'தமிழ்நாடு அரசு' : 'GOVERNMENT OF TAMIL NADU'}
            </Text>
          </View>
        </View>

        {/* Tap to continue CTA */}
        <View style={styles.bottomCta}>
          <TouchableOpacity
            style={styles.startButton}
            activeOpacity={0.85}
            onPress={handleContinue}
          >
            <Text style={styles.startButtonText}>
              {language === 'ta' ? 'தொடங்க இங்கே தொடவும் →' : 'Tap to Get Started →'}
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>

      {/* Language Selection Modal on App Entry */}
      <Modal visible={isLangModalOpen} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.langModalCard}>
            <View style={styles.modalTopBadge}>
              <Ionicons name="language" size={18} color={COLORS.primary} />
            </View>

            <Text style={styles.langModalTitle}>
              {selectedLang === 'ta' ? 'மொழியைத் தேர்ந்தெடுக்கவும்' : 'Choose Your Language'}
            </Text>
            <Text style={styles.langModalSubtitle}>
              {selectedLang === 'ta'
                ? 'தொடர உங்கள் விருப்பமான மொழியைத் தேர்ந்தெடுக்கவும்'
                : 'Select your preferred language to proceed'}
            </Text>

            {/* Language Choice 1: Tamil */}
            <TouchableOpacity
              style={[
                styles.langOptionCard,
                selectedLang === 'ta' && styles.langOptionCardSelected,
              ]}
              activeOpacity={0.8}
              onPress={() => setSelectedLang('ta')}
            >
              <View style={styles.langOptionLeft}>
                <View style={[styles.langFlagCircle, selectedLang === 'ta' && styles.langFlagCircleSelected]}>
                  <Text style={styles.langFlagEmoji}>🚩</Text>
                </View>
                <View>
                  <Text style={[styles.langOptionTitle, selectedLang === 'ta' && styles.langOptionTitleSelected]}>
                    தமிழ் (Tamil)
                  </Text>
                  <Text style={styles.langOptionDesc}>தமிழ்நாடு மக்கள் குறைதீர்ப்பு</Text>
                </View>
              </View>

              <View style={[styles.radioCircle, selectedLang === 'ta' && styles.radioCircleSelected]}>
                {selectedLang === 'ta' && <View style={styles.radioInnerDot} />}
              </View>
            </TouchableOpacity>

            {/* Language Choice 2: English */}
            <TouchableOpacity
              style={[
                styles.langOptionCard,
                selectedLang === 'en' && styles.langOptionCardSelected,
              ]}
              activeOpacity={0.8}
              onPress={() => setSelectedLang('en')}
            >
              <View style={styles.langOptionLeft}>
                <View style={[styles.langFlagCircle, selectedLang === 'en' && styles.langFlagCircleSelected]}>
                  <Text style={styles.langFlagEmoji}>🌐</Text>
                </View>
                <View>
                  <Text style={[styles.langOptionTitle, selectedLang === 'en' && styles.langOptionTitleSelected]}>
                    English
                  </Text>
                  <Text style={styles.langOptionDesc}>Public Grievance & Tracking</Text>
                </View>
              </View>

              <View style={[styles.radioCircle, selectedLang === 'en' && styles.radioCircleSelected]}>
                {selectedLang === 'en' && <View style={styles.radioInnerDot} />}
              </View>
            </TouchableOpacity>

            {/* Confirm CTA */}
            <TouchableOpacity
              style={styles.langConfirmButton}
              activeOpacity={0.85}
              onPress={handleConfirmLanguage}
            >
              <Text style={styles.langConfirmButtonText}>
                {selectedLang === 'ta' ? 'தொடரவும் →' : 'Continue →'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    paddingTop: 10,
    alignItems: 'flex-end',
  },
  langPillContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  langPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
  },
  langPillActive: {
    backgroundColor: COLORS.primary,
  },
  langText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  langTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
    paddingHorizontal: 24,
  },
  imageWrapper: {
    width: width * 0.88,
    height: height * 0.44,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  leaderImage: {
    width: '100%',
    height: '100%',
  },
  brandContainer: {
    alignItems: 'center',
    width: '100%',
  },
  brandEnglish: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 1.5,
    textAlign: 'center',
    marginBottom: 4,
  },
  brandSubEnglish: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
    letterSpacing: 0.5,
    textAlign: 'center',
    marginBottom: 12,
  },
  brandTamilText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  dividerContainer: {
    alignItems: 'center',
    marginTop: 4,
  },
  redBar: {
    width: 48,
    height: 3,
    backgroundColor: COLORS.primary,
    borderRadius: 2,
    marginBottom: 10,
  },
  govtText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  bottomCta: {
    width: '100%',
    paddingBottom: 20,
  },
  startButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
    elevation: 3,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  langModalCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 24,
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  modalTopBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  langModalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 6,
    textAlign: 'center',
  },
  langModalSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 18,
  },
  langOptionCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  langOptionCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#FEF2F2',
  },
  langOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  langFlagCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  langFlagCircleSelected: {
    borderColor: '#FCA5A5',
  },
  langFlagEmoji: {
    fontSize: 18,
  },
  langOptionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
  },
  langOptionTitleSelected: {
    color: COLORS.primary,
  },
  langOptionDesc: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleSelected: {
    borderColor: COLORS.primary,
  },
  radioInnerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
  },
  langConfirmButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
    marginTop: 10,
    elevation: 3,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  langConfirmButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
