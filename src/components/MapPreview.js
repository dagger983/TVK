// src/components/MapPreview.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Dimensions,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { useLanguage } from '../context/LanguageContext';
import { GOOGLE_MAPS_API_KEY, reverseGeocodeCoords, openInGoogleMaps } from '../services/locationService';

const { width } = Dimensions.get('window');

export default function MapPreview({
  address,
  latitude = 13.0850,
  longitude = 80.2101,
  showCurrentLocationBtn = false,
  onPressCurrentLocation,
  isLocating = false,
  height = 165,
  onLocationChange,
}) {
  const { t, language } = useLanguage();

  const [pinOffset, setPinOffset] = useState({ x: 0, y: 0 });
  const [zoomLevel, setZoomLevel] = useState(16);
  const [mapType, setMapType] = useState('roadmap'); // 'roadmap' | 'satellite'
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const [hasImageError, setHasImageError] = useState(false);

  // Modal State
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [modalCoords, setModalCoords] = useState({ lat: latitude, lng: longitude });
  const [modalZoom, setModalZoom] = useState(16);
  const [modalMapType, setModalMapType] = useState('roadmap');
  const [resolvedAddress, setResolvedAddress] = useState(address || '');
  const [isResolvingAddress, setIsResolvingAddress] = useState(false);

  // Sync coords
  useEffect(() => {
    if (latitude && longitude) {
      setModalCoords({ lat: latitude, lng: longitude });
      setPinOffset({ x: 0, y: 0 });
    }
  }, [latitude, longitude]);

  // Helper to get real, high-resolution slippy map tile URL (No 403 errors, no API limits)
  const getPreviewTileUrl = (lat, lng, zoom = 15, currentMapType = 'roadmap') => {
    const sinY = Math.sin((lat * Math.PI) / 180);
    const clampedSinY = Math.min(Math.max(sinY, -0.9999), 0.9999);
    const scale = 256 * Math.pow(2, zoom);
    const pixelX = ((lng + 180) / 360) * scale;
    const pixelY = (0.5 - Math.log((1 + clampedSinY) / (1 - clampedSinY)) / (4 * Math.PI)) * scale;
    const x = Math.floor(pixelX / 256);
    const y = Math.floor(pixelY / 256);
    const sub = Math.abs((x + y) % 4);
    const lyrs = currentMapType === 'satellite' ? 'y' : 'm';
    return `https://mt${sub}.google.com/vt/lyrs=${lyrs}&x=${x}&y=${y}&z=${zoom}&key=${GOOGLE_MAPS_API_KEY}`;
  };

  // Construct real high-resolution map image URLs
  const googleMapUrl = getPreviewTileUrl(latitude, longitude, zoomLevel, mapType);
  const modalGoogleMapUrl = getPreviewTileUrl(modalCoords.lat, modalCoords.lng, modalZoom, modalMapType);

  // Tap on preview map to adjust pin position
  const handleMapTouch = (evt) => {
    const { locationX, locationY } = evt.nativeEvent;
    const mapWidth = width - 40;
    const mapHeight = height;

    const normX = (locationX / mapWidth) - 0.5;
    const normY = (locationY / mapHeight) - 0.5;

    setPinOffset({
      x: normX * (mapWidth * 0.7),
      y: normY * (mapHeight * 0.7),
    });

    const latDelta = normY * (0.008 / (zoomLevel / 15));
    const lngDelta = normX * (0.008 / (zoomLevel / 15));
    const newLat = Number((latitude - latDelta).toFixed(5));
    const newLng = Number((longitude + lngDelta).toFixed(5));

    if (onLocationChange) {
      onLocationChange(newLat, newLng);
    }
    resolveAddress(newLat, newLng);
  };

  // Tap on modal map to place pin
  const handleModalMapTouch = (evt) => {
    const { locationX, locationY } = evt.nativeEvent;
    const mapWidth = width - 40;
    const mapHeight = 320;

    const normX = (locationX / mapWidth) - 0.5;
    const normY = (locationY / mapHeight) - 0.5;

    const latDelta = normY * (0.012 / (modalZoom / 15));
    const lngDelta = normX * (0.012 / (modalZoom / 15));
    const newLat = Number((modalCoords.lat - latDelta).toFixed(5));
    const newLng = Number((modalCoords.lng + lngDelta).toFixed(5));

    setModalCoords({ lat: newLat, lng: newLng });
    resolveAddress(newLat, newLng);
  };

  const resolveAddress = async (lat, lng) => {
    setIsResolvingAddress(true);
    const addr = await reverseGeocodeCoords(lat, lng);
    setIsResolvingAddress(false);
    if (addr) {
      setResolvedAddress(addr);
    }
  };

  const handleOpenPinModal = () => {
    setModalCoords({ lat: latitude, lng: longitude });
    setModalZoom(zoomLevel);
    setModalMapType(mapType);
    setIsPinModalOpen(true);
  };

  const handleConfirmModalPin = () => {
    if (onLocationChange) {
      onLocationChange(modalCoords.lat, modalCoords.lng);
    }
    setIsPinModalOpen(false);
  };

  return (
    <View style={styles.wrapper}>
      {/* Top Header Row with Action Pills */}
      <View style={styles.topRow}>
        <View style={styles.labelWithLiveDot}>
          <View style={styles.liveGoogleDot} />
          <Text style={styles.sectionLabel}>
            {language === 'ta' ? 'கூகுள் வரைபடம் (Google Maps)' : 'Google Map Location'}
          </Text>
        </View>

        <View style={styles.actionPillsRow}>
          {showCurrentLocationBtn && (
            <TouchableOpacity
              style={[styles.currentLocationBtn, isLocating && styles.currentLocationBtnActive]}
              activeOpacity={0.7}
              onPress={onPressCurrentLocation}
              disabled={isLocating}
            >
              {isLocating ? (
                <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 4 }} />
              ) : (
                <Ionicons name="navigate" size={13} color="#FFFFFF" style={{ marginRight: 4 }} />
              )}
              <Text style={styles.currentLocationText}>
                {isLocating ? (language === 'ta' ? 'தேடுகிறது...' : 'Locating...') : t('currentLocation')}
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.pinModalBtn}
            activeOpacity={0.7}
            onPress={handleOpenPinModal}
          >
            <Ionicons name="location" size={13} color={COLORS.primary} style={{ marginRight: 3 }} />
            <Text style={styles.pinModalBtnText}>
              {language === 'ta' ? 'பெரிதாக்கு / பின் செய்' : 'Pin on Map'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Embedded Real Google Maps View */}
      <TouchableOpacity
        style={[styles.mapContainer, { height }]}
        activeOpacity={0.95}
        onPress={handleMapTouch}
      >
        <Image
          source={{ uri: !hasImageError ? googleMapUrl : `https://tile.openstreetmap.org/15/${Math.floor(((longitude + 180) / 360) * Math.pow(2, 15))}/${Math.floor((0.5 - Math.log((1 + Math.sin((latitude * Math.PI) / 180)) / (1 - Math.sin((latitude * Math.PI) / 180))) / (4 * Math.PI)) * Math.pow(2, 15))}.png` }}
          style={styles.mapImage}
          resizeMode="cover"
          onLoadStart={() => setIsLoadingImage(true)}
          onLoadEnd={() => setIsLoadingImage(false)}
          onError={() => setHasImageError(true)}
        />

        {isLoadingImage && (
          <View style={styles.imageLoadingOverlay} pointerEvents="none">
            <ActivityIndicator size="small" color={COLORS.primary} />
          </View>
        )}

        {/* Dynamic Location Pin Marker positioned by touch */}
        <View
          style={[
            styles.pinWrapper,
            {
              transform: [
                { translateX: -18 + pinOffset.x },
                { translateY: -34 + pinOffset.y },
              ],
            },
          ]}
          pointerEvents="none"
        >
          <View style={styles.pinCircle}>
            <Ionicons name="location" size={28} color={COLORS.primary} />
          </View>
          <View style={styles.pinShadow} />
        </View>

        {/* Top Hint Overlay */}
        <View style={styles.mapHintBadge} pointerEvents="none">
          <Ionicons name="finger-print-outline" size={12} color="#FFFFFF" />
          <Text style={styles.mapHintText}>
            {language === 'ta' ? 'வரைபடத்தில் தொட்டு பினை மாற்றவும்' : 'Tap to adjust pin'}
          </Text>
        </View>

        {/* Zoom Controls Overlay */}
        <View style={styles.zoomControlsOverlay}>
          <TouchableOpacity
            style={styles.zoomBtn}
            onPress={() => setZoomLevel(prev => Math.min(prev + 1, 19))}
            activeOpacity={0.7}
          >
            <Ionicons name="add" size={16} color="#1F2937" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.zoomBtn}
            onPress={() => setZoomLevel(prev => Math.max(prev - 1, 12))}
            activeOpacity={0.7}
          >
            <Ionicons name="remove" size={16} color="#1F2937" />
          </TouchableOpacity>
        </View>

        {/* Bottom Coordinates & GPS Badge (NO RAW URL SHOWN) */}
        {latitude && longitude ? (
          <View style={styles.coordsBadge} pointerEvents="none">
            <Ionicons name="locate" size={11} color="#10B981" />
            <Text style={styles.coordsText}>
              {`${Number(latitude).toFixed(4)}° N, ${Number(longitude).toFixed(4)}° E`}
            </Text>
          </View>
        ) : null}
      </TouchableOpacity>

      {/* Address line (Neat & Clean, NO raw URL shown to user) */}
      {address || resolvedAddress ? (
        <View style={styles.addressContainer}>
          <Ionicons name="location-sharp" size={15} color={COLORS.primary} />
          <Text style={styles.addressText} numberOfLines={2}>
            {address || resolvedAddress}
          </Text>
          {isResolvingAddress && <ActivityIndicator size="small" color={COLORS.primary} />}
        </View>
      ) : null}

      {/* Fullscreen High-Resolution Pinning Modal */}
      <Modal
        visible={isPinModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsPinModalOpen(false)}
      >
        <SafeAreaView style={styles.modalOverlay} edges={['bottom']}>
          <View style={styles.modalCard}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitle}>
                  {language === 'ta' ? 'கூகுள் வரைபடத்தில் துல்லியமாக பின் செய்க' : 'Pin Exact Location on Google Maps'}
                </Text>
                <Text style={styles.modalSubtitle}>
                  {language === 'ta' ? 'சரியான தெரு அல்லது கட்டடத்தைத் தொடவும்' : 'Tap on the exact spot to pin'}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setIsPinModalOpen(false)} style={styles.modalCloseBtn}>
                <Ionicons name="close" size={22} color="#4B5563" />
              </TouchableOpacity>
            </View>

            {/* Map Type Toggle: Roadmap vs Satellite */}
            <View style={styles.mapTypeToggleRow}>
              <TouchableOpacity
                style={[
                  styles.mapTypeBtn,
                  modalMapType === 'roadmap' && styles.mapTypeBtnActive,
                ]}
                onPress={() => setModalMapType('roadmap')}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="map-outline"
                  size={14}
                  color={modalMapType === 'roadmap' ? '#FFFFFF' : '#4B5563'}
                />
                <Text
                  style={[
                    styles.mapTypeBtnText,
                    modalMapType === 'roadmap' && styles.mapTypeBtnTextActive,
                  ]}
                >
                  {language === 'ta' ? 'சாலை வரைபடம்' : 'Street Map'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.mapTypeBtn,
                  modalMapType === 'satellite' && styles.mapTypeBtnActive,
                ]}
                onPress={() => setModalMapType('satellite')}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="earth-outline"
                  size={14}
                  color={modalMapType === 'satellite' ? '#FFFFFF' : '#4B5563'}
                />
                <Text
                  style={[
                    styles.mapTypeBtnText,
                    modalMapType === 'satellite' && styles.mapTypeBtnTextActive,
                  ]}
                >
                  {language === 'ta' ? 'செயற்கைக்கோள்' : 'Satellite'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Expanded Real Google Map View */}
            <TouchableOpacity
              style={styles.modalMapArea}
              activeOpacity={0.95}
              onPress={handleModalMapTouch}
            >
              <Image
                source={{ uri: modalGoogleMapUrl }}
                style={styles.modalMapImage}
                resizeMode="cover"
              />

              {/* Center Target Pin */}
              <View style={styles.modalCenterPin} pointerEvents="none">
                <View style={styles.modalPinBubble}>
                  <Text style={styles.modalPinBubbleText}>
                    {language === 'ta' ? 'புகார் இடம்' : 'Issue Spot'}
                  </Text>
                </View>
                <Ionicons name="location" size={38} color={COLORS.primary} />
                <View style={styles.modalPinShadow} />
              </View>

              {/* Modal Zoom Buttons */}
              <View style={styles.modalZoomOverlay}>
                <TouchableOpacity
                  style={styles.zoomBtn}
                  onPress={() => setModalZoom(prev => Math.min(prev + 1, 19))}
                  activeOpacity={0.7}
                >
                  <Ionicons name="add" size={16} color="#1F2937" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.zoomBtn}
                  onPress={() => setModalZoom(prev => Math.max(prev - 1, 12))}
                  activeOpacity={0.7}
                >
                  <Ionicons name="remove" size={16} color="#1F2937" />
                </TouchableOpacity>
              </View>

              {/* Floating GPS Button in Modal */}
              {showCurrentLocationBtn && (
                <TouchableOpacity
                  style={styles.modalGpsFloatBtn}
                  activeOpacity={0.8}
                  onPress={async () => {
                    if (onPressCurrentLocation) {
                      await onPressCurrentLocation();
                      setModalCoords({ lat: latitude, lng: longitude });
                    }
                  }}
                  disabled={isLocating}
                >
                  {isLocating ? (
                    <ActivityIndicator size="small" color={COLORS.primary} />
                  ) : (
                    <Ionicons name="navigate" size={18} color={COLORS.primary} />
                  )}
                </TouchableOpacity>
              )}
            </TouchableOpacity>

            {/* Resolved Coordinates & Address Bar */}
            <View style={styles.modalCoordsBar}>
              <View style={styles.modalCoordsLeft}>
                <Ionicons name="navigate-circle" size={16} color="#059669" />
                <Text style={styles.modalCoordsText}>
                  {`${Number(modalCoords.lat).toFixed(5)}° N, ${Number(modalCoords.lng).toFixed(5)}° E`}
                </Text>
              </View>
              <Text style={styles.modalAddressHint} numberOfLines={1}>
                {resolvedAddress || address || (language === 'ta' ? 'சென்னை, தமிழ்நாடு' : 'Chennai, Tamil Nadu')}
              </Text>
            </View>

            {/* Action Buttons: Confirm & External Google Maps app */}
            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.openGmapsAppBtn}
                activeOpacity={0.8}
                onPress={() => openInGoogleMaps(modalCoords.lat, modalCoords.lng)}
              >
                <Ionicons name="map" size={16} color={COLORS.primary} style={{ marginRight: 4 }} />
                <Text style={styles.openGmapsAppText}>
                  {language === 'ta' ? 'கூகுள் மேப்பில் பார்க்க' : 'Open Maps App'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmPinButton}
                activeOpacity={0.85}
                onPress={handleConfirmModalPin}
              >
                <Ionicons name="checkmark-circle" size={17} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.confirmPinButtonText}>
                  {language === 'ta' ? 'இடத்தை உறுதி செய்' : 'Confirm Spot'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: 4,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  labelWithLiveDot: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  liveGoogleDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#10B981',
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
  },
  actionPillsRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  currentLocationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 14,
    elevation: 2,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  currentLocationBtnActive: {
    opacity: 0.85,
  },
  currentLocationText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  pinModalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: '#FECACA',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 14,
  },
  pinModalBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  mapContainer: {
    width: '100%',
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#E5E7EB',
  },
  mapImage: {
    width: '100%',
    height: '100%',
  },
  imageLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinWrapper: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    alignItems: 'center',
  },
  pinCircle: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 5,
    elevation: 5,
  },
  pinShadow: {
    width: 10,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(0,0,0,0.35)',
    marginTop: 2,
  },
  mapHintBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(17, 24, 39, 0.78)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  mapHintText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  zoomControlsOverlay: {
    position: 'absolute',
    right: 8,
    top: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  modalZoomOverlay: {
    position: 'absolute',
    left: 10,
    bottom: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  zoomBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  coordsBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(17, 24, 39, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  coordsText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 4,
    gap: 6,
  },
  addressText: {
    fontSize: 12,
    color: '#4B5563',
    fontWeight: '600',
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '92%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  modalSubtitle: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  modalCloseBtn: {
    padding: 4,
  },
  mapTypeToggleRow: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 3,
    marginBottom: 12,
    gap: 4,
  },
  mapTypeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    borderRadius: 9,
    gap: 6,
  },
  mapTypeBtnActive: {
    backgroundColor: COLORS.primary,
  },
  mapTypeBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
  },
  mapTypeBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  modalMapArea: {
    width: '100%',
    height: 300,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#E5E7EB',
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
  },
  modalMapImage: {
    width: '100%',
    height: '100%',
  },
  modalCenterPin: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -19 }, { translateY: -40 }],
    alignItems: 'center',
  },
  modalPinBubble: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginBottom: 2,
  },
  modalPinBubbleText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  modalPinShadow: {
    width: 12,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(0,0,0,0.3)',
    marginTop: 1,
  },
  modalGpsFloatBtn: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  modalCoordsBar: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 10,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  modalCoordsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  modalCoordsText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111827',
  },
  modalAddressHint: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  openGmapsAppBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FECACA',
    paddingVertical: 13,
    borderRadius: 12,
  },
  openGmapsAppText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  confirmPinButton: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 13,
    borderRadius: 12,
    elevation: 3,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  confirmPinButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
