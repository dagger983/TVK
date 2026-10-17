import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  StyleSheet,
  Alert,
  Platform,
  Image,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { useLanguage } from '../context/LanguageContext';
import { useApp } from '../context/AppContext';
import SupportModal from '../components/SupportModal';
import { TVK_HELPLINE_NUMBERS, makePhoneCall, openWhatsAppChat } from '../constants/contactInfo';

export default function ProfileScreen() {
  const { language, setLanguage, t } = useLanguage();
  const {
    userProfile,
    updateUserProfile,
    logoutUser,
    pushNotificationsEnabled,
    setPushNotificationsEnabled,
  } = useApp();

  // Support & Helpline Modal State
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);

  // Edit Profile Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState(userProfile.name);
  const [editPhone, setEditPhone] = useState(userProfile.phone);
  const [editDistrict, setEditDistrict] = useState(userProfile.district || 'Chennai');
  const [editWard, setEditWard] = useState(userProfile.ward || 'Ward 4, Anna Nagar');
  const [isSaving, setIsSaving] = useState(false);

  const handleOpenEdit = () => {
    setEditName(userProfile.name);
    setEditPhone(userProfile.phone);
    setEditDistrict(userProfile.district || 'Chennai');
    setEditWard(userProfile.ward || 'Ward 4, Anna Nagar');
    setIsEditModalOpen(true);
  };

  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      Alert.alert(language === 'ta' ? 'பிழை' : 'Error', language === 'ta' ? 'பெயரை உள்ளிடவும்' : 'Please enter your name');
      return;
    }
    setIsSaving(true);
    try {
      await updateUserProfile({
        name: editName.trim(),
        phone: editPhone.trim(),
        district: editDistrict.trim(),
        ward: editWard.trim(),
        initials: editName
          .trim()
          .split(' ')
          .map(n => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2),
      });
      setIsEditModalOpen(false);
      Alert.alert(
        language === 'ta' ? 'வெற்றி' : 'Success',
        language === 'ta'
          ? 'சுயவிவரம் உள்ளூர் நினைவகத்தில் (Local Storage) சேமிக்கப்பட்டது!'
          : 'Profile successfully updated and saved in local storage!'
      );
    } catch (e) {
      console.warn('Save profile error:', e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      t('logout'),
      language === 'ta'
        ? 'நிச்சயமாக வெளியேற விரும்புகிறீர்களா? உள்ளூர் சேமிப்பகம் அழிக்கப்படும்.'
        : 'Are you sure you want to log out? Local session data will be cleared.',
      [
        {
          text: language === 'ta' ? 'ரத்து' : 'Cancel',
          style: 'cancel',
        },
        {
          text: t('logout'),
          style: 'destructive',
          onPress: async () => {
            await logoutUser();
          },
        },
      ]
    );
  };

  const handleMenuPress = (menuKey) => {
    if (menuKey === 'contactSupport') {
      setIsSupportModalOpen(true);
      return;
    }
    Alert.alert(
      t(menuKey),
      language === 'ta'
        ? `${t(menuKey)} பக்கம் விரைவில் வரும்.`
        : `${t(menuKey)} details will be displayed here.`
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Page Title */}
        <View style={styles.headerTitleRow}>
          <Text style={styles.pageTitle}>{t('myProfile')}</Text>
          <TouchableOpacity
            style={styles.editHeaderBtn}
            onPress={handleOpenEdit}
            activeOpacity={0.7}
          >
            <Ionicons name="create-outline" size={15} color={COLORS.primary} />
            <Text style={styles.editHeaderBtnText}>
              {language === 'ta' ? 'திருத்து' : 'Edit'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* User Info Card with Local Storage Data */}
        <View style={styles.userCard}>
          <View style={styles.userTopRow}>
            {userProfile.avatar_url ? (
              <Image source={{ uri: userProfile.avatar_url }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarInitials}>{userProfile.initials || 'TVK'}</Text>
              </View>
            )}

            <View style={styles.userInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.userName}>{userProfile.name}</Text>
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark-circle" size={13} color="#10B981" />
                  <Text style={styles.verifiedBadgeText}>
                    {language === 'ta' ? 'அங்கீகரிக்கப்பட்டது' : 'Verified'}
                  </Text>
                </View>
              </View>
              <Text style={styles.userPhone}>{userProfile.phone || '+91 98765 43210'}</Text>
              {userProfile.email ? (
                <Text style={styles.userEmail}>{userProfile.email}</Text>
              ) : null}
            </View>
          </View>

          {/* District & Ward details row */}
          <View style={styles.userMetaContainer}>
            <View style={styles.metaItem}>
              <Ionicons name="business-outline" size={14} color="#6B7280" />
              <Text style={styles.metaLabel}>
                {language === 'ta' ? 'மாவட்டம்:' : 'District:'}
              </Text>
              <Text style={styles.metaValue}>{userProfile.district || 'Chennai'}</Text>
            </View>

            <View style={styles.metaDivider} />

            <View style={styles.metaItem}>
              <Ionicons name="location-outline" size={14} color="#6B7280" />
              <Text style={styles.metaLabel}>
                {language === 'ta' ? 'வார்டு / பகுதி:' : 'Ward:'}
              </Text>
              <Text style={styles.metaValue}>{userProfile.ward || 'Ward 4, Anna Nagar'}</Text>
            </View>
          </View>
        </View>

        {/* Settings Group */}
        <View style={styles.settingsCard}>
          {/* App Language Row */}
          <View style={styles.settingRow}>
            <View style={styles.settingLabelRow}>
              <Ionicons name="globe-outline" size={20} color="#4B5563" style={styles.settingIcon} />
              <Text style={styles.settingLabel}>{t('appLanguage')}</Text>
            </View>

            {/* Language Toggle Pill: [ தமிழ் | ENG ] */}
            <View style={styles.langPillContainer}>
              <TouchableOpacity
                style={[
                  styles.langPillOption,
                  language === 'ta' && styles.langPillOptionActive,
                ]}
                activeOpacity={0.8}
                onPress={() => setLanguage('ta')}
              >
                <Text
                  style={[
                    styles.langPillText,
                    language === 'ta' && styles.langPillTextActive,
                  ]}
                >
                  {t('langTamil')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.langPillOption,
                  language === 'en' && styles.langPillOptionActive,
                ]}
                activeOpacity={0.8}
                onPress={() => setLanguage('en')}
              >
                <Text
                  style={[
                    styles.langPillText,
                    language === 'en' && styles.langPillTextActive,
                  ]}
                >
                  {t('langEnglish')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Push Notifications Toggle */}
          <View style={styles.settingRow}>
            <View style={styles.settingLabelRow}>
              <Ionicons name="notifications-outline" size={20} color="#4B5563" style={styles.settingIcon} />
              <Text style={styles.settingLabel}>{t('pushNotifications')}</Text>
            </View>
            <Switch
              value={pushNotificationsEnabled}
              onValueChange={setPushNotificationsEnabled}
              trackColor={{ false: '#D1D5DB', true: COLORS.primaryLight }}
              thumbColor={pushNotificationsEnabled ? COLORS.primary : '#F3F4F6'}
            />
          </View>
        </View>

        {/* Navigation Menu Links */}
        <View style={styles.menuCard}>
          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={() => handleMenuPress('helpFaq')}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name="help-circle-outline" size={20} color="#4B5563" style={styles.menuIcon} />
              <Text style={styles.menuItemText}>{t('helpFaq')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={() => handleMenuPress('contactSupport')}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name="call-outline" size={20} color="#4B5563" style={styles.menuIcon} />
              <Text style={styles.menuItemText}>{t('contactSupport')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={() => handleMenuPress('privacyPolicy')}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name="shield-checkmark-outline" size={20} color="#4B5563" style={styles.menuIcon} />
              <Text style={styles.menuItemText}>{t('privacyPolicy')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* TVK Citizen Helpline Numbers Card */}
        <View style={styles.helplineCard}>
          <View style={styles.helplineHeader}>
            <View style={styles.helplineIconCircle}>
              <Ionicons name="call" size={18} color={COLORS.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.helplineCardTitle}>
                {language === 'ta' ? 'த.வெ.க மக்கள் உதவி எண்கள்' : 'TVK Citizen Helpline Numbers'}
              </Text>
              <Text style={styles.helplineCardSubtitle}>
                {language === 'ta' ? '24/7 நேரடி அழைப்பு & வாட்ஸ்அப் உதவி' : '24/7 Direct Call & WhatsApp Support'}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.viewHelplineBtn}
              onPress={() => setIsSupportModalOpen(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.viewHelplineBtnText}>
                {language === 'ta' ? 'அனைத்தும்' : 'View'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.helplineItemsList}>
            {TVK_HELPLINE_NUMBERS.map((item) => (
              <View key={item.id} style={styles.helplineItemRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.helplineItemLabel}>
                    {language === 'ta' ? item.labelTa : item.labelEn}
                  </Text>
                  <Text style={styles.helplineItemNumber}>{item.number}</Text>
                </View>

                <View style={styles.helplineActionBtns}>
                  <TouchableOpacity
                    style={styles.helplineCallBtn}
                    onPress={() => makePhoneCall(item.number)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="call" size={13} color="#FFFFFF" />
                    <Text style={styles.helplineBtnText}>
                      {language === 'ta' ? 'அழைக்க' : 'Call'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.helplineWaBtn}
                    onPress={() => openWhatsAppChat(item.cleanNumber)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="logo-whatsapp" size={14} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          activeOpacity={0.8}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={18} color={COLORS.primary} style={styles.logoutIcon} />
          <Text style={styles.logoutText}>{t('logout')}</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Support & Helpline Modal */}
      <SupportModal
        visible={isSupportModalOpen}
        onClose={() => setIsSupportModalOpen(false)}
      />

      {/* Edit Profile Modal */}
      <Modal visible={isEditModalOpen} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {language === 'ta' ? 'சுயவிவரத்தைத் திருத்தவும்' : 'Edit Profile'}
              </Text>
              <TouchableOpacity onPress={() => setIsEditModalOpen(false)}>
                <Ionicons name="close" size={22} color="#4B5563" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.editFieldGroup}>
                <Text style={styles.editFieldLabel}>
                  {language === 'ta' ? 'முழு பெயர்' : 'Full Name'}
                </Text>
                <TextInput
                  style={styles.editTextInput}
                  value={editName}
                  onChangeText={setEditName}
                  placeholder="Enter name"
                />
              </View>

              <View style={styles.editFieldGroup}>
                <Text style={styles.editFieldLabel}>
                  {language === 'ta' ? 'அலைபேசி எண்' : 'Mobile Number'}
                </Text>
                <TextInput
                  style={styles.editTextInput}
                  value={editPhone}
                  onChangeText={setEditPhone}
                  placeholder="Enter phone"
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.editFieldGroup}>
                <Text style={styles.editFieldLabel}>
                  {language === 'ta' ? 'மாவட்டம்' : 'District'}
                </Text>
                <TextInput
                  style={styles.editTextInput}
                  value={editDistrict}
                  onChangeText={setEditDistrict}
                  placeholder="Enter district"
                />
              </View>

              <View style={styles.editFieldGroup}>
                <Text style={styles.editFieldLabel}>
                  {language === 'ta' ? 'வார்டு / பகுதி' : 'Ward / Area'}
                </Text>
                <TextInput
                  style={styles.editTextInput}
                  value={editWard}
                  onChangeText={setEditWard}
                  placeholder="Enter ward"
                />
              </View>

              <TouchableOpacity
                style={[styles.saveBtn, isSaving && { opacity: 0.8 }]}
                onPress={handleSaveProfile}
                disabled={isSaving}
                activeOpacity={0.8}
              >
                {isSaving ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.saveBtnText}>
                    {language === 'ta' ? 'சேமிக்கவும்' : 'Save Changes'}
                  </Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 32,
  },
  headerTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
  },
  editHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 4,
  },
  editHeaderBtnText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  userCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 20,
    ...COLORS.cardShadow,
  },
  userTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 14,
    backgroundColor: '#E5E7EB',
  },
  avatarInitials: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  userInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 3,
  },
  userName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111827',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 3,
  },
  verifiedBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
  },
  userPhone: {
    fontSize: 13,
    color: '#4B5563',
    fontWeight: '600',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  userMetaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  metaItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 8,
  },
  metaLabel: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
  },
  metaValue: {
    fontSize: 11,
    color: '#1F2937',
    fontWeight: '700',
    flexShrink: 1,
  },
  settingsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 18,
    ...COLORS.cardShadow,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  settingLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  langPillContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    padding: 3,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  langPillOption: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
  },
  langPillOptionActive: {
    backgroundColor: COLORS.primary,
  },
  langPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
  },
  langPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  menuCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 24,
    ...COLORS.cardShadow,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 15,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    marginRight: 12,
  },
  menuItemText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginHorizontal: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 14,
  },
  logoutIcon: {
    marginRight: 8,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  editFieldGroup: {
    marginBottom: 14,
  },
  editFieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4B5563',
    marginBottom: 6,
  },
  editTextInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1F2937',
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  helplineCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FECACA',
    padding: 16,
    marginBottom: 20,
    ...COLORS.cardShadow,
  },
  helplineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 10,
  },
  helplineIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  helplineCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
  },
  helplineCardSubtitle: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  viewHelplineBtn: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  viewHelplineBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  helplineItemsList: {
    gap: 10,
  },
  helplineItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  helplineItemLabel: {
    fontSize: 11,
    color: '#4B5563',
    fontWeight: '600',
  },
  helplineItemNumber: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '800',
    marginTop: 2,
    letterSpacing: 0.3,
  },
  helplineActionBtns: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  helplineCallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  helplineBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  helplineWaBtn: {
    backgroundColor: '#16A34A',
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
