import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import { ParkingSpot } from '../types/spot';
import { bookingsService } from '../services/api/bookingsService';

interface BookingScreenProps {
  spot: ParkingSpot;
  onBack: () => void;
  onBookingSuccess: () => void;
}

export const BookingScreen: React.FC<BookingScreenProps> = ({ spot, onBack, onBookingSuccess }) => {
  const [selectedDay, setSelectedDay] = useState(12);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const days = [
    { day: 'Pon', date: 12 },
    { day: 'Wt', date: 13 },
    { day: 'Śr', date: 14 },
    { day: 'Czw', date: 15 },
    { day: 'Pt', date: 16 },
    { day: 'Sob', date: 17 },
    { day: 'Ndz', date: 18 },
  ];

  const handleBooking = async () => {
    setIsSubmitting(true);
    try {
      await bookingsService.createBooking({
        spotId: spot.id,
        startDateTime: `2026-10-${selectedDay}T10:00:00Z`,
        endDateTime: `2026-10-${selectedDay}T13:00:00Z`,
        paymentMethod: 'TEST_CARD',
      });
      Alert.alert(
        'Rezerwacja potwierdzona! 🎉',
        'Miejsce zostało zarezerwowane. Instrukcję wjazdu i kod PIN znajdziesz w zakładce Rezerwacje.',
        [{ text: 'Przejdź do rezerwacji', onPress: onBookingSuccess }]
      );
    } catch {
      Alert.alert('Błąd', 'Nie udało się dokonać rezerwacji. Spróbuj ponownie.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Top Header Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.backText}>← Wróć do mapy</Text>
          </TouchableOpacity>
          <View style={styles.topActions}>
            <TouchableOpacity style={styles.iconAction}>
              <Text style={styles.actionIconText}>↗️</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconAction}>
              <Text style={styles.actionIconText}>🤍</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Hero Image */}
        <View style={styles.heroContainer}>
          <Image source={{ uri: spot.imageUrl }} style={styles.heroImage} />
          <View style={styles.photoCounter}>
            <Text style={styles.photoCounterText}>📷 1 / 3</Text>
          </View>
        </View>

        {/* Main Details */}
        <View style={styles.detailsContent}>
          <View style={styles.badgeRow}>
            <Text style={styles.typeBadge}>PRYWATNY PARKING</Text>
            <Text style={styles.ratingText}>
              ⭐ {spot.rating} ({spot.reviewCount} opinie)
            </Text>
          </View>

          <Text style={styles.title}>{spot.title}</Text>
          <Text style={styles.address}>
            📍 {spot.address}, {spot.city} · {spot.walkingMinutes} min pieszo
          </Text>

          {/* Feature Pills */}
          <View style={styles.featuresRow}>
            {spot.isCovered && (
              <View style={styles.featurePill}>
                <Text style={styles.featurePillText}>🏠 Zadaszone</Text>
              </View>
            )}
            {spot.isSecure && (
              <View style={styles.featurePill}>
                <Text style={styles.featurePillText}>🛡️ Bezpieczne</Text>
              </View>
            )}
            {spot.fitsSuv && (
              <View style={styles.featurePill}>
                <Text style={styles.featurePillText}>🚗 Mieści SUV-a</Text>
              </View>
            )}
          </View>

          {/* Host Card */}
          <View style={styles.hostCard}>
            <View style={styles.hostAvatar}>
              <Text style={styles.hostAvatarText}>{spot.hostName.charAt(0)}</Text>
            </View>
            <View style={styles.hostInfo}>
              <View style={styles.hostHeader}>
                <Text style={styles.hostName}>Gospodyni: {spot.hostName}</Text>
                <Text style={styles.verifiedCheck}>✓</Text>
              </View>
              <Text style={styles.hostSub}>Zweryfikowana · Zwykle odpisuje w 1 godz.</Text>
            </View>
          </View>

          <Text style={styles.description}>{spot.description}</Text>

          {/* Date Selector Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Wybierz termin</Text>
            <Text style={styles.sectionPrice}>{spot.hourlyPrice.toFixed(0)} zł / godz.</Text>
          </View>
          <Text style={styles.monthLabel}>Październik 2026</Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.calendarStrip}
          >
            {days.map((item) => {
              const isSelected = selectedDay === item.date;
              return (
                <TouchableOpacity
                  key={item.date}
                  style={[styles.dayCard, isSelected && styles.selectedDayCard]}
                  onPress={() => setSelectedDay(item.date)}
                >
                  <Text style={[styles.dayLabel, isSelected && styles.selectedDayText]}>
                    {item.day}
                  </Text>
                  <Text style={[styles.dateLabel, isSelected && styles.selectedDayText]}>
                    {item.date}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Time Picker Selectors */}
          <View style={styles.timeRow}>
            <View style={styles.timeBox}>
              <Text style={styles.timeBoxLabel}>Przyjazd</Text>
              <Text style={styles.timeBoxValue}>10:00 ▾</Text>
            </View>
            <View style={styles.timeBox}>
              <Text style={styles.timeBoxLabel}>Wyjazd</Text>
              <Text style={styles.timeBoxValue}>13:00 ▾</Text>
            </View>
          </View>

          <View style={styles.cancellationNotice}>
            <Text style={styles.cancellationText}>
              ✓ Bezpłatne anulowanie do 1 godz. przed przyjazdem
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Booking Action Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.priceSummary}>
          <Text style={styles.calculationFormula}>3 godz. × {spot.hourlyPrice.toFixed(0)} zł</Text>
          <Text style={styles.serviceFeeNote}>W tym 2 zł opłaty serwisowej</Text>
        </View>
        <View style={styles.totalBlock}>
          <Text style={styles.totalPrice}>Razem 17 zł</Text>
        </View>
      </View>

      <View style={styles.buttonWrapper}>
        <TouchableOpacity
          style={[styles.bookButton, isSubmitting && styles.buttonDisabled]}
          onPress={handleBooking}
          disabled={isSubmitting}
        >
          <Text style={styles.bookButtonText}>
            {isSubmitting ? 'Przetwarzanie...' : 'Zarezerwuj i zapłać ➔'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    paddingBottom: 120,
  },
  topBar: {
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  backButton: {
    paddingVertical: 6,
  },
  backText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  topActions: {
    flexDirection: 'row',
    gap: 12,
  },
  iconAction: {
    padding: 6,
  },
  actionIconText: {
    fontSize: 18,
  },
  heroContainer: {
    width: '100%',
    height: 220,
    backgroundColor: '#e5e7eb',
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  photoCounter: {
    position: 'absolute',
    bottom: 12,
    right: 14,
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
  },
  photoCounterText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  detailsContent: {
    padding: 18,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  typeBadge: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1b5e3a',
    letterSpacing: 0.8,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  address: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 14,
  },
  featuresRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  featurePill: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  featurePillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  hostCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  hostAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#d1fae5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  hostAvatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#065f46',
  },
  hostInfo: {
    flex: 1,
  },
  hostHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  hostName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  verifiedCheck: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '800',
  },
  hostSub: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    color: '#4b5563',
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  sectionPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  monthLabel: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 12,
  },
  calendarStrip: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  dayCard: {
    width: 52,
    height: 64,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  selectedDayCard: {
    backgroundColor: '#1b5e3a',
  },
  dayLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 4,
  },
  dateLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  selectedDayText: {
    color: '#ffffff',
  },
  timeRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  timeBox: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 12,
  },
  timeBoxLabel: {
    fontSize: 11,
    color: '#6b7280',
    marginBottom: 4,
  },
  timeBoxValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  cancellationNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  cancellationText: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '600',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 58,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceSummary: {
    flex: 1,
  },
  calculationFormula: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  serviceFeeNote: {
    fontSize: 11,
    color: '#9ca3af',
  },
  totalBlock: {
    alignItems: 'flex-end',
  },
  totalPrice: {
    fontSize: 22,
    fontWeight: '900',
    color: '#111827',
  },
  buttonWrapper: {
    position: 'absolute',
    bottom: 8,
    left: 16,
    right: 16,
  },
  bookButton: {
    backgroundColor: '#1b5e3a',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#9ca3af',
  },
  bookButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});
