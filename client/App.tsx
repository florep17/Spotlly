import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LoginScreen } from './src/screens/LoginScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppEntrance } from './src/components/AppEntrance';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { DarkModeContext, useDarkMode, useThemeColors } from './src/theme/theme';
import { SearchScreen } from './src/screens/SearchScreen';
import { BookingScreen } from './src/screens/BookingScreen';
import { AddSpotScreen } from './src/screens/AddSpotScreen';
import { ReservationsScreen } from './src/screens/ReservationsScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { BottomTabBar, TabName } from './src/components/BottomTabBar';
import { ParkingSpot, BackendSpotResponse } from './src/types/spot';

import { authService } from './src/services/api/authService';

const DARK_MODE_KEY = 'spotlly.darkMode';

export default function App() {
  const [darkMode, setDarkMode] = useState(false);
  const themeChanged = useRef(false);

  useEffect(() => {
    let mounted = true;
    AsyncStorage.getItem(DARK_MODE_KEY)
      .then((saved) => {
        if (mounted && !themeChanged.current) setDarkMode(saved === 'true');
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  const handleDarkModeChange = (enabled: boolean) => {
    themeChanged.current = true;
    setDarkMode(enabled);
    AsyncStorage.setItem(DARK_MODE_KEY, String(enabled)).catch(() => {});
  };

  return (
    <DarkModeContext.Provider value={darkMode}>
      <SpotllyApp onDarkModeChange={handleDarkModeChange} />
    </DarkModeContext.Provider>
  );
}

function SpotllyApp({ onDarkModeChange }: { onDarkModeChange: (enabled: boolean) => void }) {
  const darkMode = useDarkMode();
  const colors = useThemeColors();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const closeSettings = useCallback(() => setSettingsOpen(false), []);
  const [userEmail, setUserEmail] = useState<string>('');
  const [userNick, setUserNick] = useState<string>('');
  const [activeTab, setActiveTab] = useState<TabName>('search');
  const [selectedSpotForBooking, setSelectedSpotForBooking] = useState<ParkingSpot | null>(null);

  const handleLoginSuccess = (email: string, nickname?: string) => {
    setUserEmail(email);
    setUserNick(nickname || '');
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    authService.logout();
    setUserEmail('');
    setUserNick('');
    setIsLoggedIn(false);
    closeSettings();
    setSelectedSpotForBooking(null);
    setActiveTab('search');
  };

  // Bridge: BackendSpotResponse -> ParkingSpot for the booking screen
  const handleSelectSpot = (spot: BackendSpotResponse) => {
    const bridged: ParkingSpot = {
      id: spot.id,
      title: spot.title,
      description: spot.access_instructions || '',
      address: spot.address_street,
      city: spot.address_city,
      postalCode: '',
      latitude: Number(spot.latitude),
      longitude: Number(spot.longitude),
      hourlyPrice: Number(spot.hourly_rate),
      spotType: (spot.spot_type as ParkingSpot['spotType']) || 'OUTDOOR',
      isCovered: spot.spot_type === 'GARAGE' || spot.spot_type === 'UNDERGROUND',
      isSecure: true,
      fitsSuv: spot.max_vehicle_size === 'SUV' || spot.max_vehicle_size === 'VAN',
      rating: 0,
      reviewCount: 0,
      walkingMinutes: 0,
      hostName: 'Host',
      isHostVerified: false,
      imageUrl: '',
      availableFrom: '00:00',
      availableTo: '23:59',
    };
    setSelectedSpotForBooking(bridged);
  };

  const handleBackToSearch = () => {
    setSelectedSpotForBooking(null);
  };

  const handleBookingSuccess = () => {
    setSelectedSpotForBooking(null);
    setActiveTab('reservations');
  };

  const handleAddSpotSuccess = () => {
    setActiveTab('search');
  };

  const handleTabChange = (tab: TabName) => {
    setSelectedSpotForBooking(null);
    closeSettings();
    setActiveTab(tab);
  };

  if (!isLoggedIn) {
    return (
      <View style={[styles.container, { backgroundColor: colors.surface }]}>
        <StatusBar style="light" />
        <LoginScreen onLoginSuccess={handleLoginSuccess} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <StatusBar style={darkMode ? 'light' : 'dark'} />
      <AppEntrance>
        <View style={styles.content}>
          {selectedSpotForBooking ? (
            <BookingScreen
              spot={selectedSpotForBooking}
              onBack={handleBackToSearch}
              onBookingSuccess={handleBookingSuccess}
            />
          ) : (
            <>
              {activeTab === 'search' && <SearchScreen onSelectSpot={handleSelectSpot} />}
              {activeTab === 'reservations' && <ReservationsScreen />}
              {activeTab === 'add' && <AddSpotScreen onSuccess={handleAddSpotSuccess} />}
              {activeTab === 'account' &&
                (settingsOpen ? (
                  <SettingsScreen
                    userNickname={userNick}
                    onBack={closeSettings}
                    onDarkModeChange={onDarkModeChange}
                  />
                ) : (
                  <ProfileScreen
                    userEmail={userEmail}
                    onLogout={handleLogout}
                    onOpenSettings={() => setSettingsOpen(true)}
                  />
                ))}
            </>
          )}
        </View>

        {!selectedSpotForBooking && (
          <BottomTabBar activeTab={activeTab} onTabChange={handleTabChange} />
        )}
      </AppEntrance>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});
