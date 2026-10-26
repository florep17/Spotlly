import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SearchScreen } from './src/screens/SearchScreen';
import { BookingScreen } from './src/screens/BookingScreen';
import { AddSpotScreen } from './src/screens/AddSpotScreen';
import { ReservationsScreen } from './src/screens/ReservationsScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { BottomTabBar, TabName } from './src/components/BottomTabBar';
import { ParkingSpot } from './src/types/spot';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabName>('search');
  const [selectedSpotForBooking, setSelectedSpotForBooking] = useState<ParkingSpot | null>(null);

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
            {activeTab === 'account' && <ProfileScreen />}
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
