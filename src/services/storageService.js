// src/services/storageService.js
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

/**
 * Pick an image from photo library
 */
export async function pickImageFromGallery(language = 'ta') {
  try {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        language === 'ta' ? 'அனுமதி தேவை' : 'Permission Required',
        language === 'ta'
          ? 'புகைப்படத்தை தேர்ந்தெடுக்க கேலரி அனுமதியை வழங்கவும்.'
          : 'Please grant gallery access to select grievance photos.'
      );
      return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      return result.assets[0].uri;
    }
    return null;
  } catch (error) {
    console.warn('Image picker error:', error.message);
    return null;
  }
}

/**
 * Capture photo directly with camera
 */
export async function capturePhotoFromCamera(language = 'ta') {
  try {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        language === 'ta' ? 'அனுமதி தேவை' : 'Permission Required',
        language === 'ta'
          ? 'புகைப்படம் எடுக்க கேமரா அனுமதியை வழங்கவும்.'
          : 'Please grant camera access to take photo.'
      );
      return null;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      return result.assets[0].uri;
    }
    return null;
  } catch (error) {
    console.warn('Camera error:', error.message);
    return null;
  }
}

import { uploadImageToFirebaseStorage, uploadComplaintPhotosBatch } from './firebaseStorageService';

/**
 * Upload photo to Firebase Storage
 * Returns the public Firebase Storage download URL ready for Supabase database storage
 */
export async function uploadComplaintPhoto(localUri, complaintId = 'temp') {
  if (!localUri) return null;
  return await uploadImageToFirebaseStorage(localUri, `complaints/${complaintId}_${Date.now()}.jpg`);
}

export { uploadImageToFirebaseStorage, uploadComplaintPhotosBatch };
