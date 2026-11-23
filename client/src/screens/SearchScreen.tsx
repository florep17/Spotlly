import { ThemeColors, useThemedStyles, useThemeColors } from '../theme/theme';
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SpotMap } from '../components/SpotMap';
import { BackendSpotResponse } from '../types/spot';
import { spotsService } from '../services/api/spotsService';

interface SearchScreenProps {
  onSelectSpot?: (spot: BackendSpotResponse) => void;
}

export const SearchScreen: React.FC<SearchScreenProps> = ({ onSelectSpot }) => {
  const styles = useThemedStyles(createStyles);
  const colors = useThemeColors();
  const [spots, setSpots] = useState<BackendSpotResponse[]>([]);
  const [selectedSpot, setSelectedSpot] = useState<BackendSpotResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recenterKey, setRecenterKey] = useState(0);
  const [query, setQuery] = useState('');
  const [showList, setShowList] = useState(false);
  const visibleSpots = spots.filter((spot) =>
    `${spot.title} ${spot.address_street} ${spot.address_city}`.toLocaleLowerCase('pl-PL')
      .includes(query.trim().toLocaleLowerCase('pl-PL')));

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await spotsService.getAllSpots();
        if (mounted) {
          setSpots(data || []);
          if (data && data.length > 0) setSelectedSpot(data[0]);
        }
      } catch (e: unknown) {
        if (mounted) {
          setError(e instanceof Error ? e.message : 'Błąd ładowania miejsc parkingowych.');
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const handleMarkerPress = (spot: BackendSpotResponse) => {
    setSelectedSpot(spot);
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <View style={styles.brandContainer}>
            <View style={styles.brandIcon}>
              <Text style={styles.brandIconText}>S</Text>
            </View>
            <Text style={styles.brandTitle}>Spotlly</Text>
          </View>
        </View>

        <Text style={styles.tagline}>Miejsce na Twój dzień.</Text>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Feather name="search" size={18} color={colors.secondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Szukaj miejsca..."
            placeholderTextColor={colors.placeholder}
            value={query}
            onChangeText={(value) => {
              setQuery(value);
              setSelectedSpot(null);
            }}
          />
        </View>
      </View>

      {/* Map View Container */}
      <View style={styles.mapContainer}>
        {isLoading ? (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={colors.accent} />
            <Text style={styles.loadingText}>Ładowanie mapy...</Text>
          </View>
        ) : error ? (
          <View style={styles.loadingOverlay}>
            <Feather name="wifi-off" size={32} color={colors.placeholder} />
            <Text style={styles.errorText}>{error}</Text>
            <Text style={styles.errorSub}>Sprawdź połączenie z serwerem API</Text>
          </View>
        ) : (
          <SpotMap spots={visibleSpots} selectedSpot={selectedSpot} onSelectSpot={handleMarkerPress} recenterKey={recenterKey} />
        )}

        {/* Overlay badges */}
        {!isLoading && !error && (
          <>
            <View style={styles.nearbyPill}>
              <Text style={styles.nearbyPillText}>{visibleSpots.length} miejsc</Text>
            </View>

            <TouchableOpacity style={styles.toggleListPill} activeOpacity={0.8} onPress={() => setShowList((value) => !value)}>
              <Feather name="list" size={14} color={colors.text} style={{ marginRight: 6 }} />
              <Text style={styles.toggleListText}>{showList ? 'Mapa' : 'Lista'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.recenterButton}
              activeOpacity={0.85}
              onPress={() => setRecenterKey((key) => key + 1)}
            >
              <MaterialCommunityIcons name="crosshairs-gps" size={24} color={colors.mapControl} />
            </TouchableOpacity>

          </>
        )}

        {/* Bottom Preview Card */}
        {showList && !isLoading && !error && (
          <ScrollView style={{ position: 'absolute', top: 58, right: 12, left: 12, bottom: 10, backgroundColor: 'white', borderRadius: 18, padding: 12 }}>
            {visibleSpots.map((spot) => <TouchableOpacity key={spot.id} onPress={() => { setSelectedSpot(spot); setShowList(false); }} style={{ padding: 12, borderBottomWidth: 1, borderBottomColor: colors.border }}>
              <Text style={styles.spotTitle}>{spot.title}</Text>
              <Text style={styles.spotAddress}>{spot.address_street}, {spot.address_city} · {Number(spot.hourly_rate).toFixed(2)} zł / godz.</Text>
            </TouchableOpacity>)}
            {visibleSpots.length === 0 && <Text>Brak miejsc dla tego wyszukiwania.</Text>}
          </ScrollView>
        )}
        {selectedSpot && !showList && !isLoading && !error && visibleSpots.some((spot) => spot.id === selectedSpot.id) && (
          <View style={styles.previewCard}>
            <View style={styles.previewCardContent}>
              <View style={styles.spotThumbPlaceholder}>
                <Feather name="map-pin" size={28} color={colors.accent} />
              </View>
              <View style={styles.spotInfo}>
                <View style={styles.ratingRow}>
                  <Ionicons name="star" size={13} color="#f59e0b" style={{ marginRight: 4 }} />
                  <Text style={styles.starText}>Nowe</Text>
                  <Text style={styles.walkingDot}> · </Text>
                  <Text style={styles.walkingText}>{selectedSpot.address_city}</Text>
                </View>

                <Text style={styles.spotTitle} numberOfLines={1}>
                  {selectedSpot.title}
                </Text>
                <Text style={styles.spotAddress} numberOfLines={1}>
                  {selectedSpot.address_street} ·{' '}
                  {selectedSpot.spot_type === 'GARAGE'
                    ? 'Zadaszone'
                    : selectedSpot.spot_type === 'UNDERGROUND'
                      ? 'Podziemne'
                      : 'Odkryte'}
                </Text>

                <View style={styles.priceActionRow}>
                  <View style={styles.priceRow}>
                    <Text style={styles.priceMain}>
                      {Number(selectedSpot.hourly_rate).toFixed(0)} zł
                    </Text>
                    <Text style={styles.priceUnit}> / godz.</Text>
                  </View>

                  {onSelectSpot && (
                    <TouchableOpacity
                      style={styles.detailsButton}
                      onPress={() => onSelectSpot(selectedSpot)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.detailsButtonText}>Zobacz miejsce</Text>
                      <Feather
                        name="arrow-right"
                        size={15}
                        color={colors.accent}
                        style={{ marginLeft: 4 }}
                      />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>

            <View style={styles.previewCardFooter}>
              <View style={styles.availabilityStatus}>
                <View style={[styles.greenDot, { backgroundColor: selectedSpot.is_active ? '#10b981' : colors.placeholder }]} />
                <Text style={styles.availabilityText}>
                  Aktywne ogłoszenie · {selectedSpot.spot_type}
                </Text>
              </View>
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  header: {
    paddingTop: 54,
    paddingHorizontal: 20,
    paddingBottom: 14,
    backgroundColor: colors.surface,
  },
  logoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandIcon: {
    width: 34,
    height: 34,
    borderRadius: 9,
    backgroundColor: colors.brand,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  brandIconText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '800',
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 16,
    letterSpacing: -0.6,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  filterIconButton: {
    padding: 4,
  },
  filterChipsRow: {
    flexDirection: 'row',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.mutedSurface,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 9,
    marginRight: 8,
  },
  chipIcon: {
    marginRight: 6,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.heading,
    marginRight: 4,
  },
  mapContainer: {
    flex: 1,
    backgroundColor: colors.mapBackground,
    position: 'relative',
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
  loadingOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: colors.muted,
    fontWeight: '500',
  },
  errorText: {
    fontSize: 14,
    color: colors.dangerText,
    fontWeight: '600',
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  errorSub: {
    fontSize: 12,
    color: colors.placeholder,
    textAlign: 'center',
  },
  pricePin: {
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 18,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.16,
    shadowRadius: 5,
  },
  pricePinText: {
    fontWeight: '700',
    fontSize: 14,
    color: colors.accent,
  },
  activePin: {
    backgroundColor: colors.brand,
    transform: [{ scale: 1.1 }],
    elevation: 6,
    shadowOpacity: 0.25,
  },
  activePinText: {
    fontWeight: '800',
    fontSize: 15,
    color: '#ffffff',
  },
  nearbyPill: {
    position: 'absolute',
    top: 14,
    left: 14,
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  nearbyPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.label,
  },
  toggleListPill: {
    position: 'absolute',
    top: 14,
    right: 14,
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  toggleListText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  recenterButton: {
    position: 'absolute',
    bottom: 168,
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
  },
  osmAttribution: {
    position: 'absolute',
    bottom: 162,
    left: 14,
    fontSize: 9,
    color: colors.muted,
  },
  previewCard: {
    position: 'absolute',
    bottom: 10,
    left: 12,
    right: 12,
    backgroundColor: colors.surface,
    borderRadius: 22,
    padding: 14,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 10,
  },
  previewCardContent: {
    flexDirection: 'row',
  },
  spotThumbPlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 14,
    marginRight: 14,
    backgroundColor: colors.accentSurface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  spotInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  starText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  walkingDot: {
    color: colors.placeholder,
  },
  walkingText: {
    fontSize: 12,
    color: colors.secondary,
  },
  spotTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 2,
    letterSpacing: -0.3,
  },
  spotAddress: {
    fontSize: 12,
    color: colors.muted,
    marginBottom: 6,
  },
  priceActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceMain: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  priceUnit: {
    fontSize: 13,
    color: colors.secondary,
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
  },
  detailsButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.accent,
  },
  previewCardFooter: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.subtleBorder,
  },
  availabilityStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  greenDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#10b981',
    marginRight: 7,
  },
  availabilityText: {
    fontSize: 12,
    color: colors.label,
    fontWeight: '500',
  },
});
