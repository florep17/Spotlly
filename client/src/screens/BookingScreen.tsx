import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { ParkingSpot } from '../types/spot';
import { bookingsService } from '../services/api/bookingsService';

interface BookingScreenProps {
  spot: ParkingSpot;
  onBack: () => void;
  onBookingSuccess: () => void;
}

const garageHero = require('../../assets/garage_hero.png');
const annaAvatar = require('../../assets/anna_avatar.png');

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
      {/* Top Header Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.7}>
          <Feather name="arrow-left" size={20} color="#111827" style={{ marginRight: 6 }} />
          <Text style={styles.backText}>Wróć do mapy</Text>
        </TouchableOpacity>

        <View style={styles.topActions}>
          <TouchableOpacity style={styles.iconAction} activeOpacity={0.7}>
            <Feather name="share-2" size={19} color="#111827" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconAction} activeOpacity={0.7}>
            <Feather name="heart" size={19} color="#111827" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Hero Image with Camera Counter */}
        <View style={styles.heroContainer}>
          <Image source={garageHero} style={styles.heroImage} resizeMode="cover" />
          <View style={styles.photoCounter}>
            <Feather name="camera" size={12} color="#ffffff" style={{ marginRight: 5 }} />
            <Text style={styles.photoCounterText}>1 / 3</Text>
          </View>
        </View>

        {/* Main Details */}
        <View style={styles.detailsContent}>
          <View style={styles.badgeRow}>
            <Text style={styles.typeBadge}>PRYWATNY PARKING</Text>
            <View style={styles.ratingBox}>
              <Ionicons name="star" size={14} color="#1b5e3a" style={{ marginRight: 4 }} />
              <Text style={styles.ratingText}>4,9 (32 opinie)</Text>
            </View>
          </View>

          <Text style={styles.title}>Garaż na Kazimierzu</Text>
          <View style={styles.addressRow}>
            <Ionicons name="location-sharp" size={14} color="#6b7280" style={{ marginRight: 4 }} />
            <Text style={styles.address}>Dajwór 12, Kraków · 3 min pieszo</Text>
          </View>

          {/* Feature Pills */}
          <View style={styles.featuresRow}>
            <View style={styles.featurePill}>
              <Feather name="home" size={13} color="#1b5e3a" style={{ marginRight: 5 }} />
              <Text style={styles.featurePillText}>Zadaszone</Text>
            </View>
            <View style={styles.featurePill}>
              <Feather name="shield" size={13} color="#1b5e3a" style={{ marginRight: 5 }} />
              <Text style={styles.featurePillText}>Bezpieczne</Text>
            </View>
            <View style={styles.featurePill}>
              <Ionicons name="car-outline" size={14} color="#1b5e3a" style={{ marginRight: 5 }} />
              <Text style={styles.featurePillText}>Mieści SUV-a</Text>
            </View>
          </View>

          {/* Host Card with Photo */}
          <View style={styles.hostCard}>
            <Image source={annaAvatar} style={styles.hostAvatarImage} />
            <View style={styles.hostInfo}>
              <View style={styles.hostHeader}>
                <Text style={styles.hostName}>Gospodyni: Anna</Text>
                <Ionicons
                  name="checkmark-circle"
                  size={16}
                  color="#10b981"
                  style={{ marginLeft: 6 }}
                />
              </View>
              <Text style={styles.hostSub}>Zweryfikowana · Zwykle odpisuje w 1 godz.</Text>
            </View>
          </View>

          <Text style={styles.description}>
            Spokojny garaż z wygodnym wjazdem na krakowskim Kazimierzu. Instrukcje wjazdu otrzymasz
            po rezerwacji.
          </Text>

          {/* Date Selector Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Wybierz termin</Text>
            <Text style={styles.sectionPrice}>5 zł / godz.</Text>
          </View>

          <View style={styles.monthRow}>
            <Text style={styles.monthLabel}>Październik 2026</Text>
            <View style={styles.monthArrows}>
              <TouchableOpacity style={styles.arrowButton}>
                <Feather name="chevron-left" size={16} color="#374151" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.arrowButton}>
                <Feather name="chevron-right" size={16} color="#374151" />
              </TouchableOpacity>
            </View>
          </View>

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
                  activeOpacity={0.8}
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
              <View style={styles.timeValueRow}>
                <Text style={styles.timeBoxValue}>10:00</Text>
                <Feather name="chevron-down" size={16} color="#6b7280" />
              </View>
            </View>

            <View style={styles.timeBox}>
              <Text style={styles.timeBoxLabel}>Wyjazd</Text>
              <View style={styles.timeValueRow}>
                <Text style={styles.timeBoxValue}>13:00</Text>
                <Feather name="chevron-down" size={16} color="#6b7280" />
              </View>
            </View>
          </View>

          <View style={styles.cancellationNotice}>
            <Ionicons
              name="checkmark-circle-outline"
              size={16}
              color="#059669"
              style={{ marginRight: 6 }}
            />
            <Text style={styles.cancellationText}>
              Bezpłatne anulowanie do 1 godz. przed przyjazdem
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Booking Action Bar */}
      <View style={styles.bottomBarContainer}>
        <View style={styles.priceSummaryRow}>
          <View style={styles.priceSummary}>
            <Text style={styles.calculationFormula}>3 godz. × 5 zł</Text>
            <Text style={styles.serviceFeeNote}>W tym 2 zł opłaty serwisowej</Text>
          </View>
          <View style={styles.totalBlock}>
            <Text style={styles.totalPrice}>Razem 17 zł</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.bookButton, isSubmitting && styles.buttonDisabled]}
          onPress={handleBooking}
          disabled={isSubmitting}
          activeOpacity={0.85}
        >
          <Text style={styles.bookButtonText}>
            {isSubmitting ? 'Przetwarzanie...' : 'Zarezerwuj i zapłać'}
          </Text>
          <Feather name="arrow-right" size={18} color="#ffffff" style={{ marginLeft: 8 }} />
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
    paddingBottom: 130,
  },
  topBar: {
    paddingTop: 52,
    paddingHorizontal: 20,
    paddingBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  backText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  topActions: {
    flexDirection: 'row',
    gap: 16,
  },
  iconAction: {
    padding: 4,
  },
  heroContainer: {
    width: '100%',
    height: 230,
    backgroundColor: '#f3f4f6',
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  photoCounter: {
    position: 'absolute',
    bottom: 14,
    right: 16,
    backgroundColor: 'rgba(17, 24, 39, 0.75)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  photoCounterText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  detailsContent: {
    padding: 20,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeBadge: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1b5e3a',
    letterSpacing: 0.6,
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  address: {
    fontSize: 14,
    color: '#6b7280',
  },
  featuresRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 18,
  },
  featurePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  featurePillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  hostCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    paddingVertical: 10,
    marginBottom: 16,
  },
  hostAvatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 14,
  },
  hostInfo: {
    flex: 1,
  },
  hostHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hostName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  hostSub: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    color: '#4b5563',
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.4,
  },
  sectionPrice: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  monthRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  monthLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  monthArrows: {
    flexDirection: 'row',
    gap: 6,
  },
  arrowButton: {
    padding: 4,
  },
  calendarStrip: {
    flexDirection: 'row',
    marginBottom: 18,
  },
  dayCard: {
    width: 54,
    height: 68,
    backgroundColor: '#f3f4f6',
    borderRadius: 14,
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
    fontSize: 17,
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
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  timeBoxLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  timeValueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeBoxValue: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
  },
  cancellationNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  cancellationText: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '600',
  },
  bottomBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  priceSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  priceSummary: {
    flex: 1,
  },
  calculationFormula: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  serviceFeeNote: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 2,
  },
  totalBlock: {
    alignItems: 'flex-end',
  },
  totalPrice: {
    fontSize: 24,
    fontWeight: '900',
    color: '#111827',
  },
  bookButton: {
    backgroundColor: '#1b5e3a',
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#9ca3af',
  },
  bookButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
  },
});
