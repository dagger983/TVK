import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../constants/theme';
import { useLanguage } from '../context/LanguageContext';
import { useApp } from '../context/AppContext';

export default function ComplaintCard({ complaint, onPress }) {
  const { language, t } = useLanguage();
  const { navigateTo } = useApp();

  const isResolved = complaint.status === 'resolved';
  const title = language === 'ta' ? (complaint.titleTa || complaint.titleEn) : complaint.titleEn;
  const dateStr = language === 'ta' ? (complaint.dateTa || complaint.dateEn) : complaint.dateEn;
  const categoryLabel = t(complaint.categoryKey || complaint.category);
  const statusLabel = isResolved ? t('resolvedStatus') : t('inProgress');

  const handlePress = () => {
    if (onPress) {
      onPress(complaint);
    } else {
      navigateTo('complaint-details', { complaintId: complaint.id });
    }
  };

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.8}
      onPress={handlePress}
    >
      <View style={styles.headerRow}>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{categoryLabel.toUpperCase()}</Text>
        </View>

        <View
          style={[
            styles.statusBadge,
            isResolved ? styles.statusBadgeResolved : styles.statusBadgeInProgress,
          ]}
        >
          <Text
            style={[
              styles.statusText,
              isResolved ? styles.statusTextResolved : styles.statusTextInProgress,
            ]}
          >
            {statusLabel}
          </Text>
        </View>
      </View>

      <Text style={styles.title} numberOfLines={2}>
        {title}
      </Text>

      <View style={styles.footerRow}>
        <Text style={styles.idText}>{complaint.id}</Text>
        <Text style={styles.dotSeparator}>•</Text>
        <Text style={styles.dateText}>{dateStr}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...COLORS.cardShadow,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#4B5563',
    letterSpacing: 0.5,
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
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  statusTextInProgress: {
    color: '#EA580C',
  },
  statusTextResolved: {
    color: '#059669',
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    lineHeight: 21,
    marginBottom: 10,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  idText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  dotSeparator: {
    marginHorizontal: 8,
    color: COLORS.textMuted,
    fontSize: 12,
  },
  dateText: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
});
