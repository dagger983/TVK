// src/components/ResolvedComplaintsCarousel.js
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { useLanguage } from '../context/LanguageContext';
import { useApp } from '../context/AppContext';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 40; // 20px padding on each side

export default function ResolvedComplaintsCarousel() {
  const { language, t } = useLanguage();
  const { complaints, navigateTo } = useApp();
  const scrollViewRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Filter complaints that have status === 'resolved'
  const allResolved = complaints.filter(c => c.status === 'resolved');

  // Randomly pick 3 resolved complaints or fallback to all resolved
  const [displayItems, setDisplayItems] = useState([]);

  useEffect(() => {
    if (allResolved.length > 0) {
      // Shuffle and pick 3
      const shuffled = [...allResolved].sort(() => 0.5 - Math.random());
      setDisplayItems(shuffled.slice(0, 3));
    }
  }, [complaints.length]);

  // Auto-scroll carousel every 4 seconds
  useEffect(() => {
    if (displayItems.length <= 1) return;

    const timer = setInterval(() => {
      setActiveIndex(prev => {
        const nextIndex = (prev + 1) % displayItems.length;
        if (scrollViewRef.current) {
          scrollViewRef.current.scrollTo({
            x: nextIndex * CARD_WIDTH,
            animated: true,
          });
        }
        return nextIndex;
      });
    }, 4000);

    return () => clearInterval(timer);
  }, [displayItems.length]);

  if (displayItems.length === 0) {
    return null;
  }

  const handleScroll = (event) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / CARD_WIDTH);
    if (index !== activeIndex && index >= 0 && index < displayItems.length) {
      setActiveIndex(index);
    }
  };

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View style={styles.verifiedDot} />
          <Text style={styles.sectionTitle}>{t('resolvedGrievancesTitle')}</Text>
        </View>
        <View style={styles.countBadge}>
          <Text style={styles.countBadgeText}>{`${activeIndex + 1}/${displayItems.length}`}</Text>
        </View>
      </View>

      {/* Swipeable Carousel */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        decelerationRate="fast"
        snapToInterval={CARD_WIDTH}
        snapToAlignment="center"
        contentContainerStyle={styles.scrollContent}
      >
        {displayItems.map((item) => {
          const title = language === 'ta' ? (item.titleTa || item.titleEn) : item.titleEn;
          const location = language === 'ta' ? (item.locationTa || item.locationEn) : item.locationEn;
          const dateStr = language === 'ta' ? (item.dateTa || item.dateEn) : item.dateEn;
          const photoSource = (item.media && item.media[0])
            ? (typeof item.media[0] === 'string' ? { uri: item.media[0] } : item.media[0])
            : require('../../assets/resolved-road.jpg');

          return (
            <TouchableOpacity
              key={item.id}
              style={styles.card}
              activeOpacity={0.92}
              onPress={() => navigateTo('complaint-details', { complaintId: item.id })}
            >
              <Image source={photoSource} style={styles.cardImage} resizeMode="cover" />

              {/* Gradient dark overlay for crystal-clear readability */}
              <LinearGradient
                colors={['rgba(0,0,0,0.2)', 'rgba(0,0,0,0.55)', 'rgba(0,0,0,0.92)']}
                style={styles.gradientOverlay}
              >
                {/* Top Badge Row */}
                <View style={styles.topBadgeRow}>
                  <View style={styles.resolvedBadge}>
                    <Ionicons name="checkmark-circle" size={13} color="#FFFFFF" />
                    <Text style={styles.resolvedBadgeText}>{t('resolvedBannerBadge')}</Text>
                  </View>

                  <View style={styles.tvkSuccessTag}>
                    <Ionicons name="shield-checkmark" size={12} color="#FDE047" />
                    <Text style={styles.tvkSuccessText}>{t('citizenVoiceSuccess')}</Text>
                  </View>
                </View>

                {/* Bottom Content Row */}
                <View style={styles.bottomContent}>
                  <Text style={styles.cardTitle} numberOfLines={2}>
                    {title}
                  </Text>

                  <View style={styles.metaRow}>
                    <View style={styles.locationContainer}>
                      <Ionicons name="location-sharp" size={13} color="#FCA5A5" />
                      <Text style={styles.locationText} numberOfLines={1}>
                        {location}
                      </Text>
                    </View>
                    <Text style={styles.dateText}>{dateStr}</Text>
                  </View>

                  <View style={styles.actionPromptRow}>
                    <Text style={styles.actionPromptText}>{t('viewProofPhotos')}</Text>
                    <Ionicons name="arrow-forward" size={12} color="#FFFFFF" />
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Pagination Dots */}
      <View style={styles.paginationRow}>
        {displayItems.map((_, idx) => (
          <View
            key={idx}
            style={[
              styles.dot,
              idx === activeIndex ? styles.activeDot : styles.inactiveDot,
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  verifiedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: 0.2,
  },
  countBadge: {
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  countBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6B7280',
  },
  scrollContent: {
    alignItems: 'center',
  },
  card: {
    width: CARD_WIDTH,
    height: 175,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#1F2937',
    position: 'relative',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  cardImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  gradientOverlay: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 12,
  },
  topBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resolvedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#059669',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  resolvedBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  tvkSuccessTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 0.8,
    borderColor: 'rgba(253, 224, 71, 0.4)',
    gap: 4,
  },
  tvkSuccessText: {
    color: '#FEF08A',
    fontSize: 10,
    fontWeight: '700',
  },
  bottomContent: {
    width: '100%',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 18,
    marginBottom: 6,
    textShadowColor: 'rgba(0,0,0,0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
    gap: 3,
  },
  locationText: {
    fontSize: 11,
    color: '#E5E7EB',
    fontWeight: '600',
    flex: 1,
  },
  dateText: {
    fontSize: 11,
    color: '#D1D5DB',
    fontWeight: '500',
  },
  actionPromptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    marginTop: 2,
  },
  actionPromptText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  paginationRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
  },
  dot: {
    height: 5,
    borderRadius: 3,
  },
  activeDot: {
    width: 20,
    backgroundColor: COLORS.primary,
  },
  inactiveDot: {
    width: 6,
    backgroundColor: '#D1D5DB',
  },
});
