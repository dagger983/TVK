// src/screens/TrackComplaintScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  Image,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { useLanguage } from '../context/LanguageContext';
import { useApp } from '../context/AppContext';

export default function TrackComplaintScreen() {
  const { language, t } = useLanguage();
  const {
    complaints,
    selectedComplaintId,
    setSelectedComplaintId,
    getComplaintById,
    navigateTo,
  } = useApp();

  const [searchInput, setSearchInput] = useState('');
  const [activePhotoModal, setActivePhotoModal] = useState(null);
  const [searchError, setSearchError] = useState('');

  const complaint = getComplaintById(selectedComplaintId) || complaints[0];

  const title = language === 'ta' ? (complaint.titleTa || complaint.titleEn) : complaint.titleEn;
  const dateStr = language === 'ta' ? (complaint.dateTa || complaint.dateEn) : complaint.dateEn;
  const categoryLabel = t(complaint.categoryKey || complaint.category);
  const isResolved = complaint.status === 'resolved';

  const officialUpdate = language === 'ta'
    ? (complaint.officialUpdate?.ta || complaint.officialUpdate?.en)
    : complaint.officialUpdate?.en;

  const adminPhotosList = [
    ...(complaint.officialUpdate?.adminPhotos || []),
    ...(complaint.adminUpdates?.flatMap(u => u.admin_photos || []) || []),
  ].filter((v, i, a) => a.indexOf(v) === i);

  // Search handler
  const handleSearch = () => {
    const q = searchInput.trim().toUpperCase();
    if (!q) {
      setSearchError('');
      return;
    }
    const found = complaints.find(c => c.id.toUpperCase().includes(q));
    if (found) {
      setSelectedComplaintId(found.id);
      setSearchError('');
    } else {
      setSearchError(language === 'ta'
        ? `"${q}" என்ற புகார் எண் கிடைக்கவில்லை.`
        : `No complaint found with ticket "${q}".`);
    }
  };

  /**
   * Helper to format human-readable, dynamic timeline steps
   */
  const getTimelineStepData = (stepIndex, status) => {
    const isStepCompleted = status === 'completed';
    const isStepActive = status === 'active';

    switch (stepIndex) {
      case 0: // Step 1: Registered / Submitted
        return {
          title: language === 'ta' ? '1. புகார் பதிவு செய்யப்பட்டது' : '1. Grievance Submitted',
          desc: language === 'ta'
            ? 'பொதுமக்கள் குறைதீர்ப்பு அமைப்பில் புகார் வெற்றிகரமாக பதிவானது.'
            : 'Complaint successfully registered on citizen portal.',
          time: complaint.fullDateTimeTa || complaint.fullDateTimeEn || dateStr,
        };
      case 1: // Step 2: Desk Verification
        return {
          title: language === 'ta' ? '2. ஆவணங்கள் சரிபார்க்கப்பட்டது' : '2. Administrative Verification',
          desc: language === 'ta'
            ? 'புகார் விவரங்கள் மற்றும் அமைவிடம் அலுவலரால் சரிபார்க்கப்பட்டது.'
            : 'Details and location verified by municipal desk team.',
          time: isStepCompleted
            ? (complaint.dateTa || complaint.dateEn || (language === 'ta' ? 'சரிபார்க்கப்பட்டது' : 'Verified'))
            : (isStepActive ? (language === 'ta' ? 'சரிபார்ப்பு நடப்பில்' : 'Under Review') : (language === 'ta' ? 'நிலுவையில்' : 'Pending')),
        };
      case 2: // Step 3: Assigned to Ward Engineer
        return {
          title: language === 'ta' ? '3. வார்டு உதவிப் பொறியாளருக்கு ஒதுக்கீடு' : '3. Assigned to Ward Engineer',
          desc: language === 'ta'
            ? (complaint.locationTa ? `${complaint.locationTa} பிரிவு பொறியாளருக்கு உத்தரவு பிறப்பிக்கப்பட்டது.` : 'உதவி பொறியாளருக்கு ஒதுக்கப்பட்டு ஆய்வு உத்தரவிடப்பட்டது.')
            : 'Assigned to Ward Assistant Engineer for site inspection.',
          time: isStepCompleted
            ? (language === 'ta' ? 'பொறியாளர் நியமிக்கப்பட்டார்' : 'Officer Assigned')
            : (isStepActive ? (language === 'ta' ? 'பரிசீலனையில்' : 'Assigning') : (language === 'ta' ? 'நிலுவையில்' : 'Pending')),
        };
      case 3: // Step 4: Maintenance in progress
        return {
          title: language === 'ta' ? '4. களப் பராமரிப்புப் பணி நடப்பில் உள்ளது' : '4. Field Inspection & Maintenance',
          desc: language === 'ta'
            ? 'தொழில்நுட்ப பராமரிப்புக் குழுவினர் களத்திற்கு சென்று சீரமைப்புப் பணிகளை மேற்கொண்டுள்ளனர்.'
            : 'Maintenance crew dispatched on-site for immediate resolution.',
          time: isStepCompleted
            ? (language === 'ta' ? 'களப்பணி நிறைவுற்றது' : 'Field Work Done')
            : (isStepActive ? (language === 'ta' ? 'களப்பணி நடப்பில் உள்ளது' : 'In Progress') : (language === 'ta' ? 'நிலுவையில்' : 'Pending')),
        };
      case 4: // Step 5: Resolved
        return {
          title: language === 'ta' ? '5. பிரச்சினை வெற்றிகரமாக தீர்க்கப்பட்டது' : '5. Issue Successfully Resolved',
          desc: language === 'ta'
            ? 'பிரச்சினை முழுமையாக சீரமைக்கப்பட்டு ஆய்வு புகைப்படங்களுடன் தீர்வு காணப்பட்டது.'
            : 'Grievance completely resolved with verification proof photos.',
          time: isResolved
            ? (complaint.dateTa || complaint.dateEn || (language === 'ta' ? 'நிறைவுற்றது ✓' : 'Resolved ✓'))
            : (language === 'ta' ? 'நிலுவையில்' : 'Pending'),
        };
      default:
        return { title: '', desc: '', time: '' };
    }
  };

  // Derive active timeline states based on complaint.status
  const computedTimeline = [
    { id: '1', status: 'completed' },
    { id: '2', status: isResolved ? 'completed' : 'completed' },
    { id: '3', status: isResolved ? 'completed' : (complaint.status === 'inProgress' ? 'completed' : 'active') },
    { id: '4', status: isResolved ? 'completed' : (complaint.status === 'inProgress' ? 'active' : 'pending') },
    { id: '5', status: isResolved ? 'completed' : 'pending' },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Header Title */}
        <View style={styles.headerTitleRow}>
          <Text style={styles.pageTitle}>{t('trackGrievance')}</Text>
          <Text style={styles.pageSubTitle}>
            {language === 'ta'
              ? 'புகாரின் தற்போதைய நிலையை நேரலையாக கண்காணிக்கவும்'
              : 'Track grievance progress and inspection milestones in real-time'}
          </Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            value={searchInput}
            onChangeText={(text) => {
              setSearchInput(text);
              if (searchError) setSearchError('');
            }}
            placeholder={t('searchTicketPlaceholder')}
            placeholderTextColor="#9CA3AF"
            onSubmitEditing={handleSearch}
            autoCapitalize="characters"
          />
          <TouchableOpacity onPress={handleSearch} style={styles.searchActionBtn}>
            <Ionicons name="arrow-forward" size={16} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {/* Search Error banner */}
        {searchError !== '' && (
          <View style={styles.searchErrorBanner}>
            <Ionicons name="alert-circle" size={16} color="#DC2626" />
            <Text style={styles.searchErrorText}>{searchError}</Text>
          </View>
        )}

        {/* Quick Ticket Switcher Chips */}
        <View style={styles.ticketSelectorSection}>
          <Text style={styles.selectorLabel}>
            {language === 'ta' ? 'சமீபத்திய புகார்கள்:' : 'Select Ticket:'}
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
            {complaints.slice(0, 5).map((c) => {
              const isSelected = c.id === complaint.id;
              return (
                <TouchableOpacity
                  key={c.id}
                  style={[styles.ticketChip, isSelected && styles.ticketChipActive]}
                  onPress={() => {
                    setSelectedComplaintId(c.id);
                    setSearchError('');
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.ticketChipText, isSelected && styles.ticketChipTextActive]}>
                    {c.id}
                  </Text>
                  {c.status === 'resolved' && (
                    <Ionicons name="checkmark-circle" size={12} color={isSelected ? '#FFFFFF' : '#10B981'} style={{ marginLeft: 3 }} />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Active Ticket Card */}
        <TouchableOpacity
          style={styles.ticketCard}
          activeOpacity={0.85}
          onPress={() => navigateTo('complaint-details', { complaintId: complaint.id })}
        >
          <View style={styles.ticketCardHeader}>
            <View style={styles.ticketIdRow}>
              <Ionicons name="document-text-outline" size={16} color={COLORS.primary} />
              <Text style={styles.ticketIdText}>{complaint.id}</Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                isResolved ? styles.statusBadgeResolved : styles.statusBadgeInProgress,
              ]}
            >
              <Text
                style={[
                  styles.statusBadgeText,
                  isResolved ? styles.statusTextResolved : styles.statusTextInProgress,
                ]}
              >
                {isResolved ? t('resolvedStatus') : t('inProgress')}
              </Text>
            </View>
          </View>

          <Text style={styles.ticketTitle} numberOfLines={2}>
            {title}
          </Text>

          <View style={styles.ticketFooter}>
            <View style={styles.footerLeft}>
              <Ionicons name="pricetag-outline" size={13} color="#6B7280" />
              <Text style={styles.ticketCategory}>
                {categoryLabel}
              </Text>
            </View>
            <View style={styles.footerRight}>
              <Ionicons name="calendar-outline" size={13} color="#9CA3AF" />
              <Text style={styles.ticketDate}>{dateStr}</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Official Admin Progress Card with Photos */}
        {officialUpdate && (
          <View style={styles.adminUpdateCard}>
            <View style={styles.updateCardHeader}>
              <Ionicons name="shield-checkmark" size={15} color={COLORS.primary} />
              <Text style={styles.updateCardBadge}>
                {language === 'ta' ? 'அதிகாரியின் நேரடி அறிக்கை' : 'Official Inspection Update'}
              </Text>
            </View>

            <Text style={styles.updateCardTitle}>{officialUpdate.title}</Text>
            <Text style={styles.updateCardDesc}>{officialUpdate.desc}</Text>

            {/* Admin Proof Photos */}
            {adminPhotosList.length > 0 && (
              <View style={styles.adminPhotosContainer}>
                <Text style={styles.adminPhotosSub}>
                  {language === 'ta'
                    ? `கள ஆய்வு புகைப்படங்கள் (${adminPhotosList.length}):`
                    : `Inspection Photos from Admin (${adminPhotosList.length}):`}
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.photosRow}>
                  {adminPhotosList.map((photo, pIdx) => {
                    const source = typeof photo === 'string' ? { uri: photo } : photo;
                    return (
                      <TouchableOpacity
                        key={pIdx}
                        activeOpacity={0.8}
                        onPress={() => setActivePhotoModal(source)}
                        style={styles.photoThumbWrapper}
                      >
                        <Image source={source} style={styles.photoThumb} resizeMode="cover" />
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            )}
          </View>
        )}

        {/* Status Timeline */}
        <View style={styles.timelineSection}>
          <View style={styles.timelineHeaderRow}>
            <Ionicons name="git-commit-outline" size={18} color={COLORS.primary} />
            <Text style={styles.timelineSectionTitle}>{t('statusTimeline')}</Text>
          </View>

          <View style={styles.timelineContainer}>
            {computedTimeline.map((step, index) => {
              const isLast = index === computedTimeline.length - 1;
              const isCompleted = step.status === 'completed';
              const isActive = step.status === 'active';
              const isPending = step.status === 'pending';

              const stepData = getTimelineStepData(index, step.status);

              return (
                <View key={step.id} style={styles.timelineItem}>
                  {/* Left Column: Icon and connecting line */}
                  <View style={styles.timelineIndicatorColumn}>
                    {isCompleted ? (
                      <View style={styles.completedIconCircle}>
                        <Ionicons name="checkmark" size={13} color="#FFFFFF" />
                      </View>
                    ) : isActive ? (
                      <View style={styles.activeOuterCircle}>
                        <View style={styles.activeInnerDot} />
                      </View>
                    ) : (
                      <View style={styles.pendingCircle} />
                    )}

                    {!isLast && (
                      <View
                        style={[
                          styles.timelineLine,
                          isCompleted ? styles.timelineLineCompleted : styles.timelineLinePending,
                        ]}
                      />
                    )}
                  </View>

                  {/* Right Column: Step details */}
                  <View style={[styles.timelineContentColumn, !isLast && styles.timelineContentWithSpacing]}>
                    <View style={styles.stepHeaderRow}>
                      <Text
                        style={[
                          styles.stepTitle,
                          isActive && styles.stepTitleActive,
                          isPending && styles.stepTitlePending,
                        ]}
                      >
                        {stepData.title}
                      </Text>
                      <View style={[styles.timeBadge, isCompleted && styles.timeBadgeCompleted]}>
                        <Text style={[styles.stepTimeText, isCompleted && styles.stepTimeTextCompleted]}>
                          {stepData.time}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.stepDescText}>{stepData.desc}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Fullscreen Photo Modal */}
      <Modal visible={!!activePhotoModal} transparent animationType="fade">
        <TouchableOpacity
          style={styles.fullscreenModal}
          activeOpacity={1}
          onPress={() => setActivePhotoModal(null)}
        >
          <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setActivePhotoModal(null)}>
            <Ionicons name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          {activePhotoModal && (
            <Image
              source={activePhotoModal}
              style={styles.fullscreenImage}
              resizeMode="contain"
            />
          )}
        </TouchableOpacity>
      </Modal>
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
    paddingBottom: 24,
  },
  headerTitleRow: {
    marginBottom: 14,
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
  },
  pageSubTitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 10,
    ...COLORS.cardShadow,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 11,
    fontSize: 14,
    color: '#1F2937',
  },
  searchActionBtn: {
    padding: 6,
  },
  searchErrorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginBottom: 12,
    gap: 6,
  },
  searchErrorText: {
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '600',
    flex: 1,
  },
  ticketSelectorSection: {
    marginBottom: 14,
  },
  selectorLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4B5563',
    marginBottom: 6,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  ticketChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  ticketChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  ticketChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4B5563',
  },
  ticketChipTextActive: {
    color: '#FFFFFF',
  },
  ticketCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
    ...COLORS.cardShadow,
  },
  ticketCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ticketIdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ticketIdText: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.primary,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeInProgress: {
    backgroundColor: '#FFF7ED',
  },
  statusBadgeResolved: {
    backgroundColor: '#ECFDF5',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  statusTextInProgress: {
    color: '#EA580C',
  },
  statusTextResolved: {
    color: '#059669',
  },
  ticketTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 10,
    lineHeight: 20,
  },
  ticketFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ticketCategory: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  footerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ticketDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  adminUpdateCard: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },
  updateCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 6,
  },
  updateCardBadge: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 0.5,
  },
  updateCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  updateCardDesc: {
    fontSize: 12,
    color: '#4B5563',
    lineHeight: 17,
  },
  adminPhotosContainer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#FEE2E2',
  },
  adminPhotosSub: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primaryDark,
    marginBottom: 8,
  },
  photosRow: {
    flexDirection: 'row',
    gap: 10,
  },
  photoThumbWrapper: {
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  photoThumb: {
    width: 68,
    height: 68,
  },
  timelineSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...COLORS.cardShadow,
  },
  timelineHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 18,
  },
  timelineSectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
  },
  timelineContainer: {
    paddingLeft: 4,
  },
  timelineItem: {
    flexDirection: 'row',
  },
  timelineIndicatorColumn: {
    alignItems: 'center',
    width: 26,
  },
  completedIconCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  activeOuterCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FEE2E2',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  activeInnerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
  pendingCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#D1D5DB',
    zIndex: 2,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    minHeight: 38,
    marginVertical: 2,
  },
  timelineLineCompleted: {
    backgroundColor: '#10B981',
  },
  timelineLinePending: {
    backgroundColor: '#E5E7EB',
  },
  timelineContentColumn: {
    flex: 1,
    marginLeft: 14,
  },
  timelineContentWithSpacing: {
    paddingBottom: 22,
  },
  stepHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  stepTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
  },
  stepTitleActive: {
    color: COLORS.primary,
  },
  stepTitlePending: {
    color: '#9CA3AF',
  },
  timeBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  timeBadgeCompleted: {
    backgroundColor: '#ECFDF5',
  },
  stepTimeText: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '600',
  },
  stepTimeTextCompleted: {
    color: '#059669',
  },
  stepDescText: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
  },
  fullscreenModal: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseBtn: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 10,
  },
  fullscreenImage: {
    width: '90%',
    height: '75%',
  },
});
