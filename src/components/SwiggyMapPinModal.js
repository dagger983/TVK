// src/components/SwiggyMapPinModal.js
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Dimensions,
  Image,
  PanResponder,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { useLanguage } from '../context/LanguageContext';
import {
  reverseGeocodeCoords,
  fetchCurrentGpsLocation,
  GOOGLE_MAPS_API_KEY,
} from '../services/locationService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TILE_SIZE = 256;

// Convert Lat/Lng to Mercator Pixel Coordinate at given Zoom
function latLngToPoint(lat, lng, zoom) {
  const sinY = Math.sin((lat * Math.PI) / 180);
  const clampedSinY = Math.min(Math.max(sinY, -0.9999), 0.9999);
  const scale = TILE_SIZE * Math.pow(2, zoom);
  const pixelX = ((lng + 180) / 360) * scale;
  const pixelY = (0.5 - Math.log((1 + clampedSinY) / (1 - clampedSinY)) / (4 * Math.PI)) * scale;
  return { pixelX, pixelY };
}

// Convert Mercator Pixel Coordinate to Lat/Lng at given Zoom
function pointToLatLng(pixelX, pixelY, zoom) {
  const scale = TILE_SIZE * Math.pow(2, zoom);
  const lng = (pixelX / scale) * 360 - 180;
  const n = Math.PI - (2 * Math.PI * pixelY) / scale;
  const lat = (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
  return {
    latitude: Number(lat.toFixed(6)),
    longitude: Number(lng.toFixed(6)),
  };
}

// Generate official Google Maps tile URL with user's Google API Key
function getTileUrl(x, y, z, mapType) {
  const maxTile = Math.pow(2, z);
  const normalizedX = ((x % maxTile) + maxTile) % maxTile;
  if (y < 0 || y >= maxTile) return null;

  // Round-robin mt0, mt1, mt2, mt3 subdomains for ultra-fast parallel tile loading
  const sub = Math.abs((x + y) % 4);
  const lyrs = mapType === 'satellite' ? 'y' : 'm'; // 'm' = Roadmap, 'y' = Hybrid Satellite

  return `https://mt${sub}.google.com/vt/lyrs=${lyrs}&x=${normalizedX}&y=${y}&z=${z}&key=${GOOGLE_MAPS_API_KEY}`;
}

// Single Tile Image with Automatic OSM Fallback
const TileItem = React.memo(({ x, y, z, mapType, left, top }) => {
  const [hasError, setHasError] = useState(false);
  const tileUrl = hasError
    ? `https://tile.openstreetmap.org/${z}/${x}/${y}.png`
    : getTileUrl(x, y, z, mapType);

  if (!tileUrl) return null;

  return (
    <Image
      source={{ uri: tileUrl }}
      style={{
        position: 'absolute',
        left,
        top,
        width: TILE_SIZE,
        height: TILE_SIZE,
      }}
      fadeDuration={0}
      onError={() => {
        if (!hasError) setHasError(true);
      }}
    />
  );
});

export default function SwiggyMapPinModal({
  visible,
  onClose,
  initialLatitude = 13.0850,
  initialLongitude = 80.2101,
  initialAddress = '',
  onConfirmLocation,
}) {
  const { language } = useLanguage();

  const [currentLat, setCurrentLat] = useState(initialLatitude);
  const [currentLng, setCurrentLng] = useState(initialLongitude);
  const [zoom, setZoom] = useState(16);
  const [mapType, setMapType] = useState('roadmap'); // 'roadmap' | 'satellite'
  const [addressText, setAddressText] = useState(initialAddress);
  const [isResolvingAddress, setIsResolvingAddress] = useState(false);
  const [isLocatingGps, setIsLocatingGps] = useState(false);
  const [viewport, setViewport] = useState({ width: SCREEN_WIDTH, height: 400 });

  // Pan gesture animated offsets
  const pan = useRef(new Animated.ValueXY()).current;
  const currentCoordsRef = useRef({ lat: currentLat, lng: currentLng, zoom });
  currentCoordsRef.current = { lat: currentLat, lng: currentLng, zoom };

  // Sync coords when opened
  useEffect(() => {
    if (visible) {
      setCurrentLat(initialLatitude);
      setCurrentLng(initialLongitude);
      setAddressText(initialAddress || '');
      lookupAddress(initialLatitude, initialLongitude);
    }
  }, [visible, initialLatitude, initialLongitude]);

  const lookupAddress = async (lat, lng) => {
    setIsResolvingAddress(true);
    const addr = await reverseGeocodeCoords(lat, lng);
    setIsResolvingAddress(false);
    if (addr) {
      setAddressText(addr);
    }
  };

  // PanResponder to handle smooth real-time map dragging like Swiggy / Zomato
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gesture) =>
        Math.abs(gesture.dx) > 3 || Math.abs(gesture.dy) > 3,
      onPanResponderGrant: () => {
        pan.setOffset({ x: 0, y: 0 });
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: Animated.event(
        [null, { dx: pan.x, dy: pan.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: (_, gesture) => {
        pan.flattenOffset();
        const { lat, lng, zoom: currentZoom } = currentCoordsRef.current;
        const centerPt = latLngToPoint(lat, lng, currentZoom);

        // Map movement inverts the target pin coordinate
        const newPt = {
          pixelX: centerPt.pixelX - gesture.dx,
          pixelY: centerPt.pixelY - gesture.dy,
        };
        const newCoords = pointToLatLng(newPt.pixelX, newPt.pixelY, currentZoom);

        pan.setValue({ x: 0, y: 0 });
        setCurrentLat(newCoords.latitude);
        setCurrentLng(newCoords.longitude);
        lookupAddress(newCoords.latitude, newCoords.longitude);
      },
    })
  ).current;

  // D-pad micro adjustment
  const nudge = (dx, dy) => {
    const centerPt = latLngToPoint(currentLat, currentLng, zoom);
    const newPt = {
      pixelX: centerPt.pixelX + dx,
      pixelY: centerPt.pixelY + dy,
    };
    const newCoords = pointToLatLng(newPt.pixelX, newPt.pixelY, zoom);
    setCurrentLat(newCoords.latitude);
    setCurrentLng(newCoords.longitude);
    lookupAddress(newCoords.latitude, newCoords.longitude);
  };

  // GPS Locate me button
  const handleLocateMe = async () => {
    setIsLocatingGps(true);
    const loc = await fetchCurrentGpsLocation(language);
    setIsLocatingGps(false);
    if (loc) {
      setCurrentLat(loc.latitude);
      setCurrentLng(loc.longitude);
      setAddressText(loc.addressText);
    }
  };

  // Confirm Location callback
  const handleConfirm = () => {
    if (onConfirmLocation) {
      onConfirmLocation({
        latitude: currentLat,
        longitude: currentLng,
        addressText: addressText || `${currentLat.toFixed(5)}, ${currentLng.toFixed(5)}`,
        googleMapsUrl: `https://www.google.com/maps?q=${currentLat},${currentLng}`,
      });
    }
    onClose();
  };

  // Compute 5x5 tile grid around current location
  const centerPoint = latLngToPoint(currentLat, currentLng, zoom);
  const centerTileX = Math.floor(centerPoint.pixelX / TILE_SIZE);
  const centerTileY = Math.floor(centerPoint.pixelY / TILE_SIZE);
  const centerOffsetX = centerPoint.pixelX - centerTileX * TILE_SIZE;
  const centerOffsetY = centerPoint.pixelY - centerTileY * TILE_SIZE;

  const baseLeft = (viewport.width / 2) - centerOffsetX;
  const baseTop = (viewport.height / 2) - centerOffsetY;

  const tiles = [];
  for (let dy = -2; dy <= 2; dy++) {
    for (let dx = -2; dx <= 2; dx++) {
      const tileX = centerTileX + dx;
      const tileY = centerTileY + dy;
      tiles.push({
        key: `${zoom}_${tileX}_${tileY}_${mapType}`,
        x: tileX,
        y: tileY,
        left: baseLeft + dx * TILE_SIZE,
        top: baseTop + dy * TILE_SIZE,
      });
    }
  }

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <SafeAreaView style={styles.safeContainer} edges={['top', 'bottom']}>
        {/* Top Header Bar */}
        <View style={styles.headerBar}>
          <TouchableOpacity onPress={onClose} style={styles.headerBackBtn} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>

          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>
              {language === 'ta' ? 'புகார் இடத்தை தேர்வு செய்க' : 'Select Issue Location'}
            </Text>
            <Text style={styles.headerSubtitle}>
              {language === 'ta' ? 'வரைபடத்தில் சரியான இடத்தை பின் செய்யவும்' : 'Drag map to place pin accurately'}
            </Text>
          </View>

          {/* Map Type Toggle (Street vs Satellite) */}
          <TouchableOpacity
            style={styles.mapTypeToggle}
            onPress={() => setMapType(prev => (prev === 'roadmap' ? 'satellite' : 'roadmap'))}
            activeOpacity={0.8}
          >
            <Ionicons
              name={mapType === 'roadmap' ? 'earth' : 'map'}
              size={18}
              color={COLORS.primary}
            />
            <Text style={styles.mapTypeText}>
              {mapType === 'roadmap'
                ? (language === 'ta' ? 'சாட்டிலைட்' : 'Satellite')
                : (language === 'ta' ? 'ரோடு மேப்' : 'Roadmap')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Real Interactive Tile Map Viewport */}
        <View
          style={styles.mapViewport}
          onLayout={(e) => {
            const { width, height } = e.nativeEvent.layout;
            if (width > 0 && height > 0) {
              setViewport({ width, height });
            }
          }}
          {...panResponder.panHandlers}
        >
          {/* Animated Slippy Tile Canvas */}
          <Animated.View
            style={[
              styles.tileCanvas,
              {
                transform: pan.getTranslateTransform(),
              },
            ]}
          >
            {tiles.map(tile => (
              <TileItem
                key={tile.key}
                x={tile.x}
                y={tile.y}
                z={zoom}
                mapType={mapType}
                left={tile.left}
                top={tile.top}
              />
            ))}
          </Animated.View>

          {/* Top Instruction Pill */}
          <View style={styles.topTapHint} pointerEvents="none">
            <Ionicons name="hand-left-outline" size={13} color="#FFFFFF" style={{ marginRight: 4 }} />
            <Text style={styles.topTapHintText}>
              {language === 'ta' ? 'மேப்பை இழுத்து பின்னை வைக்கவும்' : 'Drag map to align center pin'}
            </Text>
          </View>

          {/* THE ICONIC SWIGGY / ZOMATO CENTER PIN */}
          <View style={styles.centerPinWrapper} pointerEvents="none">
            {/* Tooltip Badge */}
            <View style={styles.pinTooltip}>
              <Ionicons name="location" size={12} color="#FFFFFF" style={{ marginRight: 3 }} />
              <Text style={styles.pinTooltipText}>
                {language === 'ta' ? 'புகார் இடம்' : 'Issue Spot'}
              </Text>
            </View>

            {/* Pin Needle Icon */}
            <Ionicons name="location" size={44} color={COLORS.primary} />

            {/* Target Pulse Shadow */}
            <View style={styles.targetPulseDot} />
          </View>

          {/* Micro Pan Direction Buttons (D-Pad) */}
          <View style={styles.dpadContainer} pointerEvents="box-none">
            <TouchableOpacity style={styles.dpadBtn} onPress={() => nudge(0, -35)}>
              <Ionicons name="chevron-up" size={16} color="#1F2937" />
            </TouchableOpacity>
            <View style={styles.dpadMiddleRow}>
              <TouchableOpacity style={styles.dpadBtn} onPress={() => nudge(-35, 0)}>
                <Ionicons name="chevron-back" size={16} color="#1F2937" />
              </TouchableOpacity>
              <View style={styles.dpadCenterDot} />
              <TouchableOpacity style={styles.dpadBtn} onPress={() => nudge(35, 0)}>
                <Ionicons name="chevron-forward" size={16} color="#1F2937" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.dpadBtn} onPress={() => nudge(0, 35)}>
              <Ionicons name="chevron-down" size={16} color="#1F2937" />
            </TouchableOpacity>
          </View>

          {/* Floating Zoom & GPS Action Buttons */}
          <View style={styles.floatingActions} pointerEvents="box-none">
            <TouchableOpacity
              style={styles.floatingActionBtn}
              onPress={() => setZoom(prev => Math.min(prev + 1, 18))}
              activeOpacity={0.8}
            >
              <Ionicons name="add" size={22} color="#1F2937" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.floatingActionBtn}
              onPress={() => setZoom(prev => Math.max(prev - 1, 13))}
              activeOpacity={0.8}
            >
              <Ionicons name="remove" size={22} color="#1F2937" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.floatingActionBtn, styles.gpsActionBtn]}
              onPress={handleLocateMe}
              activeOpacity={0.8}
              disabled={isLocatingGps}
            >
              {isLocatingGps ? (
                <ActivityIndicator size="small" color={COLORS.primary} />
              ) : (
                <Ionicons name="navigate" size={20} color={COLORS.primary} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom Swiggy / Zomato Verified Location Card */}
        <View style={styles.bottomSheetCard}>
          <View style={styles.sheetHandleBar} />

          <View style={styles.locationInfoRow}>
            <View style={styles.locationIconCircle}>
              <Ionicons name="location" size={24} color={COLORS.primary} />
            </View>

            <View style={styles.locationDetails}>
              <View style={styles.locationTitleRow}>
                <Text style={styles.locationTitle}>
                  {language === 'ta' ? 'தேர்வு செய்யப்பட்ட இடம்' : 'Selected Location'}
                </Text>
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark-circle" size={12} color="#059669" />
                  <Text style={styles.verifiedText}>GPS</Text>
                </View>
              </View>

              <Text style={styles.addressString} numberOfLines={2}>
                {addressText || (language === 'ta' ? 'இருப்பிடம் கண்டறியப்படுகிறது...' : 'Locating address...')}
              </Text>

              {isResolvingAddress && (
                <View style={styles.resolvingRow}>
                  <ActivityIndicator size="small" color={COLORS.primary} style={{ marginRight: 5 }} />
                  <Text style={styles.resolvingText}>
                    {language === 'ta' ? 'முகவரி எடுக்கப்படுகிறது...' : 'Fetching address details...'}
                  </Text>
                </View>
              )}

              {/* Coordinates Pill */}
              <View style={styles.coordsPill}>
                <Ionicons name="navigate-circle" size={12} color="#10B981" />
                <Text style={styles.coordsPillText}>
                  {`${Number(currentLat).toFixed(4)}° N, ${Number(currentLng).toFixed(4)}° E`}
                </Text>
              </View>
            </View>
          </View>

          {/* Big Confirm Location Button (Swiggy / Zomato style) */}
          <TouchableOpacity
            style={styles.confirmLocationBtn}
            activeOpacity={0.85}
            onPress={handleConfirm}
          >
            <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.confirmLocationBtnText}>
              {language === 'ta' ? 'இந்த இடத்தை உறுதி செய்' : 'Confirm Location'}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    backgroundColor: '#FFFFFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  headerBackBtn: {
    padding: 6,
    marginRight: 8,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 1,
  },
  mapTypeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    gap: 4,
  },
  mapTypeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  mapViewport: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#E5E7EB',
    overflow: 'hidden',
  },
  tileCanvas: {
    ...StyleSheet.absoluteFillObject,
  },
  topTapHint: {
    position: 'absolute',
    top: 14,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(17, 24, 39, 0.85)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    elevation: 4,
  },
  topTapHintText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  centerPinWrapper: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -22,
    marginTop: -50,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 99,
  },
  pinTooltip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginBottom: -4,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
  pinTooltipText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  targetPulseDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#3B82F6',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    marginTop: -8,
    elevation: 4,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
  },
  dpadContainer: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderRadius: 50,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  dpadMiddleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dpadBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
  },
  dpadCenterDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  floatingActions: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    gap: 10,
  },
  floatingActionBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  gpsActionBtn: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
  },
  bottomSheetCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  sheetHandleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
    alignSelf: 'center',
    marginBottom: 12,
  },
  locationInfoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  locationIconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  locationDetails: {
    flex: 1,
  },
  locationTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  locationTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 3,
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
  },
  addressString: {
    fontSize: 13,
    color: '#374151',
    lineHeight: 18,
    fontWeight: '500',
    marginBottom: 6,
  },
  resolvingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  resolvingText: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '600',
  },
  coordsPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 4,
  },
  coordsPillText: {
    fontSize: 11,
    color: '#4B5563',
    fontWeight: '600',
  },
  confirmLocationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 14,
    elevation: 3,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  confirmLocationBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
});
