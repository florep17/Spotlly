import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { ParkingSpot } from '../types/spot';
import { MOCK_SPOTS } from '../services/api/spotsService';

interface SearchScreenProps {
  onSelectSpot: (spot: ParkingSpot) => void;
}

const garageThumb = require('../../assets/garage_thumb.png');
const mapKazimierz = require('../../assets/map_kazimierz.png');

export const SearchScreen: React.FC<SearchScreenProps> = ({ onSelectSpot }) => {
  const [selectedSpot, setSelectedSpot] = useState<ParkingSpot>(MOCK_SPOTS[0]);

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
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>JL</Text>
          </View>
        </View>

        <Text style={styles.tagline}>Miejsce na Twój dzień.</Text>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Feather name="search" size={18} color="#4b5563" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Kazimierz, Kraków"
            placeholderTextColor="#111827"
            defaultValue="Kazimierz, Kraków"
          />
          <TouchableOpacity style={styles.filterIconButton} activeOpacity={0.7}>
            <Feather name="sliders" size={18} color="#374151" />
          </TouchableOpacity>
        </View>

        {/* Filter Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterChipsRow}>
          <TouchableOpacity style={styles.chip} activeOpacity={0.7}>
            <Feather name="calendar" size={13} color="#374151" style={styles.chipIcon} />
            <Text style={styles.chipText}>12 paź</Text>
            <Feather name="chevron-down" size={14} color="#6b7280" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.chip} activeOpacity={0.7}>
            <Feather name="clock" size={13} color="#374151" style={styles.chipIcon} />
            <Text style={styles.chipText}>10:00–13:00</Text>
            <Feather name="chevron-down" size={14} color="#6b7280" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.chip} activeOpacity={0.7}>
            <Text style={styles.chipText}>Poniżej 10 zł</Text>
            <Feather name="chevron-down" size={14} color="#6b7280" />
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Map View Container */}
      <View style={styles.mapContainer}>
        {/* Authentic Kazimierz Map Background */}
        <Image source={mapKazimierz} style={styles.mapBackground} resizeMode="cover" />

        {/* Interactive Floating Price Pins */}
        <TouchableOpacity
          style={[styles.pricePin, styles.activePin, { top: 180, left: 165 }]}
          onPress={() => setSelectedSpot(MOCK_SPOTS[0])}
          activeOpacity={0.9}
        >
          <Text style={styles.activePinText}>5 zł</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.pricePin, { top: 78, left: 245 }]}
          onPress={() => setSelectedSpot(MOCK_SPOTS[1])}
          activeOpacity={0.9}
        >
          <Text style={styles.pricePinText}>8 zł</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.pricePin, { top: 135, left: 45 }]}
          onPress={() => setSelectedSpot(MOCK_SPOTS[2])}
          activeOpacity={0.9}
        >
          <Text style={styles.pricePinText}>4 zł</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.pricePin, { top: 295, left: 75 }]}
          onPress={() => setSelectedSpot(MOCK_SPOTS[2])}
          activeOpacity={0.9}
        >
          <Text style={styles.pricePinText}>3 zł</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.pricePin, { top: 290, left: 285 }]}
          onPress={() => setSelectedSpot(MOCK_SPOTS[0])}
          activeOpacity={0.9}
        >
          <Text style={styles.pricePinText}>6 zł</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.pricePin, { top: 375, left: 228 }]}
          onPress={() => setSelectedSpot(MOCK_SPOTS[1])}
          activeOpacity={0.9}
        >
          <Text style={styles.pricePinText}>7 zł</Text>
        </TouchableOpacity>

        {/* Top Badges */}
        <View style={styles.nearbyPill}>
          <Text style={styles.nearbyPillText}>12 miejsc w pobliżu</Text>
        </View>

        <TouchableOpacity style={styles.toggleListPill} activeOpacity={0.8}>
          <Feather name="list" size={14} color="#111827" style={{ marginRight: 6 }} />
          <Text style={styles.toggleListText}>Lista</Text>
        </TouchableOpacity>

        {/* Location Crosshair Button */}
        <TouchableOpacity style={styles.recenterButton} activeOpacity={0.85}>
          <MaterialCommunityIcons name="crosshairs-gps" size={24} color="#1e4620" />
        </TouchableOpacity>

        <Text style={styles.osmAttribution}>© OpenStreetMap</Text>

        {/* Bottom Preview Spot Card */}
        {selectedSpot && (
          <View style={styles.previewCard}>
            <View style={styles.previewCardContent}>
              <Image source={garageThumb} style={styles.spotThumb} />
              <View style={styles.spotInfo}>
                <View style={styles.ratingRow}>
                  <Ionicons
                    name="star-outline"
                    size={14}
                    color="#1b5e3a"
                    style={{ marginRight: 4 }}
                  />
                  <Text style={styles.starText}>
                    4,9 <Text style={styles.reviewCount}>(32)</Text>
                  </Text>
                  <Text style={styles.walkingDot}> · </Text>
                  <Text style={styles.walkingText}>3 min pieszo</Text>
                </View>

                <Text style={styles.spotTitle}>{selectedSpot.title}</Text>
                <Text style={styles.spotAddress}>
                  {selectedSpot.address} · {selectedSpot.isCovered ? 'Zadaszone' : 'Odkryte'}
                </Text>

                <View style={styles.priceActionRow}>
                  <View style={styles.priceRow}>
                    <Text style={styles.priceMain}>{selectedSpot.hourlyPrice.toFixed(0)} zł</Text>
                    <Text style={styles.priceUnit}> / godz.</Text>
                  </View>

                  <TouchableOpacity
                    style={styles.detailsButton}
                    onPress={() => onSelectSpot(selectedSpot)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.detailsButtonText}>Zobacz miejsce</Text>
                    <Feather
                      name="arrow-right"
                      size={15}
                      color="#1b5e3a"
                      style={{ marginLeft: 4 }}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View style={styles.previewCardFooter}>
              <View style={styles.availabilityStatus}>
                <View style={styles.greenDot} />
                <Text style={styles.availabilityText}>
                  Dostępne dziś, {selectedSpot.availableFrom}–{selectedSpot.availableTo}
                </Text>
              </View>
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    paddingTop: 54,
    paddingHorizontal: 20,
    paddingBottom: 14,
    backgroundColor: '#ffffff',
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
    backgroundColor: '#1b5e3a',
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
    color: '#111827',
    letterSpacing: -0.5,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#e6f3eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#1b5e3a',
    fontWeight: '700',
    fontSize: 14,
  },
  tagline: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 16,
    letterSpacing: -0.6,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
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
    color: '#111827',
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
    backgroundColor: '#f3f4f6',
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
    color: '#1f2937',
    marginRight: 4,
  },
  mapContainer: {
    flex: 1,
    backgroundColor: '#e5eae8',
    position: 'relative',
    overflow: 'hidden',
  },
  mapBackground: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  pricePin: {
    position: 'absolute',
    backgroundColor: '#ffffff',
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
    color: '#1b5e3a',
  },
  activePin: {
    backgroundColor: '#1b5e3a',
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
    backgroundColor: '#ffffff',
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
    color: '#374151',
  },
  toggleListPill: {
    position: 'absolute',
    top: 14,
    right: 14,
    backgroundColor: '#ffffff',
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
    color: '#111827',
  },
  recenterButton: {
    position: 'absolute',
    bottom: 168,
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ffffff',
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
    color: '#6b7280',
  },
  previewCard: {
    position: 'absolute',
    bottom: 10,
    left: 12,
    right: 12,
    backgroundColor: '#ffffff',
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
  spotThumb: {
    width: 96,
    height: 96,
    borderRadius: 14,
    marginRight: 14,
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
    color: '#111827',
  },
  reviewCount: {
    color: '#6b7280',
    fontWeight: '400',
  },
  walkingDot: {
    color: '#9ca3af',
  },
  walkingText: {
    fontSize: 12,
    color: '#4b5563',
  },
  spotTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 2,
    letterSpacing: -0.3,
  },
  spotAddress: {
    fontSize: 12,
    color: '#6b7280',
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
    color: '#111827',
  },
  priceUnit: {
    fontSize: 13,
    color: '#4b5563',
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
  },
  detailsButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1b5e3a',
  },
  previewCardFooter: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
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
    color: '#374151',
    fontWeight: '500',
  },
});
