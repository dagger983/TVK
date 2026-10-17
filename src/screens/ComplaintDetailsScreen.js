import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { useLanguage } from '../context/LanguageContext';
import { useApp } from '../context/AppContext';
import Header from '../components/Header';
import MapPreview from '../components/MapPreview';
import { openInGoogleMaps } from '../services/locationService';

export default function ComplaintDetailsScreen() {
  const { language, t } = useLanguage();
  const { selectedComplaintId, getComplaintById, goBack } = useApp();

  const [activePreviewPhoto, setActivePreviewPhoto] = useState(null);

  const complaint = getComplaintById(selectedComplaintId);

  const title = language === 'ta' ? (complaint.titleTa || complaint.titleEn) : complaint.titleEn;
  const description = language === 'ta' ? (complaint.descTa || complaint.descEn) : complaint.descEn;
  const location = language === 'ta' ? (complaint.locationTa || complaint.locationEn) : complaint.locationEn;
  const isResolved = complaint.status === 'resolved';

  const officialUpdate = language === 'ta'
    ? (complaint.officialUpdate?.ta || complaint.officialUpdate?.en)
    : complaint.officialUpdate?.en;

  // Extract all admin proof photos (supporting unlimited admin photos)
  const adminPhotosList = [
    ...(complaint.officialUpdate?.adminPhotos || []),
    ...(complaint.adminUpdates?.flatMap(u => u.admin_photos || []) || []),
  ].filter((v, i, a) => a.indexOf(v) === i); // remove duplicates

  const handleAddInfo = () => {
    Alert.alert(
      language === 'ta' ? 'கூடுதல் தகவல்' : 'Add Information',
      language === 'ta'
        ? 'உங்கள் குறிப்பு அதிகாரிக்கு அனுப்பப்பட்டது.'
        : 'Your additional note has been forwarded to the inspection officer.'
    );
  };

  const handleReopen = () => {
    Alert.alert(
      language === 'ta' ? 'மீண்டும் திறக்க' : 'Reopen Grievance',
      language === 'ta'
        ? 'மறுபரிசீலனை கோரிக்கை சமர்ப்பிக்கப்பட்டது.'
        : 'Reopen request has been submitted for administrative review.'
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <Header
        title={t('complaintDetails')}
        subtitle={`ID: ${complaint.id}`}
        showBack
        onBack={goBack}
      />

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Title and Status Row */}
        <View style={styles.titleSection}>
          <View style={styles.titleRow}>
            <Text style={styles.complaintTitle} numberOfLines={2}>
              {title}
            </Text>
            <View
              style={[
                styles.statusBadge,
                isResolved ? styles.statusBadgeResolved : styles.statusBadgeInProgress,
              ]}
            >
              <Text
                style={[
                  styles.statusBadgeText,
                  isResolved ? styles.statusTextResolved : styles.statusTextInProgress,
                ]}
              >
                {isResolved ? t('resolvedStatus') : t('inProgress')}
              </Text>
            </View>
          </View>

          <Text style={styles.descriptionText}>{description}</Text>
        </View>

        {/* Attached Citizen Media */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeader}>{t('attachedMedia')}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.mediaRow}>
            {(complaint.media || []).map((img, index) => {
              const imageSource = typeof img === 'string' ? { uri: img } : img;
              return (
                <TouchableOpacity
                  key={index}
                  activeOpacity={0.85}
                  onPress={() => setActivePreviewPhoto(imageSource)}
                >
                  <Image source={imageSource} style={styles.mediaThumbnail} resizeMode="cover" />
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Pinned Location with Google Maps Coordinates */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeader}>{t('pinnedLocation')}</Text>
          <MapPreview
            address={location}
            latitude={complaint.latitude}
            longitude={complaint.longitude}
            googleMapsUrl={complaint.googleMapsUrl}
            height={140}
            onMapPress={() => openInGoogleMaps(complaint.latitude, complaint.longitude, complaint.googleMapsUrl)}
          />
        </View>

        {/* Latest Official Admin Update Box */}
        {officialUpdate && (
          <View style={styles.officialUpdateCard}>
            <View style={styles.updateHeaderRow}>
              <Ionicons name="shield-checkmark" size={16} color={COLORS.primary} />
              <Text style={styles.updateBadgeText}>{t('latestOfficialUpdate')}</Text>
            </View>

            <Text style={styles.updateTitle}>{officialUpdate.title}</Text>
            <Text style={styles.updateDesc}>{officialUpdate.desc}</Text>

            {/* Admin Proof / Inspection Photos (Unlimited Photos from Admin) */}
            {adminPhotosList.length > 0 && (
              <View style={styles.adminPhotosSection}>
                <View style={styles.adminPhotosTitleRow}>
                  <Ionicons name="camera" size={13} color={COLORS.primary} />
                  <Text style={styles.adminPhotosLabel}>
                    {language === 'ta'
                      ? `அதிகாரி சமர்ப்பித்த புகைப்படங்கள் (${adminPhotosList.length})`
                      : `Official Inspection Proof Photos (${adminPhotosList.length})`}
                  </Text>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.adminPhotosRow}>
                  {adminPhotosList.map((photoUrl, pIdx) => {
                    const source = typeof photoUrl === 'string' ? { uri: photoUrl } : photoUrl;
                    return (
                      <TouchableOpacity
                        key={pIdx}
                        activeOpacity={0.8}
                        onPress={() => setActivePreviewPhoto(source)}
                        style={styles.adminPhotoWrapper}
                      >
                        <Image source={source} style={styles.adminPhotoThumb} resizeMode="cover" />
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            )}
          </View>
        )}

        {/* Action Buttons Row */}
        <View style={styles.actionButtonsRow}>
          <TouchableOpacity
            style={styles.actionBtnOutline}
            activeOpacity={0.7}
            onPress={handleAddInfo}
          >
            <Ionicons name="create-outline" size={16} color="#374151" style={styles.btnIcon} />
            <Text style={styles.actionBtnOutlineText}>{t('addInfo')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtnOutline}
            activeOpacity={0.7}
            onPress={handleReopen}
          >
            <Ionicons name="refresh-outline" size={16} color="#374151" style={styles.btnIcon} />
            <Text style={styles.actionBtnOutlineText}>{t('reopen')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Photo Fullscreen Viewer Modal */}
      <Modal visible={!!activePreviewPhoto} transparent animationType="fade">
        <TouchableOpacity
          style={styles.fullscreenModal}
          activeOpacity={1}
          onPress={() => setActivePreviewPhoto(null)}
        >
          <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setActivePreviewPhoto(null)}>
            <Ionicons name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          {activePreviewPhoto && (
            <Image
              source={activePreviewPhoto}
              style={styles.fullscreenImage}
              resizeMode="contain"
            />
          )}
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
  },
  titleSection: {
    marginBottom: 20,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
    gap: 12,
  },
  complaintTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    lineHeight: 24,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeInProgress: {
    backgroundColor: '#FFF7ED',
  },
  statusBadgeResolved: {
    backgroundColor: '#ECFDF5',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  statusTextInProgress: {
    color: '#EA580C',
  },
  statusTextResolved: {
    color: '#059669',
  },
  descriptionText: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 19,
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 10,
  },
  mediaRow: {
    flexDirection: 'row',
    gap: 12,
  },
  mediaThumbnail: {
    width: 84,
    height: 84,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  officialUpdateCard: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 14,
    padding: 16,
    marginBottom: 24,
  },
  updateHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  updateBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 1,
    marginLeft: 6,
  },
  updateTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  updateDesc: {
    fontSize: 12,
    color: '#4B5563',
    lineHeight: 17,
  },
  adminPhotosSection: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#FEE2E2',
  },
  adminPhotosTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  adminPhotosLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  adminPhotosRow: {
    flexDirection: 'row',
    gap: 10,
  },
  adminPhotoWrapper: {
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  adminPhotoThumb: {
    width: 76,
    height: 76,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtnOutline: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingVertical: 12,
    borderRadius: 12,
  },
  btnIcon: {
    marginRight: 6,
  },
  actionBtnOutlineText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  fullscreenModal: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseBtn: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 10,
  },
  fullscreenImage: {
    width: '90%',
    height: '75%',
  },
});
