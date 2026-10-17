// src/services/firebaseStorageService.js

export const FIREBASE_STORAGE_BUCKET = 'manavai-2adb5.firebasestorage.app';

/**
 * Upload an image (local URI, base64, or blob) directly to Firebase Storage via REST API.
 * Returns the direct, public download URL with access token.
 * 
 * @param {string} localUri - The file URI from expo-image-picker (e.g. 'file:///...')
 * @param {string} storagePath - Destination path in bucket (e.g. 'complaints/image_123.jpg')
 * @returns {Promise<string|null>} - The Firebase Storage download URL
 */
export async function uploadImageToFirebaseStorage(localUri, storagePath = '') {
  if (!localUri) return null;

  // If already a remote URL (http/https), return as is
  if (localUri.startsWith('http://') || localUri.startsWith('https://')) {
    return localUri;
  }

  const fileName = storagePath || `complaints/complaint_${Date.now()}_${Math.floor(Math.random() * 1000)}.jpg`;

  try {
    console.log(`📤 Uploading image to Firebase Storage [${fileName}]...`);

    // 1. Fetch file as blob in React Native / Expo
    const response = await fetch(localUri);
    const blob = await response.blob();

    // 2. Firebase Storage REST Upload Endpoint
    const uploadUrl = `https://firebasestorage.googleapis.com/v0/b/${FIREBASE_STORAGE_BUCKET}/o?name=${encodeURIComponent(fileName)}`;

    const uploadRes = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'image/jpeg',
      },
      body: blob,
    });

    if (!uploadRes.ok) {
      const errorText = await uploadRes.text();
      console.warn('⚠️ Firebase Storage upload failed:', uploadRes.status, errorText);
      return localUri; // Fallback to local URI so UI does not break
    }

    const data = await uploadRes.json();
    const token = data.downloadTokens || '';

    // 3. Construct permanent public Firebase Storage download URL
    const downloadUrl = `https://firebasestorage.googleapis.com/v0/b/${data.bucket}/o/${encodeURIComponent(data.name)}?alt=media${token ? `&token=${token}` : ''}`;

    console.log('✅ Firebase Storage upload successful! Download URL:', downloadUrl);
    return downloadUrl;
  } catch (error) {
    console.warn('⚠️ Firebase Storage exception:', error.message);
    return localUri; // Fallback to local URI
  }
}

/**
 * Upload multiple complaint photos in batch to Firebase Storage
 * 
 * @param {Array<string>} photosList - Array of local image URIs
 * @param {string} complaintId - e.g. 'TN-2026-004821'
 * @returns {Promise<Array<string>>} - Array of Firebase Storage download URLs
 */
export async function uploadComplaintPhotosBatch(photosList, complaintId = 'temp') {
  if (!photosList || !Array.isArray(photosList) || photosList.length === 0) {
    return [];
  }

  const uploadPromises = photosList.map(async (photo, idx) => {
    if (typeof photo === 'string') {
      const path = `complaints/${complaintId}_photo_${idx}_${Date.now()}.jpg`;
      const url = await uploadImageToFirebaseStorage(photo, path);
      return url || photo;
    }
    return photo;
  });

  return Promise.all(uploadPromises);
}
