import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { useLanguage } from '../context/LanguageContext';
import { useApp } from '../context/AppContext';
import Header from '../components/Header';

export default function NotificationsScreen() {
  const { t, language } = useLanguage();
  const {
    notifications,
    markAllNotificationsRead,
    navigateTo,
    goBack,
  } = useApp();

  const handleNotificationPress = (item) => {
    if (item.complaintId) {
      navigateTo('complaint-details', { complaintId: item.complaintId });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <Header
        title={t('notifications')}
        showBack
        onBack={goBack}
        rightText={t('markAllRead')}
        onRightPress={markAllNotificationsRead}
      />

      <FlatList
        data={notifications}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => {
          const itemTitle = t(item.titleKey) || item.titleKey;
          const itemDesc = t(item.descKey) || item.descKey;
          const itemTime = t(item.timeKey) || item.timeKey;

          return (
            <TouchableOpacity
              style={[
                styles.notificationCard,
                item.unread && styles.notificationCardUnread,
              ]}
              activeOpacity={0.8}
              onPress={() => handleNotificationPress(item)}
            >
              {/* Icon */}
              <View
                style={[
                  styles.iconCircle,
                  item.unread ? styles.iconCircleUnread : styles.iconCircleRead,
                ]}
              >
                <Ionicons
                  name={item.icon}
                  size={18}
                  color={item.unread ? COLORS.primary : '#6B7280'}
                />
              </View>

              {/* Text content */}
              <View style={styles.contentWrapper}>
                <View style={styles.titleRow}>
                  <Text style={styles.itemTitle} numberOfLines={1}>
                    {itemTitle}
                  </Text>
                  {item.unread && <View style={styles.unreadDot} />}
                </View>

                <Text style={styles.itemDesc} numberOfLines={2}>
                  {itemDesc}
                </Text>

                <Text style={styles.timeText}>{itemTime}</Text>
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-off-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyText}>
              {language === 'ta' ? 'அறிவிப்புகள் எதுவும் இல்லை' : 'No notifications'}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContainer: {
    paddingVertical: 12,
  },
  notificationCard: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  notificationCardUnread: {
    backgroundColor: '#FEF8F8',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  iconCircleUnread: {
    backgroundColor: '#FEE2E2',
  },
  iconCircleRead: {
    backgroundColor: '#F3F4F6',
  },
  contentWrapper: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginLeft: 8,
  },
  itemDesc: {
    fontSize: 12,
    color: '#4B5563',
    lineHeight: 17,
    marginBottom: 6,
  },
  timeText: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    color: '#9CA3AF',
  },
});
