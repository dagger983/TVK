// src/context/AppContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_COMPLAINTS, INITIAL_NOTIFICATIONS } from '../data/mockData';
import {
  saveUserProfile,
  createComplaintInDb,
  fetchComplaintsFromDb,
  fetchComplaintUpdates,
  subscribeToComplaint,
} from '../services/supabaseService';
import {
  saveUserSession,
  getUserSession,
  clearUserSession,
} from '../services/localStorageService';
import { performGoogleSignOut } from '../services/googleAuthService';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Navigation State
  // Screens: 'splash' | 'login' | 'phone-verification' | 'user-details' | 'main' | 'submit-complaint' | 'confirmation' | 'complaint-details' | 'notifications'
  const [currentScreen, setCurrentScreen] = useState('splash');
  const [screenHistory, setScreenHistory] = useState(['splash']);
  
  // Active Tab in Main: 'home' | 'complaints' | 'track' | 'profile'
  const [activeTab, setActiveTab] = useState('home');
  
  // Selected complaint for details / track
  const [selectedComplaintId, setSelectedComplaintId] = useState('TN-2026-004821');
  const [lastSubmittedComplaint, setLastSubmittedComplaint] = useState(null);
  
  // Data State
  const [complaints, setComplaints] = useState(INITIAL_COMPLAINTS);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  
  // Pending Google Login Data: { id, name, email, avatar_url }
  const [pendingGoogleUser, setPendingGoogleUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Settings & Profile
  const [pushNotificationsEnabled, setPushNotificationsEnabled] = useState(true);
  const [userProfile, setUserProfile] = useState({
    id: 'user_tvk_demo',
    name: 'Karthik Selvam',
    email: 'karthik.selvam@gmail.com',
    initials: 'KS',
    avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    phone: '+91 98765 43210',
    district: 'Chennai',
    ward: 'Ward 4, Anna Nagar',
  });

  // Check stored local session for Auto-Login on mount
  useEffect(() => {
    async function checkAutoLogin() {
      try {
        const session = await getUserSession();
        if (session && session.isLoggedIn && session.user) {
          console.log('✅ Auto-login: Restored local user session for', session.user.name);
          setUserProfile(session.user);
          setIsAuthenticated(true);
          // Navigate straight into the app!
          setCurrentScreen('main');
          setActiveTab('home');
          setScreenHistory(['main']);
        }
      } catch (err) {
        console.warn('Auto-login session check error:', err);
      }
    }
    checkAutoLogin();
  }, []);

  // Try loading live complaints from Supabase on mount
  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetchComplaintsFromDb();
        if (res.success && res.data && res.data.length > 0) {
          // Format DB rows into app format
          const formatted = res.data.map(row => ({
            id: row.id,
            category: row.category,
            categoryKey: row.category_key || row.category,
            status: row.status,
            titleEn: row.title_en,
            titleTa: row.title_ta || row.title_en,
            descEn: row.desc_en,
            descTa: row.desc_ta || row.desc_en,
            locationEn: row.landmark_en || 'Chennai',
            locationTa: row.landmark_ta || 'சென்னை',
            dateEn: new Date(row.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            dateTa: new Date(row.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            fullDateTimeEn: new Date(row.created_at).toLocaleString(),
            fullDateTimeTa: new Date(row.created_at).toLocaleString(),
            latitude: row.latitude,
            longitude: row.longitude,
            googleMapsUrl: row.google_maps_url,
            media: (row.photos && row.photos.length > 0) ? row.photos : [require('../../assets/sample-damaged-pole.jpg')],
            adminUpdates: row.complaint_updates || [],
            officialUpdate: row.complaint_updates && row.complaint_updates.length > 0 ? {
              en: {
                title: row.complaint_updates[0].title_en,
                desc: row.complaint_updates[0].message_en,
              },
              ta: {
                title: row.complaint_updates[0].title_ta || row.complaint_updates[0].title_en,
                desc: row.complaint_updates[0].message_ta || row.complaint_updates[0].message_en,
              },
              adminPhotos: row.complaint_updates[0].admin_photos || [],
            } : null,
            timeline: [
              { id: '1', titleKey: 'step1Title', descKey: 'step1Desc', timeKey: 'step1Time', status: 'completed' },
              { id: '2', titleKey: 'step2Title', descKey: 'step2Desc', timeKey: 'step2Time', status: row.status === 'resolved' ? 'completed' : 'active' },
              { id: '3', titleKey: 'step3Title', descKey: 'step3Desc', timeKey: 'step3Time', status: row.status === 'resolved' ? 'completed' : 'pending' },
              { id: '4', titleKey: 'step4Title', descKey: 'step4Desc', timeKey: 'step4Time', status: row.status === 'resolved' ? 'completed' : 'pending' },
              { id: '5', titleKey: 'step5Title', descKey: 'step5Desc', timeKey: 'step5Time', status: row.status === 'resolved' ? 'completed' : 'pending' },
            ],
          }));

          setComplaints(formatted);
          if (formatted[0]) {
            setSelectedComplaintId(formatted[0].id);
          }
        }
      } catch (err) {
        console.warn('Initial DB load exception:', err);
      }
    }
    loadData();
  }, []);

  // Listen to realtime updates for the selected complaint
  useEffect(() => {
    if (!selectedComplaintId) return;
    const unsubscribe = subscribeToComplaint(selectedComplaintId, async () => {
      // Refresh updates for this complaint
      const res = await fetchComplaintUpdates(selectedComplaintId);
      if (res.success && res.data) {
        setComplaints(prev => prev.map(c => {
          if (c.id === selectedComplaintId) {
            const latest = res.data[0];
            return {
              ...c,
              adminUpdates: res.data,
              officialUpdate: latest ? {
                en: { title: latest.title_en, desc: latest.message_en },
                ta: { title: latest.title_ta || latest.title_en, desc: latest.message_ta || latest.message_en },
                adminPhotos: latest.admin_photos || [],
              } : c.officialUpdate,
            };
          }
          return c;
        }));
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [selectedComplaintId]);

  // Handle Google Sign In initiation
  const handleGoogleLogin = (googleData) => {
    setPendingGoogleUser(googleData);
    navigateTo('phone-verification');
  };

  // Complete Auth by saving mobile number + Google profile into local storage and Supabase
  const completeAuthWithPhone = async (phoneNumber) => {
    const formattedPhone = phoneNumber.startsWith('+91') ? phoneNumber : `+91 ${phoneNumber}`;
    
    const updatedProfile = {
      ...userProfile,
      ...(pendingGoogleUser || {}),
      phone: formattedPhone,
      initials: (pendingGoogleUser?.name || userProfile.name)
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2),
    };

    setUserProfile(updatedProfile);
    setIsAuthenticated(true);

    // Save to local storage (AsyncStorage) immediately for persistence
    await saveUserSession(updatedProfile);

    // Save to Supabase DB in parallel
    await saveUserProfile(updatedProfile);

    // Navigate to Home screen
    navigateTo('main', { tab: 'home' });
  };

  // Update user profile and persist changes to local storage & Supabase
  const updateUserProfile = async (newFields) => {
    const merged = { ...userProfile, ...newFields };
    setUserProfile(merged);
    await saveUserSession(merged);
    await saveUserProfile(merged);
    return merged;
  };

  // Logout and clear all stored user data
  const logoutUser = async () => {
    await clearUserSession();
    await performGoogleSignOut();
    setIsAuthenticated(false);
    setUserProfile({
      id: 'guest',
      name: 'Guest Citizen',
      email: '',
      initials: 'GC',
      avatar_url: null,
      phone: '',
      district: 'Chennai',
      ward: 'Ward 4, Anna Nagar',
    });
    setScreenHistory(['login']);
    setCurrentScreen('login');
  };

  // Navigation helpers
  const navigateTo = (screen, params = {}) => {
    if (params.complaintId) {
      setSelectedComplaintId(params.complaintId);
    }
    if (params.tab) {
      setActiveTab(params.tab);
    }
    setScreenHistory(prev => [...prev, screen]);
    setCurrentScreen(screen);
  };

  const goBack = () => {
    if (screenHistory.length > 1) {
      const newHistory = [...screenHistory];
      newHistory.pop();
      const prevScreen = newHistory[newHistory.length - 1];
      setScreenHistory(newHistory);
      setCurrentScreen(prevScreen);
    } else {
      setCurrentScreen('main');
    }
  };

  const switchTab = (tab) => {
    setActiveTab(tab);
    if (currentScreen !== 'main') {
      setCurrentScreen('main');
    }
  };

  // Add new complaint
  const addNewComplaint = async (newGrievance) => {
    const complaintId = `TN-2026-${String(Math.floor(100000 + Math.random() * 900000)).slice(0, 6)}`;
    const googleMapsUrl = newGrievance.googleMapsUrl ||
      (newGrievance.latitude && newGrievance.longitude
        ? `https://www.google.com/maps?q=${newGrievance.latitude},${newGrievance.longitude}`
        : null);

    const complaintObj = {
      id: complaintId,
      category: newGrievance.category || 'streetLights',
      categoryKey: newGrievance.category || 'streetLights',
      status: 'inProgress',
      titleEn: newGrievance.title || 'Civic Issue Reported',
      titleTa: newGrievance.title || 'புகார் பதிவு செய்யப்பட்டுள்ளது',
      descEn: newGrievance.description || 'Grievance submitted by resident.',
      descTa: newGrievance.description || 'குடிமகனால் புகார் சமர்ப்பிக்கப்பட்டது.',
      locationEn: newGrievance.landmark || 'Ward 4, Anna Nagar, Chennai',
      locationTa: newGrievance.landmark || 'வார்டு 4, அண்ணா நகர், சென்னை',
      dateEn: 'Today',
      dateTa: 'இன்று',
      fullDateTimeEn: new Date().toLocaleString(),
      fullDateTimeTa: new Date().toLocaleString(),
      latitude: newGrievance.latitude,
      longitude: newGrievance.longitude,
      googleMapsUrl: googleMapsUrl,
      media: (newGrievance.media && newGrievance.media.length > 0)
        ? newGrievance.media
        : [require('../../assets/sample-damaged-pole.jpg')],
      adminUpdates: [],
      officialUpdate: {
        en: {
          title: 'Assigned to Ward Engineer',
          desc: 'Inspection team notified for immediate verification.',
        },
        ta: {
          title: 'வார்டு பொறியாளருக்கு ஒதுக்கப்பட்டுள்ளது',
          desc: 'உடனடி ஆய்வுக்கு குழுவிற்கு தகவல் அனுப்பப்பட்டுள்ளது.',
        },
        adminPhotos: [],
      },
      timeline: [
        { id: '1', titleKey: 'step1Title', descKey: 'step1Desc', timeKey: 'step1Time', status: 'completed' },
        { id: '2', titleKey: 'step2Title', descKey: 'step2Desc', timeKey: 'step2Time', status: 'active' },
        { id: '3', titleKey: 'step3Title', descKey: 'step3Desc', timeKey: 'step3Time', status: 'pending' },
        { id: '4', titleKey: 'step4Title', descKey: 'step4Desc', timeKey: 'step4Time', status: 'pending' },
        { id: '5', titleKey: 'step5Title', descKey: 'step5Desc', timeKey: 'step5Time', status: 'pending' },
      ],
    };

    // Update local state immediately for instant responsive UI
    setComplaints(prev => [complaintObj, ...prev]);
    setLastSubmittedComplaint(complaintObj);
    setSelectedComplaintId(complaintObj.id);

    // Save to Supabase Database
    await createComplaintInDb({
      id: complaintId,
      userId: userProfile.id,
      category: complaintObj.category,
      categoryKey: complaintObj.categoryKey,
      title: complaintObj.titleEn,
      description: complaintObj.descEn,
      landmark: complaintObj.locationEn,
      latitude: newGrievance.latitude,
      longitude: newGrievance.longitude,
      googleMapsUrl: googleMapsUrl,
      photos: Array.isArray(newGrievance.media)
        ? newGrievance.media.filter(m => typeof m === 'string')
        : [],
    });

    // Add to notifications
    const newNotif = {
      id: `notif-${Date.now()}`,
      complaintId: complaintObj.id,
      titleKey: 'notificationItem4Title',
      descKey: 'notificationItem4Desc',
      timeKey: 'notificationItem1Time',
      unread: true,
      icon: 'document-text',
      iconColor: '#D32F2F',
    };
    setNotifications(prev => [newNotif, ...prev]);

    return complaintObj;
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const getComplaintById = (id) => {
    return complaints.find(c => c.id === id) || complaints[0];
  };

  return (
    <AppContext.Provider
      value={{
        currentScreen,
        setCurrentScreen,
        navigateTo,
        goBack,
        activeTab,
        switchTab,
        complaints,
        selectedComplaintId,
        setSelectedComplaintId,
        lastSubmittedComplaint,
        addNewComplaint,
        getComplaintById,
        notifications,
        markAllNotificationsRead,
        pushNotificationsEnabled,
        setPushNotificationsEnabled,
        userProfile,
        setUserProfile,
        updateUserProfile,
        logoutUser,
        isAuthenticated,
        pendingGoogleUser,
        handleGoogleLogin,
        completeAuthWithPhone,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
