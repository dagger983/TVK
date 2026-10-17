import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { useLanguage } from '../context/LanguageContext';
import { useApp } from '../context/AppContext';
import ComplaintCard from '../components/ComplaintCard';

export default function MyComplaintsScreen() {
  const { language, t } = useLanguage();
  const { complaints, navigateTo } = useApp();

  const [activeFilter, setActiveFilter] = useState('active'); // 'all' | 'active' | 'resolved'
  const [searchQuery, setSearchQuery] = useState('');

  const filterTabs = [
    { key: 'all', labelKey: 'tabAll' },
    { key: 'active', labelKey: 'tabActive' },
    { key: 'resolved', labelKey: 'tabResolved' },
  ];

  const filteredComplaints = complaints.filter(item => {
    // Tab filter
    if (activeFilter === 'active' && item.status !== 'inProgress') return false;
    if (activeFilter === 'resolved' && item.status !== 'resolved') return false;

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const title = (language === 'ta' ? (item.titleTa || item.titleEn) : item.titleEn).toLowerCase();
      const id = item.id.toLowerCase();
      return title.includes(q) || id.includes(q);
    }
    return true;
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.container}>
        {/* Page Title */}
        <View style={styles.headerTitleRow}>
          <Text style={styles.pageTitle}>{t('myGrievances')}</Text>
        </View>

        {/* Filter Pills */}
        <View style={styles.filterTabsRow}>
          {filterTabs.map(tab => {
            const isSelected = activeFilter === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[styles.filterPill, isSelected && styles.filterPillActive]}
                activeOpacity={0.8}
                onPress={() => setActiveFilter(tab.key)}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    isSelected && styles.filterPillTextActive,
                  ]}
                >
                  {t(tab.labelKey)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Search Bar with Filter Icon */}
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={t('searchComplaints')}
            placeholderTextColor="#9CA3AF"
          />
          <TouchableOpacity style={styles.filterIconBtn}>
            <Ionicons name="options-outline" size={18} color="#4B5563" />
          </TouchableOpacity>
        </View>

        {/* List of Complaints */}
        <FlatList
          data={filteredComplaints}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <ComplaintCard
              complaint={item}
              onPress={() => navigateTo('complaint-details', { complaintId: item.id })}
            />
          )}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="document-text-outline" size={48} color="#D1D5DB" />
              <Text style={styles.emptyText}>
                {language === 'ta' ? 'புகார்கள் எதுவும் இல்லை' : 'No grievances found'}
              </Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  headerTitleRow: {
    marginBottom: 16,
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
  },
  filterTabsRow: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterPillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
  },
  filterPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 16,
    ...COLORS.cardShadow,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1F2937',
  },
  filterIconBtn: {
    padding: 6,
  },
  listContainer: {
    paddingBottom: 24,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '500',
  },
});
