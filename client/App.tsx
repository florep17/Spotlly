import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LoginScreen } from './src/screens/LoginScreen';
import { LoggedInScreen } from './src/screens/LoggedInScreen';
import { SearchScreen } from './src/screens/SearchScreen';
import { BookingScreen } from './src/screens/BookingScreen';
import { AddSpotScreen } from './src/screens/AddSpotScreen';
import { ReservationsScreen } from './src/screens/ReservationsScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { BottomTabBar, TabName } from './src/components/BottomTabBar';
import { ParkingSpot } from './src/types/spot';

type AuthState = 'unauthenticated' | 'logged_in_splash' | 'main_app';

export default function App() {
  const [authState, setAuthState] = useState<AuthState>('unauthenticated');
  const [userEmail, setUserEmail] = useState<string>('kierowca@spotly.io');
  const [userNick, setUserNick] = useState<string>('');
  const [activeTab, setActiveTab] = useState<TabName>('search');
  const [selectedSpotForBooking, setSelectedSpotForBooking] = useState<ParkingSpot | null>(null);

  const handleLoginSuccess = (email: string, nickname?: string) => {
    setUserEmail(email);
    setUserNick(nickname || '');
    setAuthState('logged_in_splash');
  };

  const handleEnterApp = () => {
    setAuthState('main_app');
  };

  const handleLogout = () => {
    setAuthState('unauthenticated');
    setSelectedSpotForBooking(null);
    setActiveTab('search');
  };

  const handleSelectSpot = (spot: ParkingSpot) => {
    setSelectedSpotForBooking(spot);
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
    setActiveTab(tab);
  };

  // 1. Unauthenticated -> Show Login Screen with aesthetic background
  if (authState === 'unauthenticated') {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <LoginScreen onLoginSuccess={handleLoginSuccess} />
      </View>
    );
  }

  // 2. Logged in splash -> Show clean white "Zalogowano pomyślnie" confirmation screen
  if (authState === 'logged_in_splash') {
    return (
      <View style={styles.container}>
        <StatusBar style="dark" />
        <LoggedInScreen
          email={userEmail}
          nickname={userNick}
          onEnterApp={handleEnterApp}
          onLogout={handleLogout}
        />
      </View>
    );
  }

  // 3. Main Application Flow (Search, Reservations, Add Spot, Profile)
  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

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
            {activeTab === 'account' && (
              <ProfileScreen userEmail={userEmail} onLogout={handleLogout} />
            )}
          </>
        )}
      </View>

      {!selectedSpotForBooking && (
        <BottomTabBar activeTab={activeTab} onTabChange={handleTabChange} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
  },
});
