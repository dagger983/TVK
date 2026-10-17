import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useApp } from '../context/AppContext';
import BottomTabBar from '../components/BottomTabBar';
import HomeScreen from './HomeScreen';
import MyComplaintsScreen from './MyComplaintsScreen';
import TrackComplaintScreen from './TrackComplaintScreen';
import ProfileScreen from './ProfileScreen';

export default function MainScreen() {
  const { activeTab } = useApp();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {activeTab === 'home' && <HomeScreen />}
        {activeTab === 'complaints' && <MyComplaintsScreen />}
        {activeTab === 'track' && <TrackComplaintScreen />}
        {activeTab === 'profile' && <ProfileScreen />}
      </View>
      <BottomTabBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
});
