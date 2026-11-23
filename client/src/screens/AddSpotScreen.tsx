import { ThemeColors, useThemedStyles, useThemeColors } from '../theme/theme';
import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { BackendSpotResponse, BackendSpotRequest } from '../types/spot';
import { SpotMap } from '../components/SpotMap';
import { MapPoint } from '../components/SpotMap.types';
import { spotsService } from '../services/api/spotsService';
import { getAuthToken } from '../services/api/apiClient';
import { showMessage, confirmAction } from '../utils/dialogs';

interface AddSpotScreenProps {
  onSuccess?: () => void;
}

type ScreenMode = 'my_spots' | 'add_form';

export const AddSpotScreen: React.FC<AddSpotScreenProps> = () => {
  const styles = useThemedStyles(createStyles);
  const colors = useThemeColors();
  const [mode, setMode] = useState<ScreenMode>('my_spots');

  // --- List of My Spots state ---
  const [mySpots, setMySpots] = useState<BackendSpotResponse[]>([]);
  const [spotsError, setSpotsError] = useState<string | null>(null);
  const [isLoadingSpots, setIsLoadingSpots] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [deletingSpotId, setDeletingSpotId] = useState<string | null>(null);

  // --- Add Form state ---
  const [title, setTitle] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [price, setPrice] = useState('');
  const [point, setPoint] = useState<MapPoint | null>(null);
  const [spotType, setSpotType] = useState<'GARAGE' | 'UNDERGROUND' | 'DRIVEWAY' | 'SURFACE'>(
    'GARAGE'
  );
  const [vehicleSize, setVehicleSize] = useState<'COMPACT' | 'SEDAN' | 'SUV' | 'VAN'>('SUV');
  const [accessType, setAccessType] = useState<'CODE_KEYPAD' | 'BARRIER_PHONE' | 'REMOTE' | 'OPEN'>(
    'CODE_KEYPAD'
  );
  const [gatePin, setGatePin] = useState('');
  const [hasEv, setHasEv] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load spots for the logged-in user
  const fetchSpots = useCallback(async (showLoader = true) => {
    if (showLoader) setIsLoadingSpots(true);
    setSpotsError(null);
    try {
      if (!getAuthToken()) {
        setMySpots([]);
        return;
      }
      const data = await spotsService.getMySpots();
      setMySpots(data || []);
    } catch (error) {
      setSpotsError(error instanceof Error ? error.message : 'Nie udało się pobrać miejsc.');
    } finally {
      setIsLoadingSpots(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      if (!getAuthToken()) {
        if (isMounted) setMySpots([]);
        return;
      }
      if (isMounted) setIsLoadingSpots(true);
      try {
        const data = await spotsService.getMySpots();
        if (isMounted) setMySpots(data || []);
      } catch (error) {
        if (isMounted) setSpotsError(error instanceof Error ? error.message : 'Nie udało się pobrać miejsc.');
      } finally {
        if (isMounted) setIsLoadingSpots(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchSpots(false);
  };

  // Handle Delete Spot
  const handleDeleteSpot = (spot: BackendSpotResponse) => {
    confirmAction(
      'Usunięcie miejsca parkingowego',
      `Czy na pewno chcesz usunąć miejsce "${spot.title}" z Twojego konta?`,
      async () => {
            setDeletingSpotId(spot.id);
            try {
              await spotsService.deleteSpot(spot.id);
              setMySpots((prev) => prev.filter((s) => s.id !== spot.id));
              showMessage('Usunięto', 'Miejsce parkingowe zostało usunięte z Twojego konta.');
              await fetchSpots(false);
            } catch (error) {
              const msg =
                error instanceof Error ? error.message : 'Wystąpił błąd podczas usuwania.';
              showMessage('Błąd', msg);
            } finally {
              setDeletingSpotId(null);
            }
          }
    );
  };

  // Handle Create Spot
  const handleCreateSpot = async () => {
    const trimmedTitle =
      title.trim() || `Miejsce ${spotType === 'GARAGE' ? 'Garażowe' : 'Parkingowe'} - ${street}`;
    const parsedPrice = Number(price.replace(',', '.'));

    if (!street.trim()) {
      showMessage('Błąd', 'Podaj ulicę i numer miejsca parkingowego.');
      return;
    }
    if (!city.trim() || !Number.isFinite(parsedPrice) || parsedPrice <= 0 || !price.trim()) {
      showMessage('Błąd', 'Podaj miasto i poprawną cenę za godzinę.');
      return;
    }
    if (!point) {
      showMessage('Błąd', 'Wskaż miejsce parkingowe na mapie.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: BackendSpotRequest = {
        title: trimmedTitle,
        address_street: street.trim(),
        address_city: city.trim(),
        hourly_rate: parsedPrice,
        spot_type: spotType,
        max_vehicle_size: vehicleSize,
        access_type: accessType,
        gate_pin_code: gatePin.trim() || undefined,
        has_ev_charging: hasEv,
        latitude: point.latitude,
        longitude: point.longitude,
        is_active: true,
      };

      const createdSpot = await spotsService.createSpot(payload);
      setMySpots((prev) => [createdSpot, ...prev.filter((s) => s.id !== createdSpot.id)]);

      showMessage(
        'Sukces! 🚀',
        `Miejsce "${trimmedTitle}" zostało dodane i przypisane do Twojego konta.`,
        () => {
          setTitle(''); setStreet(''); setCity(''); setPrice('');
          setPoint(null); setGatePin('');
          setMode('my_spots');
          fetchSpots(false);
        }
      );
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Nie udało się dodać miejsca.';
      showMessage('Błąd dodawania', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSpotTypeLabel = (type: string) => {
    switch (type) {
      case 'GARAGE':
        return 'Garaż indywidualny';
      case 'UNDERGROUND':
        return 'Garaż podziemny';
      case 'DRIVEWAY':
        return 'Podjazd prywatny';
      case 'SURFACE':
      case 'OUTDOOR':
        return 'Miejsce naziemne';
      default:
        return type;
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Gospodarz Miejsc</Text>
          <Text style={styles.headerSubtitle}>Zarządzaj miejscami przypisanymi do konta</Text>
        </View>

        {/* Quick Refresh Icon */}
        {mode === 'my_spots' && (
          <TouchableOpacity onPress={() => fetchSpots(true)} style={styles.refreshButton}>
            <Feather name="rotate-cw" size={18} color={colors.accent} />
          </TouchableOpacity>
        )}
      </View>

      {/* Mode Switcher Tabs */}
      <View style={styles.tabSwitcher}>
        <TouchableOpacity
          style={[styles.tabButton, mode === 'my_spots' && styles.tabButtonActive]}
          onPress={() => {
            setMode('my_spots');
            fetchSpots(false);
          }}
          activeOpacity={0.8}
        >
          <Feather
            name="list"
            size={16}
            color={mode === 'my_spots' ? colors.accent : colors.muted}
            style={{ marginRight: 6 }}
          />
          <Text style={[styles.tabButtonText, mode === 'my_spots' && styles.tabButtonTextActive]}>
            Moje miejsca ({mySpots.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, mode === 'add_form' && styles.tabButtonActive]}
          onPress={() => setMode('add_form')}
          activeOpacity={0.8}
        >
          <Feather
            name="plus-circle"
            size={16}
            color={mode === 'add_form' ? colors.accent : colors.muted}
            style={{ marginRight: 6 }}
          />
          <Text style={[styles.tabButtonText, mode === 'add_form' && styles.tabButtonTextActive]}>
            + Dodaj nowe
          </Text>
        </TouchableOpacity>
      </View>

      {/* MODE 1: MY SPOTS LIST */}
      {mode === 'my_spots' && (
        <ScrollView
          style={styles.flex1}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={colors.accent}
            />
          }
        >
          {isLoadingSpots ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color={colors.accent} />
              <Text style={styles.loadingText}>Pobieranie Twoich miejsc...</Text>
            </View>
          ) : spotsError ? (
            <View style={styles.centerContainer}>
              <Text style={styles.loadingText}>{spotsError}</Text>
              <TouchableOpacity onPress={() => fetchSpots(true)}><Text>Spróbuj ponownie</Text></TouchableOpacity>
            </View>
          ) : mySpots.length === 0 ? (
            /* Empty State */
            <View style={styles.emptyCard}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="car-outline" size={44} color={colors.accent} />
              </View>
              <Text style={styles.emptyTitle}>Brak miejsc na Twoim koncie</Text>
              <Text style={styles.emptyDescription}>
                Nie dodałeś jeszcze żadnego miejsca parkingowego. Dodaj swoje pierwsze miejsce, aby
                zacząć zarabiać na wolnej przestrzeni.
              </Text>
              <TouchableOpacity
                style={styles.addFirstButton}
                onPress={() => setMode('add_form')}
                activeOpacity={0.85}
              >
                <Feather name="plus" size={18} color="#ffffff" style={{ marginRight: 8 }} />
                <Text style={styles.addFirstButtonText}>Dodaj pierwsze miejsce</Text>
              </TouchableOpacity>
            </View>
          ) : (
            /* Spots Cards */
            <View>
              <View style={styles.listHeaderRow}>
                <Text style={styles.listSectionTitle}>Twoje aktywne oferty</Text>
                <TouchableOpacity onPress={() => setMode('add_form')} style={styles.miniAddLink}>
                  <Text style={styles.miniAddText}>+ Dodaj kolejne</Text>
                </TouchableOpacity>
              </View>

              {mySpots.map((spot) => (
                <View key={spot.id} style={styles.spotCard}>
                  {/* Card Header */}
                  <View style={styles.spotCardHeader}>
                    <View style={styles.flex1}>
                      <Text style={styles.spotCardTitle} numberOfLines={1}>
                        {spot.title}
                      </Text>
                      <View style={styles.addressRow}>
                        <Feather
                          name="map-pin"
                          size={13}
                          color={colors.muted}
                          style={{ marginRight: 4 }}
                        />
                        <Text style={styles.spotCardAddress}>
                          {spot.address_street}, {spot.address_city}
                        </Text>
                      </View>
                    </View>

                    {/* Active Pill Badge */}
                    <View style={styles.activePill}>
                      <View style={styles.activeDot} />
                      <Text style={styles.activeText}>Aktywne</Text>
                    </View>
                  </View>

                  {/* Card Details Badges */}
                  <View style={styles.badgeRow}>
                    <View style={styles.detailBadge}>
                      <Ionicons
                        name="pricetag-outline"
                        size={12}
                        color={colors.accent}
                        style={{ marginRight: 4 }}
                      />
                      <Text style={styles.detailBadgeText}>{spot.hourly_rate} PLN / h</Text>
                    </View>

                    <View style={styles.detailBadge}>
                      <Feather name="home" size={12} color={colors.secondary} style={{ marginRight: 4 }} />
                      <Text style={styles.detailBadgeText}>{getSpotTypeLabel(spot.spot_type)}</Text>
                    </View>

                    {spot.has_ev_charging && (
                      <View style={[styles.detailBadge, styles.evBadge]}>
                        <MaterialCommunityIcons
                          name="ev-station"
                          size={13}
                          color={colors.success}
                          style={{ marginRight: 3 }}
                        />
                        <Text style={[styles.detailBadgeText, styles.evText]}>Stacja EV</Text>
                      </View>
                    )}
                  </View>

                  {/* PIN / Access Info if available */}
                  {spot.gate_pin_code && (
                    <View style={styles.pinRow}>
                      <Feather name="key" size={12} color={colors.muted} style={{ marginRight: 5 }} />
                      <Text style={styles.pinText}>
                        PIN wjazdu: <Text style={styles.pinCode}>{spot.gate_pin_code}</Text>
                      </Text>
                    </View>
                  )}

                  {/* Card Footer: Delete Action Button */}
                  <View style={styles.cardFooter}>
                    <Text style={styles.cardOwnerNote}>Przypisane do Twojego konta</Text>

                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDeleteSpot(spot)}
                      disabled={deletingSpotId === spot.id}
                      activeOpacity={0.7}
                    >
                      {deletingSpotId === spot.id ? (
                        <ActivityIndicator size="small" color={colors.danger} />
                      ) : (
                        <>
                          <Feather
                            name="trash-2"
                            size={14}
                            color={colors.danger}
                            style={{ marginRight: 6 }}
                          />
                          <Text style={styles.deleteButtonText}>Usuń miejsce</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      )}

      {/* MODE 2: ADD FORM */}
      {mode === 'add_form' && (
        <ScrollView
          style={styles.flex1}
          contentContainerStyle={styles.formContent}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled
          showsVerticalScrollIndicator={false}
        >
          {/* Form Title & Info */}
          <Text style={styles.formSectionTitle}>Informacje podstawowe</Text>

          <Text style={styles.inputLabel}>Tytuł / Nazwa miejsca (opcjonalnie)</Text>
          <View style={styles.inputContainer}>
            <Feather name="tag" size={16} color={colors.muted} style={{ marginRight: 10 }} />
            <TextInput
              style={styles.textInput}
              value={title}
              onChangeText={setTitle}
              placeholder="np. Garaż podziemny - Pawia"
              placeholderTextColor={colors.placeholder}
            />
          </View>

          <Text style={styles.inputLabel}>Lokalizacja na mapie</Text>
          <View style={styles.locationMap}>
            <SpotMap point={point} onPickPoint={setPoint} />
          </View>
          <Text accessibilityLiveRegion="polite" style={styles.mapHint}>
            {point
              ? 'Pinezka ustawiona. Wskaż inny punkt, aby ją przesunąć.'
              : 'Dotknij lub kliknij mapę, aby ustawić pinezkę.'}
          </Text>

          <Text style={styles.inputLabel}>Ulica i numer lokalu</Text>
          <View style={styles.inputContainer}>
            <Feather name="map-pin" size={16} color={colors.muted} style={{ marginRight: 10 }} />
            <TextInput
              style={styles.textInput}
              value={street}
              onChangeText={setStreet}
              placeholder="np. Pawia 5"
              placeholderTextColor={colors.placeholder}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.flex1, { marginRight: 8 }]}>
              <Text style={styles.inputLabel}>Miasto</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.textInput}
                  value={city}
                  onChangeText={setCity}
                  placeholder="Kraków"
                  placeholderTextColor={colors.placeholder}
                />
              </View>
            </View>

            <View style={[styles.flex1, { marginLeft: 8 }]}>
              <Text style={styles.inputLabel}>Cena za godzinę (PLN)</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.textInput}
                  value={price}
                  onChangeText={setPrice}
                  keyboardType="numeric"
                  placeholder="8.50"
                  placeholderTextColor={colors.placeholder}
                />
              </View>
            </View>
          </View>

          {/* Spot Type Selection */}
          <Text style={styles.formSectionTitle}>Rodzaj miejsca</Text>
          <View style={styles.typeGrid}>
            {[
              { key: 'GARAGE', label: 'Garaż' },
              { key: 'UNDERGROUND', label: 'Podziemny' },
              { key: 'DRIVEWAY', label: 'Podjazd' },
              { key: 'SURFACE', label: 'Naziemny' },
            ].map((item) => (
              <TouchableOpacity
                key={item.key}
                style={[
                  styles.typeGridButton,
                  spotType === item.key && styles.typeGridButtonActive,
                ]}
                onPress={() => setSpotType(item.key as any)}
                activeOpacity={0.8}
              >
                {spotType === item.key && (
                  <Feather name="check" size={14} color={colors.accent} style={{ marginRight: 4 }} />
                )}
                <Text
                  style={[styles.typeGridText, spotType === item.key && styles.typeGridTextActive]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Vehicle Size Selection */}
          <Text style={styles.formSectionTitle}>Maksymalny pojazd</Text>
          <View style={styles.typeGrid}>
            {[
              { key: 'COMPACT', label: 'Kompakt' },
              { key: 'SEDAN', label: 'Sedan' },
              { key: 'SUV', label: 'SUV' },
              { key: 'VAN', label: 'Van / Bus' },
            ].map((item) => (
              <TouchableOpacity
                key={item.key}
                style={[
                  styles.typeGridButton,
                  vehicleSize === item.key && styles.typeGridButtonActive,
                ]}
                onPress={() => setVehicleSize(item.key as any)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.typeGridText,
                    vehicleSize === item.key && styles.typeGridTextActive,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Access Type & Gate PIN */}
          <Text style={styles.formSectionTitle}>Dostęp i zabezpieczenia</Text>
          <View style={styles.typeGrid}>
            {[
              { key: 'CODE_KEYPAD', label: 'Kod / Domofon' },
              { key: 'BARRIER_PHONE', label: 'Telefon' },
              { key: 'REMOTE', label: 'Pilot' },
              { key: 'OPEN', label: 'Wjazd otwarty' },
            ].map((item) => (
              <TouchableOpacity
                key={item.key}
                style={[
                  styles.typeGridButton,
                  accessType === item.key && styles.typeGridButtonActive,
                ]}
                onPress={() => setAccessType(item.key as any)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.typeGridText,
                    accessType === item.key && styles.typeGridTextActive,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {accessType === 'CODE_KEYPAD' && (
            <>
              <Text style={styles.inputLabel}>Kod PIN do bramy / kłódki</Text>
              <View style={styles.inputContainer}>
                <Feather name="lock" size={16} color={colors.muted} style={{ marginRight: 10 }} />
                <TextInput
                  style={styles.textInput}
                  value={gatePin}
                  onChangeText={setGatePin}
                  placeholder="np. 4921"
                  placeholderTextColor={colors.placeholder}
                />
              </View>
            </>
          )}

          {/* EV Charging Checkbox */}
          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => setHasEv(!hasEv)}
            activeOpacity={0.8}
          >
            <View style={[styles.checkboxBox, hasEv && styles.checkboxBoxActive]}>
              {hasEv && <Feather name="check" size={14} color="#ffffff" />}
            </View>
            <Text style={styles.checkboxLabel}>Dostępna ładowarka aut elektrycznych (EV)</Text>
          </TouchableOpacity>

          {/* Submit Action Button */}
          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && styles.buttonDisabled]}
            onPress={handleCreateSpot}
            disabled={isSubmitting}
            activeOpacity={0.85}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <>
                <Text style={styles.submitButtonText}>Opublikuj i przypisz do konta</Text>
                <Feather name="arrow-right" size={18} color="#ffffff" style={{ marginLeft: 8 }} />
              </>
            )}
          </TouchableOpacity>

          <Text style={styles.disclaimerText}>
            Miejsce zostanie natychmiast zapisane w bazie danych PostgreSQL i zsynchronizowane z
            indeksem wyszukiwania.
          </Text>
        </ScrollView>
      )}
    </View>
  );
};

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex1: {
    flex: 1,
  },
  header: {
    paddingTop: 54,
    paddingHorizontal: 20,
    paddingBottom: 14,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.subtleBorder,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    color: colors.muted,
    marginTop: 2,
  },
  refreshButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.accentSurface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabSwitcher: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 10,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: colors.mutedSurface,
  },
  tabButtonActive: {
    backgroundColor: colors.accentSurface,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  tabButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.secondary,
  },
  tabButtonTextActive: {
    color: colors.accent,
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  centerContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13,
    color: colors.muted,
  },
  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 20,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.accentSurface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 13,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  addFirstButton: {
    backgroundColor: colors.brand,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 14,
  },
  addFirstButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  listHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 4,
  },
  listSectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
  },
  miniAddLink: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  miniAddText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.accent,
  },
  spotCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  spotCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  spotCardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 4,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spotCardAddress: {
    fontSize: 13,
    color: colors.muted,
    fontWeight: '500',
  },
  activePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accentSurface,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    marginLeft: 8,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10b981',
    marginRight: 5,
  },
  activeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.accentText,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: 8,
  },
  detailBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.mutedSurface,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  detailBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.label,
  },
  evBadge: {
    backgroundColor: colors.successSurface,
  },
  evText: {
    color: colors.accentText,
    fontWeight: '700',
  },
  pinRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 8,
  },
  pinText: {
    fontSize: 12,
    color: colors.muted,
  },
  pinCode: {
    fontWeight: '700',
    color: colors.text,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.subtleBorder,
  },
  cardOwnerNote: {
    fontSize: 11,
    color: colors.placeholder,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.dangerTint,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  deleteButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.danger,
  },
  formContent: {
    padding: 20,
    paddingBottom: 50,
  },
  formSectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
    marginTop: 14,
    marginBottom: 10,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.label,
    marginBottom: 6,
  },
  locationMap: {
    height: 260,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: colors.mapBackground,
  },
  mapHint: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 6,
    marginBottom: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
    backgroundColor: colors.surface,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: colors.text,
  },
  row: {
    flexDirection: 'row',
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  typeGridButton: {
    flexBasis: '48%',
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 12,
  },
  typeGridButtonActive: {
    borderColor: colors.accent,
    backgroundColor: colors.accentSurface,
  },
  typeGridText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.secondary,
  },
  typeGridTextActive: {
    color: colors.accent,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 14,
  },
  checkboxBox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.strongBorder,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    backgroundColor: colors.surface,
  },
  checkboxBoxActive: {
    backgroundColor: colors.brand,
    borderColor: colors.accent,
  },
  checkboxLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.label,
  },
  submitButton: {
    backgroundColor: colors.brand,
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 12,
    shadowColor: colors.brand,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  buttonDisabled: {
    backgroundColor: colors.disabled,
  },
  disclaimerText: {
    fontSize: 11,
    color: colors.placeholder,
    textAlign: 'center',
    lineHeight: 16,
  },
});
