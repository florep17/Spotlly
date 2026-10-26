import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Booking } from '../types/booking';
import { bookingsService } from '../services/api/bookingsService';

export const ReservationsScreen: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    bookingsService.getUserBookings().then(setBookings);
  }, []);

  const handleShowAccessCode = (booking: Booking) => {
    Alert.alert(
      'Instrukcja wjazdu 🔑',
      `${booking.accessCode || 'Kod: 4821#'}\n\nWjedź w bramę po lewej stronie, pilot do szlabanu w skrytce. Numer stanowiska: 14.`,
      [{ text: 'Rozumiem' }]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Twoje Rezerwacje</Text>
        <Text style={styles.headerSub}>Zarządzaj aktywnymi i przeszłymi postojami</Text>
      </View>

      <ScrollView contentContainerStyle={styles.list}>
        {bookings.map((booking) => (
          <View key={booking.id} style={styles.bookingCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.spotTitle}>{booking.spotTitle}</Text>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>{booking.status}</Text>
              </View>
            </View>

            <Text style={styles.address}>📍 {booking.spotAddress}</Text>

            <View style={styles.timeInfoRow}>
              <View style={styles.timeInfoBlock}>
                <Text style={styles.timeLabel}>Data i godziny:</Text>
                <Text style={styles.timeValue}>Dziś, 10:00 – 13:00 (3h)</Text>
              </View>

              <View style={styles.priceBlock}>
                <Text style={styles.priceLabel}>Opłacono:</Text>
                <Text style={styles.priceValue}>{booking.totalPrice.toFixed(2)} PLN</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.accessButton}
              onPress={() => handleShowAccessCode(booking)}
            >
              <Text style={styles.accessButtonText}>🔑 Pokaż instrukcję wjazdu (kod PIN)</Text>
            </TouchableOpacity>
          </View>
        ))}

        {bookings.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🚗</Text>
            <Text style={styles.emptyTitle}>Brak aktywnych rezerwacji</Text>
            <Text style={styles.emptySub}>Wyszukaj miejsce na mapie, aby zarezerwować postój.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
  },
  headerSub: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  list: {
    padding: 16,
  },
  bookingCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    padding: 16,
    marginBottom: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  spotTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111827',
  },
  statusBadge: {
    backgroundColor: '#d1fae5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#065f46',
  },
  address: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 12,
  },
  timeInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f9fafb',
    padding: 10,
    borderRadius: 10,
    marginBottom: 14,
  },
  timeInfoBlock: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 11,
    color: '#6b7280',
  },
  timeValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
    marginTop: 2,
  },
  priceBlock: {
    alignItems: 'flex-end',
  },
  priceLabel: {
    fontSize: 11,
    color: '#6b7280',
  },
  priceValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1b5e3a',
    marginTop: 2,
  },
  accessButton: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1.5,
    borderColor: '#10b981',
    borderRadius: 12,
    paddingVertical: 11,
    alignItems: 'center',
  },
  accessButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#065f46',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  emptySub: {
    fontSize: 13,
    color: '#6b7280',
    textAlign: 'center',
  },
});
