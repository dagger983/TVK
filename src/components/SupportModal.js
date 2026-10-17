import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { useLanguage } from '../context/LanguageContext';
import { TVK_HELPLINE_NUMBERS, makePhoneCall, openWhatsAppChat } from '../constants/contactInfo';

export default function SupportModal({ visible, onClose }) {
  const { language } = useLanguage();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.overlay} edges={['bottom']}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.iconCircle}>
                <Ionicons name="call" size={20} color={COLORS.primary} />
              </View>
              <View>
                <Text style={styles.title}>
                  {language === 'ta' ? 'மக்கள் குறைதீர்ப்பு உதவி எண்கள்' : 'TVK Citizen Helpline Numbers'}
                </Text>
                <Text style={styles.subtitle}>
                  {language === 'ta' ? 'அவசர உதவி மற்றும் நேரடி தொடர்புக்கு' : 'Direct Call & WhatsApp Support 24/7'}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color="#4B5563" />
            </TouchableOpacity>
          </View>

          {/* Numbers List */}
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContainer}>
            {TVK_HELPLINE_NUMBERS.map((item) => (
              <View key={item.id} style={styles.numberCard}>
                <View style={styles.cardTopRow}>
                  <View style={styles.labelContainer}>
                    <Text style={styles.numberLabel}>
                      {language === 'ta' ? item.labelTa : item.labelEn}
                    </Text>
                    <Text style={styles.numberAvailability}>
                      {language === 'ta' ? item.availableTimeTa : item.availableTimeEn}
                    </Text>
                  </View>
                  <View style={styles.badge247}>
                    <Text style={styles.badge247Text}>24/7</Text>
                  </View>
                </View>

                {/* Big Phone Number Display */}
                <Text style={styles.phoneNumberText}>{item.number}</Text>

                {/* Action Buttons Row */}
                <View style={styles.actionsRow}>
                  <TouchableOpacity
                    style={styles.callBtn}
                    activeOpacity={0.8}
                    onPress={() => makePhoneCall(item.number)}
                  >
                    <Ionicons name="call" size={15} color="#FFFFFF" style={{ marginRight: 6 }} />
                    <Text style={styles.callBtnText}>
                      {language === 'ta' ? 'அழைக்க' : 'Call Now'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.whatsappBtn}
                    activeOpacity={0.8}
                    onPress={() => openWhatsAppChat(item.cleanNumber)}
                  >
                    <Ionicons name="logo-whatsapp" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                    <Text style={styles.whatsappBtnText}>WhatsApp</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            <View style={styles.footerNoteBox}>
              <Ionicons name="shield-checkmark" size={16} color="#059669" />
              <Text style={styles.footerNoteText}>
                {language === 'ta'
                  ? 'உங்கள் புகார்கள் நகராட்சி & த.வெ.க களப் பராமரிப்புக் குழுவின் நேரடி கண்காணிப்பில் பதிவு செய்யப்படும்.'
                  : 'Grievances are tracked by TVK field teams and municipal officers for fast resolution.'}
              </Text>
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 32,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  subtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
  },
  listContainer: {
    paddingBottom: 10,
  },
  numberCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    marginBottom: 14,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  labelContainer: {
    flex: 1,
  },
  numberLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
  },
  numberAvailability: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 1,
  },
  badge247: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  badge247Text: {
    fontSize: 10,
    fontWeight: '800',
    color: '#059669',
  },
  phoneNumberText: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: 0.8,
    marginVertical: 8,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  callBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    borderRadius: 12,
  },
  callBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  whatsappBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#16A34A',
    paddingVertical: 10,
    borderRadius: 12,
  },
  whatsappBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  footerNoteBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DCFCE7',
    marginTop: 6,
    gap: 8,
  },
  footerNoteText: {
    fontSize: 11,
    color: '#166534',
    flex: 1,
    lineHeight: 16,
    fontWeight: '500',
  },
});
