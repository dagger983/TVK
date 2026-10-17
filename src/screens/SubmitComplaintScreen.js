import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Modal,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { CATEGORIES } from '../data/mockData';
import { useLanguage } from '../context/LanguageContext';
import { useApp } from '../context/AppContext';
import Header from '../components/Header';
import SwiggyMapPinModal from '../components/SwiggyMapPinModal';
import { fetchCurrentGpsLocation, openInGoogleMaps, reverseGeocodeCoords } from '../services/locationService';
import { pickImageFromGallery, capturePhotoFromCamera, uploadImageToFirebaseStorage } from '../services/storageService';
import { makePhoneCall } from '../constants/contactInfo';

export default function SubmitComplaintScreen() {
  const { language, t } = useLanguage();
  const { navigateTo, goBack, addNewComplaint } = useApp();

  const [selectedCategory, setSelectedCategory] = useState('streetLights');
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showPhotoSourceModal, setShowPhotoSourceModal] = useState(false);
  const [showSwiggyMapModal, setShowSwiggyMapModal] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [landmark, setLandmark] = useState('');

  // GPS and Maps data (Saved to DB behind the scenes, NO raw URL shown to user)
  const [latitude, setLatitude] = useState(13.0850);
  const [longitude, setLongitude] = useState(80.2101);
  const [googleMapsUrl, setGoogleMapsUrl] = useState('https://www.google.com/maps?q=13.0850,80.2101');
  const [isLocating, setIsLocating] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Default photos removed as requested - starts completely empty!
  const [photos, setPhotos] = useState([]);

  const currentCategoryObj = CATEGORIES.find(c => c.id === selectedCategory) || CATEGORIES[1];

  // Request real GPS when user taps Current Location
  const handleCurrentLocation = async () => {
    setIsLocating(true);
    const loc = await fetchCurrentGpsLocation(language);
    setIsLocating(false);

    if (loc) {
      setLatitude(loc.latitude);
      setLongitude(loc.longitude);
      setGoogleMapsUrl(loc.googleMapsUrl);
      if (loc.addressText) {
        setLandmark(loc.addressText);
      }
    }
  };

  // Update coordinates when user pins or taps on the real Google map
  const handleLocationChange = async (newLat, newLng) => {
    setLatitude(newLat);
    setLongitude(newLng);
    setGoogleMapsUrl(`https://www.google.com/maps?q=${newLat},${newLng}`);
    const autoAddr = await reverseGeocodeCoords(newLat, newLng);
    if (autoAddr) {
      setLandmark(autoAddr);
    }
  };

  const handlePickFromGallery = async () => {
    setShowPhotoSourceModal(false);
    const uri = await pickImageFromGallery(language);
    if (uri) {
      setPhotos(prev => [...prev, uri]);
    }
  };

  const handleCaptureCamera = async () => {
    setShowPhotoSourceModal(false);
    const uri = await capturePhotoFromCamera(language);
    if (uri) {
      setPhotos(prev => [...prev, uri]);
    }
  };

  const handleRemovePhoto = (index) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      // 1. Upload photos to Firebase Storage and get public download URLs
      const uploadedMediaUrls = [];
      for (let i = 0; i < photos.length; i++) {
        const item = photos[i];
        if (typeof item === 'string') {
          // If it is a local file URI (from camera or gallery), upload to Firebase Storage!
          if (
            item.startsWith('file:') ||
            item.startsWith('content:') ||
            item.startsWith('blob:') ||
            item.startsWith('data:')
          ) {
            console.log(`Uploading photo ${i + 1}/${photos.length} to Firebase Storage...`);
            const firebaseDownloadUrl = await uploadImageToFirebaseStorage(
              item,
              `complaints/complaint_${Date.now()}_${i}.jpg`
            );
            uploadedMediaUrls.push(firebaseDownloadUrl || item);
          } else {
            uploadedMediaUrls.push(item);
          }
        } else {
          // Required local asset
          uploadedMediaUrls.push(item);
        }
      }

      // 2. Store grievance with Firebase Storage photo URLs into database
      const newGrievance = {
        category: selectedCategory,
        title: title || (language === 'ta' ? 'சேதமடைந்த மின் கம்பம்' : 'Damaged Electric Post'),
        description: description,
        landmark: landmark,
        latitude: latitude,
        longitude: longitude,
        googleMapsUrl: googleMapsUrl,
        media: uploadedMediaUrls.length > 0 ? uploadedMediaUrls : photos,
      };

      await addNewComplaint(newGrievance);
      navigateTo('confirmation');
    } catch (e) {
      console.warn('Complaint submit error:', e);
      navigateTo('confirmation');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <Header title={t('newComplaint')} showBack onBack={goBack} />

      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        {/* Select Category */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>{t('selectCategory')}</Text>
          <TouchableOpacity
            style={styles.dropdownBtn}
            activeOpacity={0.8}
            onPress={() => setShowCategoryPicker(true)}
          >
            <View style={styles.categoryRow}>
              <Ionicons name={currentCategoryObj.icon} size={18} color={COLORS.primary} style={styles.categoryIcon} />
              <Text style={styles.categoryText}>{t(currentCategoryObj.nameKey)}</Text>
            </View>
            <Ionicons name="chevron-down" size={18} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Complaint Title */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>{t('complaintTitle')}</Text>
          <TextInput
            style={styles.textInput}
            value={title}
            onChangeText={setTitle}
            placeholder={t('complaintTitlePlaceholder')}
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* Description */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>{t('description')}</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder={t('descriptionPlaceholder')}
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Upload Photos / Video */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>{t('uploadMedia')}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.mediaRow}>
            {/* Add Photo Dashed Box */}
            <TouchableOpacity
              style={styles.addPhotoBox}
              activeOpacity={0.7}
              onPress={() => setShowPhotoSourceModal(true)}
            >
              <Ionicons name="camera-outline" size={22} color={COLORS.primary} />
              <Text style={styles.addPhotoText}>{t('addPhoto')}</Text>
            </TouchableOpacity>

            {/* Thumbnail Previews */}
            {photos.map((item, index) => {
              const imageSource = typeof item === 'string' ? { uri: item } : item;
              return (
                <View key={index} style={styles.photoThumbnailContainer}>
                  <Image source={imageSource} style={styles.photoThumbnail} />
                  <TouchableOpacity
                    style={styles.removePhotoBtn}
                    onPress={() => handleRemovePhoto(index)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="close" size={12} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              );
            })}
          </ScrollView>
        </View>

        {/* Google Map Location Section (Swiggy / Zomato Style Flow) */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>
            {language === 'ta' ? 'கூகுள் மேப் இடம் (Google Map Location)' : 'Google Map Location'}
          </Text>

          {/* Selected Location Card */}
          <View style={styles.locationSummaryCard}>
            <View style={styles.locationIconBadge}>
              <Ionicons name="location" size={20} color={COLORS.primary} />
            </View>

            <View style={{ flex: 1 }}>
              <View style={styles.locationTitleRow}>
                <Text style={styles.locationSummaryTitle}>
                  {language === 'ta' ? 'தேர்வு செய்யப்பட்ட இடம்' : 'Selected Location'}
                </Text>
                {isLocating ? (
                  <ActivityIndicator size="small" color={COLORS.primary} />
                ) : (
                  <View style={styles.gpsVerifiedBadge}>
                    <Ionicons name="checkmark-circle" size={11} color="#059669" />
                    <Text style={styles.gpsVerifiedText}>GPS</Text>
                  </View>
                )}
              </View>

              <Text style={styles.locationAddressText} numberOfLines={2}>
                {landmark || (language === 'ta' ? 'சென்னை, தமிழ்நாடு' : 'Chennai, Tamil Nadu')}
              </Text>

              <Text style={styles.locationCoordsText}>
                {`${Number(latitude).toFixed(4)}° N, ${Number(longitude).toFixed(4)}° E`}
              </Text>
            </View>
          </View>

          {/* 2 Buttons as requested: Current Location & Pin to Map */}
          <View style={styles.locationButtonsRow}>
            {/* 1. Current Location Button */}
            <TouchableOpacity
              style={[styles.locationActionBtn, styles.currentLocationBtn, isLocating && { opacity: 0.8 }]}
              activeOpacity={0.8}
              onPress={handleCurrentLocation}
              disabled={isLocating}
            >
              {isLocating ? (
                <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 6 }} />
              ) : (
                <Ionicons name="navigate" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
              )}
              <Text style={styles.currentLocationBtnText}>
                {isLocating
                  ? (language === 'ta' ? 'தேடுகிறது...' : 'Locating...')
                  : (language === 'ta' ? 'Current Location' : 'Current Location')}
              </Text>
            </TouchableOpacity>

            {/* 2. Pin to Map Button (Opens Swiggy/Zomato Modal) */}
            <TouchableOpacity
              style={[styles.locationActionBtn, styles.pinToMapBtn]}
              activeOpacity={0.8}
              onPress={() => setShowSwiggyMapModal(true)}
            >
              <Ionicons name="map" size={16} color={COLORS.primary} style={{ marginRight: 6 }} />
              <Text style={styles.pinToMapBtnText}>
                {language === 'ta' ? 'Pin to Map' : 'Pin to Map'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Big Submit Button */}
        <View style={styles.buttonWrapper}>
          <TouchableOpacity
            style={[styles.submitButton, submitting && { opacity: 0.8 }]}
            activeOpacity={0.85}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.submitButtonText}>{t('submitComplaintBtn')}</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Official TVK Helpline Numbers Banner */}
        <View style={styles.helplineBanner}>
          <View style={styles.helplineTitleRow}>
            <Ionicons name="call" size={14} color={COLORS.primary} />
            <Text style={styles.helplineTitle}>
              {language === 'ta' ? 'அவசர உதவி & குறைதீர்ப்பு எண்கள்:' : 'TVK Citizen Helpline:'}
            </Text>
          </View>
          <View style={styles.helplinePillsRow}>
            <TouchableOpacity
              style={styles.helplinePill}
              activeOpacity={0.7}
              onPress={() => makePhoneCall('+917904950915')}
            >
              <Ionicons name="call-outline" size={12} color="#1F2937" />
              <Text style={styles.helplinePillText}>+91 79049 50915</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.helplinePill}
              activeOpacity={0.7}
              onPress={() => makePhoneCall('+919042541054')}
            >
              <Ionicons name="logo-whatsapp" size={12} color="#16A34A" />
              <Text style={styles.helplinePillText}>+91 90425 41054</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Category Picker Modal */}
      <Modal visible={showCategoryPicker} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setShowCategoryPicker(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('selectCategory')}</Text>
            {CATEGORIES.map(cat => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryModalItem,
                  selectedCategory === cat.id && styles.categoryModalItemActive,
                ]}
                onPress={() => {
                  setSelectedCategory(cat.id);
                  setShowCategoryPicker(false);
                }}
              >
                <Ionicons name={cat.icon} size={20} color={selectedCategory === cat.id ? COLORS.primary : '#4B5563'} />
                <Text
                  style={[
                    styles.categoryModalText,
                    selectedCategory === cat.id && styles.categoryModalTextActive,
                  ]}
                >
                  {t(cat.nameKey)}
                </Text>
                {selectedCategory === cat.id && (
                  <Ionicons name="checkmark" size={18} color={COLORS.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Photo Picker Options Modal */}
      <Modal visible={showPhotoSourceModal} transparent animationType="slide">
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setShowPhotoSourceModal(false)}
        >
          <View style={styles.photoSourceContent}>
            <Text style={styles.photoSourceTitle}>
              {language === 'ta' ? 'புகைப்படம் சேர்க்கவும்' : 'Add Grievance Photo'}
            </Text>

            <TouchableOpacity style={styles.photoSourceBtn} activeOpacity={0.7} onPress={handleCaptureCamera}>
              <View style={[styles.sourceIconCircle, { backgroundColor: '#FEE2E2' }]}>
                <Ionicons name="camera" size={20} color={COLORS.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.sourceBtnTitle}>
                  {language === 'ta' ? 'கேமரா மூலம் படம் எடுக்க' : 'Take Photo with Camera'}
                </Text>
                <Text style={styles.sourceBtnSub}>
                  {language === 'ta' ? 'நேரடியாக படம் எடுக்கவும்' : 'Capture instant problem photo'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.photoSourceBtn} activeOpacity={0.7} onPress={handlePickFromGallery}>
              <View style={[styles.sourceIconCircle, { backgroundColor: '#E0F2FE' }]}>
                <Ionicons name="images" size={20} color="#0284C7" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.sourceBtnTitle}>
                  {language === 'ta' ? 'கேலரியில் இருந்து தேர்ந்தெடுக்க' : 'Choose from Gallery'}
                </Text>
                <Text style={styles.sourceBtnSub}>
                  {language === 'ta' ? 'சேமிக்கப்பட்ட படங்களை தேர்வு செய்க' : 'Select stored photos from gallery'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelModalBtn}
              activeOpacity={0.7}
              onPress={() => setShowPhotoSourceModal(false)}
            >
              <Text style={styles.cancelModalBtnText}>
                {language === 'ta' ? 'ரத்து செய்' : 'Cancel'}
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Swiggy / Zomato Style Pin to Map Fullscreen Modal */}
      <SwiggyMapPinModal
        visible={showSwiggyMapModal}
        onClose={() => setShowSwiggyMapModal(false)}
        initialLatitude={latitude}
        initialLongitude={longitude}
        initialAddress={landmark}
        onConfirmLocation={(loc) => {
          if (loc) {
            setLatitude(loc.latitude);
            setLongitude(loc.longitude);
            setGoogleMapsUrl(loc.googleMapsUrl);
            if (loc.addressText) {
              setLandmark(loc.addressText);
            }
          }
        }}
      />
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
  fieldGroup: {
    marginBottom: 18,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  dropdownBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIcon: {
    marginRight: 10,
  },
  categoryText: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1F2937',
  },
  textArea: {
    minHeight: 88,
    paddingTop: 12,
  },
  mediaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 4,
  },
  addPhotoBox: {
    width: 80,
    height: 80,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#FCA5A5',
    borderStyle: 'dashed',
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPhotoText: {
    fontSize: 10,
    color: COLORS.primary,
    fontWeight: '700',
    marginTop: 4,
  },
  photoThumbnailContainer: {
    width: 80,
    height: 80,
    borderRadius: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  photoThumbnail: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  removePhotoBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonWrapper: {
    marginTop: 10,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
    elevation: 3,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 14,
  },
  categoryModalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  categoryModalItemActive: {
    backgroundColor: COLORS.primaryLight,
  },
  categoryModalText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 12,
    flex: 1,
  },
  categoryModalTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  photoSourceContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 30,
  },
  photoSourceTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 16,
  },
  photoSourceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sourceIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  sourceBtnTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  sourceBtnSub: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  cancelModalBtn: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 6,
  },
  cancelModalBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  helplineBanner: {
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginTop: 10,
    marginBottom: 20,
  },
  helplineTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  helplineTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
  },
  helplinePillsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  helplinePill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingVertical: 8,
    borderRadius: 10,
    gap: 4,
  },
  helplinePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1F2937',
  },
  locationSummaryCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 14,
    marginBottom: 12,
  },
  locationIconBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  locationTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  locationSummaryTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  gpsVerifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 3,
  },
  gpsVerifiedText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
  },
  locationAddressText: {
    fontSize: 13,
    color: '#374151',
    lineHeight: 18,
    fontWeight: '500',
    marginBottom: 4,
  },
  locationCoordsText: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '600',
  },
  locationButtonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  locationActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
  },
  currentLocationBtn: {
    backgroundColor: COLORS.primary,
    elevation: 1,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  currentLocationBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  pinToMapBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  pinToMapBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
});
