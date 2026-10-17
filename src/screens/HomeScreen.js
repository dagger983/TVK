import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { CATEGORIES } from '../data/mockData';
import { useLanguage } from '../context/LanguageContext';
import { useApp } from '../context/AppContext';
import ComplaintCard from '../components/ComplaintCard';
import ResolvedComplaintsCarousel from '../components/ResolvedComplaintsCarousel';
import SupportModal from '../components/SupportModal';
import { TVK_HELPLINE_NUMBERS, makePhoneCall, openWhatsAppChat } from '../constants/contactInfo';

export default function HomeScreen() {
  const { language, t } = useLanguage();
  const {
    navigateTo,
    switchTab,
    complaints,
    notifications,
    userProfile,
  } = useApp();

  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const unreadCount = notifications.filter(n => n.unread).length;

  // Active / Submitted / Resolved counts
  const submittedCount = 12; // as in design
  const activeCount = complaints.filter(c => c.status === 'inProgress').length || 4;
  const resolvedCount = complaints.filter(c => c.status === 'resolved').length || 8;

  // Recent complaints (take first 2)
  const recentComplaints = complaints.slice(0, 2);

  const handleCategoryPress = (category) => {
    navigateTo('submit-complaint', { categoryId: category.id });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Top Header */}
        <View style={styles.topHeader}>
          <View>
            <Text style={styles.greetingText}>{t('vanakkam')}</Text>
            <Text style={styles.userNameText}>{userProfile.name}</Text>
          </View>

          <View style={styles.headerRightActions}>
            <TouchableOpacity
              style={styles.headerHelplineBtn}
              activeOpacity={0.7}
              onPress={() => setIsSupportModalOpen(true)}
            >
              <Ionicons name="call" size={13} color={COLORS.primary} />
              <Text style={styles.headerHelplineBtnText}>
                {language === 'ta' ? 'உதவி எண்' : 'Helpline'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.notificationBtn}
              activeOpacity={0.7}
              onPress={() => navigateTo('notifications')}
            >
              <Ionicons name="notifications-outline" size={22} color={COLORS.text} />
              {unreadCount > 0 && <View style={styles.notificationBadge} />}
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick TVK Helpline Contact Strip */}
        <View style={styles.helplineQuickStrip}>
          <View style={styles.helplineBadge}>
            <View style={styles.pulseDot} />
            <Text style={styles.helplineBadgeText}>
              {language === 'ta' ? 'உதவி' : 'Support'}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.quickNumberPill}
            onPress={() => makePhoneCall('+917904950915')}
            activeOpacity={0.7}
          >
            <Ionicons name="call" size={11} color={COLORS.primary} />
            <Text style={styles.quickNumberText}>+91 79049 50915</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickNumberPill}
            onPress={() => openWhatsAppChat('919042541054')}
            activeOpacity={0.7}
          >
            <Ionicons name="logo-whatsapp" size={12} color="#16A34A" />
            <Text style={styles.quickNumberText}>+91 90425 41054</Text>
          </TouchableOpacity>
        </View>

        {/* Resolved Complaints Carousel Banner (Directly above the 3 status cards) */}
        <ResolvedComplaintsCarousel />

        {/* Stats Row */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, styles.statCardSubmitted]}>
            <Text style={styles.statLabel}>{t('submitted')}</Text>
            <Text style={[styles.statNumber, { color: '#E11D48' }]}>{submittedCount}</Text>
          </View>

          <View style={[styles.statCard, styles.statCardActive]}>
            <Text style={styles.statLabel}>{t('active')}</Text>
            <Text style={[styles.statNumber, { color: '#EA580C' }]}>{activeCount}</Text>
          </View>

          <View style={[styles.statCard, styles.statCardResolved]}>
            <Text style={styles.statLabel}>{t('resolved')}</Text>
            <Text style={[styles.statNumber, { color: '#10B981' }]}>{resolvedCount}</Text>
          </View>
        </View>

        {/* Big Report Button */}
        <TouchableOpacity
          style={styles.reportButton}
          activeOpacity={0.85}
          onPress={() => navigateTo('submit-complaint')}
        >
          <Ionicons name="megaphone-outline" size={20} color="#FFFFFF" style={styles.reportIcon} />
          <Text style={styles.reportButtonText}>{t('reportComplaint')}</Text>
        </TouchableOpacity>

        {/* Complaint Categories */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('complaintCategories')}</Text>
        </View>

        <View style={styles.categoriesGrid}>
          {CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={styles.categoryCard}
              activeOpacity={0.7}
              onPress={() => handleCategoryPress(category)}
            >
              <View style={styles.categoryIconCircle}>
                <Ionicons name={category.icon} size={20} color={COLORS.primary} />
              </View>
              <Text style={styles.categoryName} numberOfLines={1}>
                {t(category.nameKey)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* My Recent Complaints */}
        <View style={styles.recentHeaderRow}>
          <Text style={styles.sectionTitle}>{t('myRecentComplaints')}</Text>
          <TouchableOpacity onPress={() => switchTab('complaints')} activeOpacity={0.7}>
            <Text style={styles.viewAllText}>{t('viewAll')}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.recentList}>
          {recentComplaints.map((complaint) => (
            <ComplaintCard
              key={complaint.id}
              complaint={complaint}
              onPress={() => navigateTo('complaint-details', { complaintId: complaint.id })}
            />
          ))}
        </View>
      </ScrollView>

      {/* TVK Support & Helpline Modal */}
      <SupportModal
        visible={isSupportModalOpen}
        onClose={() => setIsSupportModalOpen(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  greetingText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  userNameText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
    fontWeight: '500',
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerHelplineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 20,
    gap: 4,
  },
  headerHelplineBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  helplineQuickStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    marginBottom: 16,
    gap: 8,
    ...COLORS.cardShadow,
  },
  helplineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  helplineBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#374151',
  },
  quickNumberPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
    paddingVertical: 5,
    paddingHorizontal: 6,
    borderRadius: 8,
    gap: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  quickNumberText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1F2937',
  },
  notificationBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    ...COLORS.cardShadow,
  },
  notificationBadge: {
    position: 'absolute',
    top: 9,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    ...COLORS.cardShadow,
  },
  statCardSubmitted: {
    borderLeftWidth: 3,
    borderLeftColor: '#E11D48',
  },
  statCardActive: {
    borderLeftWidth: 3,
    borderLeftColor: '#EA580C',
  },
  statCardResolved: {
    borderLeftWidth: 3,
    borderLeftColor: '#10B981',
  },
  statLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 4,
    fontWeight: '600',
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '800',
  },
  reportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 14,
    marginBottom: 22,
    elevation: 4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  reportIcon: {
    marginRight: 8,
  },
  reportButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 22,
    rowGap: 10,
  },
  categoryCard: {
    width: '23%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    ...COLORS.cardShadow,
  },
  categoryIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  categoryName: {
    fontSize: 10,
    color: '#374151',
    fontWeight: '600',
    textAlign: 'center',
  },
  recentHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  viewAllText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '700',
  },
  recentList: {
    marginBottom: 10,
  },
});
