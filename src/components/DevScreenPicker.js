import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { useLanguage } from '../context/LanguageContext';
import { useApp } from '../context/AppContext';

export default function DevScreenPicker() {
  const [modalVisible, setModalVisible] = useState(false);
  const { language, setLanguage } = useLanguage();
  const { currentScreen, activeTab, navigateTo, setCurrentScreen, switchTab } = useApp();

  const screens = [
    { key: 'splash', label: '1. Splash Screen', action: () => setCurrentScreen('splash') },
    { key: 'login', label: '2. Login Screen', action: () => setCurrentScreen('login') },
    { key: 'phone-verification', label: '3. Phone Verification', action: () => setCurrentScreen('phone-verification') },
    { key: 'user-details', label: '4. User Details (Profile Setup)', action: () => setCurrentScreen('user-details') },
    { key: 'home', label: '5. Home Dashboard', action: () => { setCurrentScreen('main'); switchTab('home'); } },
    { key: 'submit-complaint', label: '6. Submit Complaint (New)', action: () => setCurrentScreen('submit-complaint') },
    { key: 'confirmation', label: '7. Confirmation Screen', action: () => setCurrentScreen('confirmation') },
    { key: 'track', label: '8. Track Grievance (Timeline)', action: () => { setCurrentScreen('main'); switchTab('track'); } },
    { key: 'complaints', label: '9. My Grievances (List)', action: () => { setCurrentScreen('main'); switchTab('complaints'); } },
    { key: 'complaint-details', label: '10. Complaint Details', action: () => setCurrentScreen('complaint-details') },
    { key: 'notifications', label: '11. Notifications', action: () => setCurrentScreen('notifications') },
    { key: 'profile', label: '12. Profile & Settings (Language)', action: () => { setCurrentScreen('main'); switchTab('profile'); } },
  ];

  const [hidden, setHidden] = useState(false);

  // Strictly dev only - will never show in production builds
  if (!__DEV__ || hidden) {
    return null;
  }

  return (
    <>
      {/* Discreet floating pill at the bottom edge */}
      <View style={styles.floatingContainer} pointerEvents="box-none">
        <TouchableOpacity
          style={styles.floatingPill}
          activeOpacity={0.8}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="layers" size={13} color="#FFFFFF" />
          <Text style={styles.floatingText}>Screens</Text>
          <View style={styles.langBadge}>
            <Text style={styles.langBadgeText}>{language === 'ta' ? 'தமிழ்' : 'EN'}</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.floatingCloseBtn}
          onPress={() => setHidden(true)}
          activeOpacity={0.7}
        >
          <Ionicons name="close" size={11} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      {/* Screen Selector Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>MANAVAI TVK (V) (12 Screens)</Text>
                <Text style={styles.modalSub}>Direct Preview & Test Switcher</Text>
              </View>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                <Ionicons name="close" size={20} color="#111827" />
              </TouchableOpacity>
            </View>

            {/* Quick Language Toggle Bar */}
            <View style={styles.langBar}>
              <Text style={styles.langBarLabel}>Language / மொழி:</Text>
              <View style={styles.langPills}>
                <TouchableOpacity
                  style={[styles.langChoice, language === 'ta' && styles.langChoiceActive]}
                  onPress={() => setLanguage('ta')}
                >
                  <Text style={[styles.langChoiceText, language === 'ta' && styles.langChoiceTextActive]}>
                    தமிழ் (Tamil)
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.langChoice, language === 'en' && styles.langChoiceActive]}
                  onPress={() => setLanguage('en')}
                >
                  <Text style={[styles.langChoiceText, language === 'en' && styles.langChoiceTextActive]}>
                    English
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Screen List */}
            <ScrollView style={styles.scrollList} showsVerticalScrollIndicator={false}>
              {screens.map((item, idx) => {
                const isCurrent =
                  currentScreen === item.key ||
                  (currentScreen === 'main' && activeTab === item.key);

                return (
                  <TouchableOpacity
                    key={item.key}
                    style={[styles.screenItem, isCurrent && styles.screenItemActive]}
                    activeOpacity={0.7}
                    onPress={() => {
                      item.action();
                      setModalVisible(false);
                    }}
                  >
                    <View style={styles.screenItemLeft}>
                      <View style={[styles.indexCircle, isCurrent && styles.indexCircleActive]}>
                        <Text style={[styles.indexText, isCurrent && styles.indexTextActive]}>
                          {idx + 1}
                        </Text>
                      </View>
                      <Text style={[styles.screenLabel, isCurrent && styles.screenLabelActive]}>
                        {item.label}
                      </Text>
                    </View>
                    {isCurrent ? (
                      <Ionicons name="checkmark-circle" size={18} color={COLORS.primary} />
                    ) : (
                      <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  floatingContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 90 : 72,
    right: 14,
    zIndex: 999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  floatingCloseBtn: {
    backgroundColor: '#374151',
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 6,
    opacity: 0.9,
  },
  floatingText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 5,
    marginRight: 6,
  },
  langBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 8,
  },
  langBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 30,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  modalSub: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 1,
  },
  closeBtn: {
    padding: 6,
  },
  langBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 8,
    marginBottom: 14,
  },
  langBarLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 4,
  },
  langPills: {
    flexDirection: 'row',
    gap: 6,
  },
  langChoice: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  langChoiceActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  langChoiceText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4B5563',
  },
  langChoiceTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  scrollList: {
    maxHeight: 380,
  },
  screenItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 11,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginBottom: 4,
  },
  screenItemActive: {
    backgroundColor: '#FEF2F2',
  },
  screenItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  indexCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  indexCircleActive: {
    backgroundColor: COLORS.primary,
  },
  indexText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#4B5563',
  },
  indexTextActive: {
    color: '#FFFFFF',
  },
  screenLabel: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
  },
  screenLabelActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
});
