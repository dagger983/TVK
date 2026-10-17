import React from 'react';
import { View, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { LanguageProvider } from './src/context/LanguageContext';
import { AppProvider, useApp } from './src/context/AppContext';

// Screens
import SplashScreen from './src/screens/SplashScreen';
import LoginScreen from './src/screens/LoginScreen';
import PhoneVerificationScreen from './src/screens/PhoneVerificationScreen';
import UserDetailsScreen from './src/screens/UserDetailsScreen';
import MainScreen from './src/screens/MainScreen';
import SubmitComplaintScreen from './src/screens/SubmitComplaintScreen';
import ConfirmationScreen from './src/screens/ConfirmationScreen';
import ComplaintDetailsScreen from './src/screens/ComplaintDetailsScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';

function AppRoot() {
  const { currentScreen } = useApp();

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      {currentScreen === 'splash' && <SplashScreen />}
      {currentScreen === 'login' && <LoginScreen />}
      {currentScreen === 'phone-verification' && <PhoneVerificationScreen />}
      {currentScreen === 'user-details' && <UserDetailsScreen />}
      {currentScreen === 'main' && <MainScreen />}
      {currentScreen === 'submit-complaint' && <SubmitComplaintScreen />}
      {currentScreen === 'confirmation' && <ConfirmationScreen />}
      {currentScreen === 'complaint-details' && <ComplaintDetailsScreen />}
      {currentScreen === 'notifications' && <NotificationsScreen />}
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <LanguageProvider>
        <AppProvider>
          <AppRoot />
        </AppProvider>
      </LanguageProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});
