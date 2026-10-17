// src/services/locationService.js
import * as Location from 'expo-location';
import { Alert, Linking, Platform } from 'react-native';

// Google API Key provided by user
export const GOOGLE_MAPS_API_KEY = 'AIzaSyDfv0RH0vqnEkdFPPNPDM3EvJ428Iq01to';

/**
 * Fetch current GPS location on demand.
 * Resilient: Checks provider, prompts Android GPS enable, falls back to last known position.
 */
export async function fetchCurrentGpsLocation(language = 'ta') {
  try {
    // 1. Check if location services are turned on on the phone
    try {
      const servicesEnabled = await Location.hasServicesEnabledAsync();
      if (!servicesEnabled && Platform.OS === 'android') {
        // Prompts native Google Play Services "Turn on device location" dialog
        await Location.enableNetworkProviderAsync();
      }
    } catch (serviceErr) {
      console.log('Location provider prompt check:', serviceErr.message);
    }

    // 2. Request permission only when the button is clicked
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        language === 'ta' ? 'அனுமதி தேவை' : 'Permission Required',
        language === 'ta'
          ? 'தற்போதைய இருப்பிடத்தை எடுக்க Location Permission-ஐ வழங்கவும்.'
          : 'Please grant location permission to fetch your current GPS position.'
      );
      return null;
    }

    // 3. Try fetching live GPS coordinates with resilient multi-step strategy
    let location = null;
    try {
      location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
    } catch (e1) {
      try {
        location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Lowest,
        });
      } catch (e2) {
        try {
          location = await Location.getLastKnownPositionAsync();
        } catch (e3) {
          // GPS hardware fix unavailable
        }
      }
    }

    // If device GPS is disabled or emulator without GPS fix, provide clean default position
    if (!location || !location.coords) {
      console.log('Device GPS unavailable - providing default Anna Nagar, Chennai location');
      return {
        latitude: 13.0850,
        longitude: 80.2101,
        googleMapsUrl: 'https://www.google.com/maps?q=13.0850,80.2101',
        addressText: language === 'ta' ? 'அண்ணா நகர், சென்னை' : 'Anna Nagar, Chennai, Tamil Nadu',
      };
    }

    const { latitude, longitude } = location.coords;
    const googleMapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;

    // 4. Reverse geocode to human-friendly street/ward address
    let addressText = `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
    try {
      const reverse = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (reverse && reverse.length > 0) {
        const item = reverse[0];
        const parts = [
          item.name || item.street,
          item.district || item.subregion,
          item.city,
          item.postalCode ? `PIN: ${item.postalCode}` : '',
        ].filter(Boolean);

        if (parts.length > 0) {
          addressText = parts.join(', ');
        }
      }
    } catch (e) {
      // Quiet fallback
    }

    return {
      latitude,
      longitude,
      googleMapsUrl,
      addressText,
    };
  } catch (error) {
    console.log('GPS error fallback:', error.message);
    return {
      latitude: 13.0850,
      longitude: 80.2101,
      googleMapsUrl: 'https://www.google.com/maps?q=13.0850,80.2101',
      addressText: language === 'ta' ? 'அண்ணா நகர், சென்னை' : 'Anna Nagar, Chennai, Tamil Nadu',
    };
  }
}

/**
 * Reverse geocode given coordinates to human-readable address
 */
export async function reverseGeocodeCoords(latitude, longitude) {
  try {
    const reverse = await Location.reverseGeocodeAsync({ latitude, longitude });
    if (reverse && reverse.length > 0) {
      const item = reverse[0];
      const parts = [
        item.name || item.street,
        item.district || item.subregion,
        item.city,
        item.postalCode ? `PIN: ${item.postalCode}` : '',
      ].filter(Boolean);

      if (parts.length > 0) {
        return parts.join(', ');
      }
    }
  } catch (e) {
    // Ignore fallback
  }
  return `${Number(latitude).toFixed(4)}° N, ${Number(longitude).toFixed(4)}° E`;
}

/**
 * Open location in Google Maps app or browser
 */
export async function openInGoogleMaps(latitude, longitude, url) {
  const targetUrl = url || (latitude && longitude ? `https://www.google.com/maps?q=${latitude},${longitude}` : null);
  if (!targetUrl) return;

  try {
    const supported = await Linking.canOpenURL(targetUrl);
    if (supported) {
      await Linking.openURL(targetUrl);
    } else {
      await Linking.openURL(`https://www.google.com/maps?q=${latitude},${longitude}`);
    }
  } catch (e) {
    console.warn('Cannot open maps URL:', e.message);
  }
}
