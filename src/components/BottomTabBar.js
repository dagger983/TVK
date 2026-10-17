import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { useLanguage } from '../context/LanguageContext';
import { useApp } from '../context/AppContext';

export default function BottomTabBar() {
  const { t } = useLanguage();
  const { activeTab, switchTab } = useApp();

  const tabs = [
    { key: 'home', labelKey: 'tabHome', icon: 'home', iconOutline: 'home-outline' },
    { key: 'complaints', labelKey: 'tabComplaints', icon: 'document-text', iconOutline: 'document-text-outline' },
    { key: 'track', labelKey: 'tabTrack', icon: 'navigate', iconOutline: 'navigate-outline' },
    { key: 'profile', labelKey: 'tabProfile', icon: 'person', iconOutline: 'person-outline' },
  ];

  return (
    <SafeAreaView edges={['bottom']} style={styles.safeContainer}>
      <View style={styles.container}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={styles.tabButton}
              activeOpacity={0.7}
              onPress={() => switchTab(tab.key)}
            >
              <View style={styles.iconContainer}>
                <Ionicons
                  name={isActive ? tab.icon : tab.iconOutline}
                  size={22}
                  color={isActive ? COLORS.primary : COLORS.textMuted}
                />
                {isActive && <View style={styles.activeDot} />}
              </View>
              <Text
                style={[
                  styles.tabLabel,
                  isActive ? styles.tabLabelActive : styles.tabLabelInactive,
                ]}
                numberOfLines={1}
              >
                {t(tab.labelKey)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  container: {
    flexDirection: 'row',
    height: 56,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    paddingVertical: 4,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    height: 26,
  },
  activeDot: {
    position: 'absolute',
    bottom: -4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.primary,
  },
  tabLabel: {
    fontSize: 11,
    marginTop: 4,
    fontWeight: '500',
  },
  tabLabelActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  tabLabelInactive: {
    color: COLORS.textMuted,
  },
});
