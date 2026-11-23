import { ThemeColors, useThemedStyles } from '../theme/theme';
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { Booking } from '../types/booking';
import { bookingsService } from '../services/api/bookingsService';
import { showMessage } from '../utils/dialogs';

export const ReservationsScreen: React.FC = () => {
  const styles = useThemedStyles(createStyles);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    bookingsService.getUserBookings().then(setBookings).catch((err) => {
      setError(err instanceof Error ? err.message : 'Nie udało się pobrać rezerwacji.');
    });
  }, []);

  const handleShowAccessCode = (booking: Booking) => {
    showMessage(
      'Instrukcja wjazdu 🔑',
      booking.accessCode || 'Instrukcja będzie dostępna 15 minut przed rozpoczęciem rezerwacji.'
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Twoje Rezerwacje</Text>
        <Text style={styles.headerSub}>Zarządzaj aktywnymi i przeszłymi postojami</Text>
      </View>

      <ScrollView contentContainerStyle={styles.list}>
        {error && <Text style={styles.emptySub}>{error}</Text>}
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
                <Text style={styles.timeValue}>
                  {new Date(booking.startDateTime).toLocaleString('pl-PL')} – {new Date(booking.endDateTime).toLocaleString('pl-PL')}
                </Text>
              </View>

              <View style={styles.priceBlock}>
                <Text style={styles.priceLabel}>Koszt:</Text>
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

        {bookings.length === 0 && !error && (
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

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.subtleBorder,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
  },
  headerSub: {
    fontSize: 13,
    color: colors.muted,
    marginTop: 2,
  },
  list: {
    padding: 16,
  },
  bookingCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.border,
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
    color: colors.text,
  },
  statusBadge: {
    backgroundColor: colors.successSurface,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.accentText,
  },
  address: {
    fontSize: 13,
    color: colors.muted,
    marginBottom: 12,
  },
  timeInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.background,
    padding: 10,
    borderRadius: 10,
    marginBottom: 14,
  },
  timeInfoBlock: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 11,
    color: colors.muted,
  },
  timeValue: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    marginTop: 2,
  },
  priceBlock: {
    alignItems: 'flex-end',
  },
  priceLabel: {
    fontSize: 11,
    color: colors.muted,
  },
  priceValue: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.accent,
    marginTop: 2,
  },
  accessButton: {
    backgroundColor: colors.successPanel,
    borderWidth: 1.5,
    borderColor: '#10b981',
    borderRadius: 12,
    paddingVertical: 11,
    alignItems: 'center',
  },
  accessButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.accentText,
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
    color: colors.text,
    marginBottom: 4,
  },
  emptySub: {
    fontSize: 13,
    color: colors.muted,
    textAlign: 'center',
  },
});
