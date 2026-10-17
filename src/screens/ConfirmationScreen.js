import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { useLanguage } from '../context/LanguageContext';
import { useApp } from '../context/AppContext';
import { makePhoneCall } from '../constants/contactInfo';

export default function ConfirmationScreen() {
  const { language, t } = useLanguage();
  const {
    navigateTo,
    lastSubmittedComplaint,
    complaints,
    setSelectedComplaintId,
  } = useApp();

  const currentComplaint = lastSubmittedComplaint || complaints[0];
  const ticketId = currentComplaint.id;
  const categoryName = t(currentComplaint.categoryKey || currentComplaint.category);
  const dateStr = language === 'ta' ? currentComplaint.fullDateTimeTa : currentComplaint.fullDateTimeEn;
  const locationStr = language === 'ta' ? currentComplaint.locationTa : currentComplaint.locationEn;

  const handleTrackComplaint = () => {
    setSelectedComplaintId(ticketId);
    navigateTo('main', { tab: 'track' });
  };

  const handleBackToHome = () => {
    navigateTo('main', { tab: 'home' });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.container}>
        <View style={styles.content}>
          {/* Green Checkmark Circle */}
          <View style={styles.successIconWrapper}>
            <View style={styles.successCircle}>
              <Ionicons name="checkmark" size={40} color="#FFFFFF" />
            </View>
          </View>

          {/* Heading */}
          <Text style={styles.title}>{t('complaintSubmittedTitle')}</Text>
          <Text style={styles.subtitle}>{t('complaintSubmittedDesc')}</Text>

          {/* Complaint Ticket Card */}
          <View style={styles.ticketCard}>
            <Text style={styles.ticketLabel}>{t('complaintTicketId')}</Text>
            <Text style={styles.ticketId}>{ticketId}</Text>
          </View>

          {/* Summary Details */}
          <View style={styles.summaryContainer}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{t('category')}</Text>
              <Text style={styles.summaryValue}>{categoryName}</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{t('submittedDate')}</Text>
              <Text style={styles.summaryValue}>{dateStr}</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{t('location')}</Text>
              <Text style={styles.summaryValue} numberOfLines={1}>{locationStr}</Text>
            </View>
          </View>

          {/* TVK Grievance Helpline Support Box */}
          <View style={styles.helplineBox}>
            <View style={styles.helplineHeaderRow}>
              <Ionicons name="call" size={13} color={COLORS.primary} />
              <Text style={styles.helplineTitle}>
                {language === 'ta' ? 'உடனடி உதவிக்கு த.வெ.க உதவி எண்கள்:' : 'For urgent queries, call TVK Helpline:'}
              </Text>
            </View>
            <View style={styles.helplineNumbersRow}>
              <TouchableOpacity
                style={styles.helplineBtn}
                onPress={() => makePhoneCall('+917904950915')}
                activeOpacity={0.7}
              >
                <Ionicons name="call-outline" size={12} color="#1F2937" />
                <Text style={styles.helplineBtnText}>+91 79049 50915</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.helplineBtn}
                onPress={() => makePhoneCall('+919042541054')}
                activeOpacity={0.7}
              >
                <Ionicons name="logo-whatsapp" size={12} color="#16A34A" />
                <Text style={styles.helplineBtnText}>+91 90425 41054</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.trackButton}
            activeOpacity={0.85}
            onPress={handleTrackComplaint}
          >
            <Text style={styles.trackButtonText}>{t('trackComplaintBtn')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.homeButton}
            activeOpacity={0.7}
            onPress={handleBackToHome}
          >
            <Text style={styles.homeButtonText}>{t('backToHome')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingVertical: 32,
  },
  content: {
    alignItems: 'center',
    paddingTop: 20,
  },
  successIconWrapper: {
    marginBottom: 20,
  },
  successCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 19,
    paddingHorizontal: 12,
    marginBottom: 24,
  },
  ticketCard: {
    width: '100%',
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    paddingVertical: 18,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 24,
  },
  ticketLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B7280',
    letterSpacing: 1,
    marginBottom: 6,
  },
  ticketId: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 0.5,
  },
  summaryContainer: {
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  summaryLabel: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 13,
    color: '#111827',
    fontWeight: '600',
    maxWidth: '65%',
    textAlign: 'right',
  },
  buttonContainer: {
    width: '100%',
  },
  trackButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 12,
    elevation: 3,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  trackButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  homeButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  homeButtonText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '600',
  },
  helplineBox: {
    width: '100%',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 14,
    padding: 12,
    marginTop: 18,
  },
  helplineHeaderRow: {
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
  helplineNumbersRow: {
    flexDirection: 'row',
    gap: 10,
  },
  helplineBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingVertical: 8,
    borderRadius: 10,
    gap: 5,
  },
  helplineBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1F2937',
  },
});
