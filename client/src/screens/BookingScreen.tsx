import { ThemeColors, useThemedStyles, useThemeColors } from '../theme/theme';
import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { ParkingSpot } from '../types/spot';
import { bookingsService } from '../services/api/bookingsService';
import { showMessage } from '../utils/dialogs';

interface BookingScreenProps {
  spot: ParkingSpot;
  onBack: () => void;
  onBookingSuccess: () => void;
}

export const BookingScreen: React.FC<BookingScreenProps> = ({ spot, onBack, onBookingSuccess }) => {
  const styles = useThemedStyles(createStyles);
  const colors = useThemeColors();
  const firstDate = new Date();
  if (firstDate.getHours() >= 10) firstDate.setDate(firstDate.getDate() + 1);
  const dateKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  const [selectedDay, setSelectedDay] = useState(() => dateKey(firstDate));
  const [vehiclePlateNumber, setVehiclePlateNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const days = Array.from({ length: 7 }, (_, offset) => {
    const date = new Date(firstDate);
    date.setDate(date.getDate() + offset);
    return {
      key: dateKey(date),
      day: new Intl.DateTimeFormat('pl-PL', { weekday: 'short' }).format(date),
      date: date.getDate(),
    };
  });

  const handleBooking = async () => {
    if (!vehiclePlateNumber.trim()) {
      showMessage('Uzupełnij dane', 'Podaj numer rejestracyjny pojazdu.');
      return;
    }
    setIsSubmitting(true);
    try {
      await bookingsService.createBooking({
        spotId: spot.id,
        startDateTime: new Date(`${selectedDay}T10:00:00`).toISOString(),
        endDateTime: new Date(`${selectedDay}T13:00:00`).toISOString(),
        vehiclePlateNumber: vehiclePlateNumber.trim(),
      });
      showMessage(
        'Rezerwacja potwierdzona! 🎉',
        'Miejsce zostało zarezerwowane. Szczegóły znajdziesz w zakładce Rezerwacje.',
        onBookingSuccess
      );
    } catch (error) {
      showMessage('Błąd', error instanceof Error ? error.message : 'Nie udało się dokonać rezerwacji.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Header Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.7}>
          <Feather name="arrow-left" size={20} color={colors.text} style={{ marginRight: 6 }} />
          <Text style={styles.backText}>Wróć do mapy</Text>
        </TouchableOpacity>

      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Listing placeholder until hosts can upload photos */}
        <View style={styles.heroContainer}>
          <Feather name="map-pin" size={48} color={colors.accent} />
        </View>

        {/* Main Details */}
        <View style={styles.detailsContent}>
          <View style={styles.badgeRow}>
            <Text style={styles.typeBadge}>PRYWATNY PARKING</Text>
          </View>

          <Text style={styles.title}>{spot.title}</Text>
          <View style={styles.addressRow}>
            <Ionicons name="location-sharp" size={14} color={colors.muted} style={{ marginRight: 4 }} />
            <Text style={styles.address}>{spot.address}, {spot.city}</Text>
          </View>

          {/* Feature Pills */}
          <View style={styles.featuresRow}>
            {spot.isCovered && <View style={styles.featurePill}>
              <Feather name="home" size={13} color={colors.accent} style={{ marginRight: 5 }} />
              <Text style={styles.featurePillText}>Zadaszone</Text>
            </View>}
            {spot.fitsSuv && <View style={styles.featurePill}>
              <Ionicons name="car-outline" size={14} color={colors.accent} style={{ marginRight: 5 }} />
              <Text style={styles.featurePillText}>Mieści SUV-a</Text>
            </View>}
          </View>

          {/* Date Selector Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Wybierz termin</Text>
            <Text style={styles.sectionPrice}>{spot.hourlyPrice.toFixed(2)} zł / godz.</Text>
          </View>

          <View style={styles.monthRow}>
            <Text style={styles.monthLabel}>{new Intl.DateTimeFormat('pl-PL', { month: 'long', year: 'numeric' }).format(new Date(`${selectedDay}T12:00:00`))}</Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.calendarStrip}
          >
            {days.map((item) => {
              const isSelected = selectedDay === item.key;
              return (
                <TouchableOpacity
                  key={item.key}
                  style={[styles.dayCard, isSelected && styles.selectedDayCard]}
                  onPress={() => setSelectedDay(item.key)}
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
              </View>
            </View>

            <View style={styles.timeBox}>
              <Text style={styles.timeBoxLabel}>Wyjazd</Text>
              <View style={styles.timeValueRow}>
                <Text style={styles.timeBoxValue}>13:00</Text>
              </View>
            </View>
          </View>

          <TextInput
            style={styles.plateInput}
            placeholderTextColor={colors.placeholder}
            placeholder="Numer rejestracyjny pojazdu"
            value={vehiclePlateNumber}
            onChangeText={setVehiclePlateNumber}
            autoCapitalize="characters"
            maxLength={50}
          />

        </View>
      </ScrollView>

      {/* Bottom Booking Action Bar */}
      <View style={styles.bottomBarContainer}>
        <View style={styles.priceSummaryRow}>
          <View style={styles.priceSummary}>
            <Text style={styles.calculationFormula}>3 godz. × {spot.hourlyPrice.toFixed(2)} zł</Text>
          </View>
          <View style={styles.totalBlock}>
            <Text style={styles.totalPrice}>Razem {(3 * spot.hourlyPrice).toFixed(2)} zł</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.bookButton, isSubmitting && styles.buttonDisabled]}
          onPress={handleBooking}
          disabled={isSubmitting}
          activeOpacity={0.85}
        >
          <Text style={styles.bookButtonText}>
            {isSubmitting ? 'Przetwarzanie...' : 'Zarezerwuj'}
          </Text>
          <Feather name="arrow-right" size={18} color="#ffffff" style={{ marginLeft: 8 }} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  plateInput: {
    borderWidth: 1,
    borderColor: colors.strongBorder,
    borderRadius: 12,
    padding: 12,
    marginTop: 16,
    color: colors.text,
  },
  container: {
    flex: 1,
    backgroundColor: colors.surface,
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
    backgroundColor: colors.surface,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  backText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
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
    backgroundColor: colors.mutedSurface,
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
    color: colors.accent,
    letterSpacing: 0.6,
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.text,
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
    color: colors.muted,
  },
  featuresRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 18,
  },
  featurePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.mutedSurface,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  featurePillText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.label,
  },
  hostCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
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
    color: colors.text,
  },
  hostSub: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 2,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.secondary,
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
    color: colors.text,
    letterSpacing: -0.4,
  },
  sectionPrice: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
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
    color: colors.muted,
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
    backgroundColor: colors.mutedSurface,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  selectedDayCard: {
    backgroundColor: colors.brand,
  },
  dayLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.muted,
    marginBottom: 4,
  },
  dateLabel: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.text,
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
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  timeBoxLabel: {
    fontSize: 12,
    color: colors.muted,
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
    color: colors.text,
  },
  cancellationNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  cancellationText: {
    fontSize: 12,
    color: colors.success,
    fontWeight: '600',
  },
  bottomBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.subtleBorder,
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
    color: colors.label,
  },
  serviceFeeNote: {
    fontSize: 11,
    color: colors.placeholder,
    marginTop: 2,
  },
  totalBlock: {
    alignItems: 'flex-end',
  },
  totalPrice: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.text,
  },
  bookButton: {
    backgroundColor: colors.brand,
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: colors.disabled,
  },
  bookButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
  },
});
