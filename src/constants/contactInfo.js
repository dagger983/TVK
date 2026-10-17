// src/constants/contactInfo.js
import { Linking, Alert } from 'react-native';

export const TVK_HELPLINE_NUMBERS = [
  {
    id: '1',
    number: '+91 79049 50915',
    cleanNumber: '917904950915',
    labelTa: 'முதன்மை குறைதீர்ப்பு உதவி எண்',
    labelEn: 'Primary Grievance Helpline',
    availableTimeTa: '24/7 பொதுமக்கள் சேவை',
    availableTimeEn: '24/7 Citizen Support',
  },
  {
    id: '2',
    number: '+91 90425 41054',
    cleanNumber: '919042541054',
    labelTa: 'அவசர உதவி & WhatsApp புகார் எண்',
    labelEn: 'Emergency & WhatsApp Helpline',
    availableTimeTa: 'நேரடி அழைப்பு & வாட்ஸ்அப்',
    availableTimeEn: 'Direct Call & WhatsApp',
  },
];

/**
 * Open direct phone dialer
 */
export async function makePhoneCall(phoneNumber) {
  const clean = phoneNumber.replace(/[^0-9+]/g, '');
  const url = `tel:${clean}`;
  try {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert('Phone Call', `Please dial: ${phoneNumber}`);
    }
  } catch (e) {
    console.warn('Cannot open dialer:', e);
    Alert.alert('Phone Call', `Please dial: ${phoneNumber}`);
  }
}

/**
 * Open WhatsApp chat with prefilled message
 */
export async function openWhatsAppChat(cleanNumber, message = 'வணக்கம், TVK மக்கள் குரல் புகார் தொடர்பாக தொடர்பு கொள்கிறேன்.') {
  const url = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
  try {
    await Linking.openURL(url);
  } catch (e) {
    console.warn('Cannot open WhatsApp:', e);
    Alert.alert('WhatsApp', `Please message: +${cleanNumber}`);
  }
}
