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
import { ParkingSpot } from '../types/spot';
import { MOCK_SPOTS } from '../services/api/spotsService';

interface SearchScreenProps {
  onSelectSpot: (spot: ParkingSpot) => void;
}

export const SearchScreen: React.FC<SearchScreenProps> = ({ onSelectSpot }) => {
  const [selectedSpot, setSelectedSpot] = useState<ParkingSpot>(MOCK_SPOTS[0]);
  const [activeFilter, setActiveFilter] = useState<'map' | 'list'>('map');

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
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Kazimierz, Kraków"
            placeholderTextColor="#1f2937"
            defaultValue="Kazimierz, Kraków"
          />
          <TouchableOpacity style={styles.filterIconButton}>
            <Text style={styles.filterIconText}>⚙️</Text>
          </TouchableOpacity>
        </View>

        {/* Filter Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterChipsRow}>
          <TouchableOpacity style={styles.chip}>
            <Text style={styles.chipText}>📅 12 paź ▾</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.chip}>
            <Text style={styles.chipText}>⏰ 10:00–13:00 ▾</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.chip}>
            <Text style={styles.chipText}>Poniżej 10 zł ▾</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Map Simulation Container */}
      <View style={styles.mapContainer}>
        {/* Map Grid & Road Simulation */}
        <View style={styles.mapGrid}>
          <View style={[styles.buildingBlock, { top: 20, left: 10, width: 90, height: 70 }]} />
          <View style={[styles.buildingBlock, { top: 20, left: 120, width: 90, height: 70 }]} />
          <View style={[styles.buildingBlock, { top: 20, left: 230, width: 90, height: 70 }]} />

          <View style={[styles.buildingBlock, { top: 120, left: 10, width: 90, height: 90 }]} />
          <View style={[styles.buildingBlock, { top: 120, left: 120, width: 90, height: 90 }]} />
          <View style={[styles.parkBlock, { top: 120, left: 230, width: 90, height: 90 }]}>
            <Text style={styles.parkLabel}>Skwer Juda</Text>
          </View>

          <View style={[styles.buildingBlock, { top: 230, left: 10, width: 90, height: 80 }]} />
          <View style={[styles.buildingBlock, { top: 230, left: 120, width: 90, height: 80 }]} />
          <View style={[styles.buildingBlock, { top: 230, left: 230, width: 90, height: 80 }]} />

          {/* Street Labels */}
          <Text style={[styles.streetLabel, { top: 98, left: 130 }]}>Miodowa</Text>
          <Text style={[styles.streetLabel, { top: 215, left: 10 }]}>Józefa</Text>
          <Text
            style={[styles.streetLabel, { top: 260, left: 190, transform: [{ rotate: '-45deg' }] }]}
          >
            Starowiślna
          </Text>

          {/* Interactive Price Pins on Map */}
          <TouchableOpacity
            style={[styles.pricePin, styles.activePin, { top: 180, left: 170 }]}
            onPress={() => setSelectedSpot(MOCK_SPOTS[0])}
          >
            <Text style={styles.activePinText}>5 zł</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.pricePin, { top: 75, left: 250 }]}
            onPress={() => setSelectedSpot(MOCK_SPOTS[1])}
          >
            <Text style={styles.pricePinText}>8 zł</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.pricePin, { top: 160, left: 45 }]}
            onPress={() => setSelectedSpot(MOCK_SPOTS[2])}
          >
            <Text style={styles.pricePinText}>4 zł</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.pricePin, { top: 270, left: 70 }]}
            onPress={() => setSelectedSpot(MOCK_SPOTS[2])}
          >
            <Text style={styles.pricePinText}>3 zł</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.pricePin, { top: 280, left: 280 }]}
            onPress={() => setSelectedSpot(MOCK_SPOTS[0])}
          >
            <Text style={styles.pricePinText}>6 zł</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.pricePin, { top: 320, left: 230 }]}
            onPress={() => setSelectedSpot(MOCK_SPOTS[1])}
          >
            <Text style={styles.pricePinText}>7 zł</Text>
          </TouchableOpacity>

          {/* Current User Location Dot */}
          <View style={[styles.userDot, { top: 220, left: 135 }]} />

          {/* Top Overlays */}
          <View style={styles.nearbyPill}>
            <Text style={styles.nearbyPillText}>12 miejsc w pobliżu</Text>
          </View>

          <TouchableOpacity
            style={styles.toggleListPill}
            onPress={() => setActiveFilter(activeFilter === 'map' ? 'list' : 'map')}
          >
            <Text style={styles.toggleListText}>📋 Lista</Text>
          </TouchableOpacity>

          <View style={styles.recenterButton}>
            <Text style={styles.recenterIcon}>🎯</Text>
          </View>

          <Text style={styles.osmAttribution}>© OpenStreetMap</Text>
        </View>

        {/* Bottom Preview Spot Card */}
        {selectedSpot && (
          <View style={styles.previewCard}>
            <View style={styles.previewCardContent}>
              <Image source={{ uri: selectedSpot.imageUrl }} style={styles.spotThumb} />
              <View style={styles.spotInfo}>
                <View style={styles.ratingRow}>
                  <Text style={styles.starText}>⭐ {selectedSpot.rating}</Text>
                  <Text style={styles.reviewCount}>({selectedSpot.reviewCount})</Text>
                  <Text style={styles.walkingDot}> · </Text>
                  <Text style={styles.walkingText}>{selectedSpot.walkingMinutes} min pieszo</Text>
                </View>

                <Text style={styles.spotTitle}>{selectedSpot.title}</Text>
                <Text style={styles.spotAddress}>
                  {selectedSpot.address} · {selectedSpot.isCovered ? 'Zadaszone' : 'Odkryte'}
                </Text>

                <View style={styles.priceRow}>
                  <Text style={styles.priceMain}>{selectedSpot.hourlyPrice.toFixed(0)} zł</Text>
                  <Text style={styles.priceUnit}> / godz.</Text>
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

              <TouchableOpacity
                style={styles.detailsButton}
                onPress={() => onSelectSpot(selectedSpot)}
              >
                <Text style={styles.detailsButtonText}>Zobacz miejsce ➔</Text>
              </TouchableOpacity>
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
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  logoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#1b5e3a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandIconText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e5f3ea',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#1b5e3a',
    fontWeight: '700',
    fontSize: 14,
  },
  tagline: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 14,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 10,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  filterIconButton: {
    padding: 4,
  },
  filterIconText: {
    fontSize: 18,
  },
  filterChipsRow: {
    flexDirection: 'row',
  },
  chip: {
    backgroundColor: '#f3f4f6',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  mapContainer: {
    flex: 1,
    backgroundColor: '#eef2f6',
    position: 'relative',
  },
  mapGrid: {
    flex: 1,
    position: 'relative',
  },
  buildingBlock: {
    position: 'absolute',
    backgroundColor: '#e2e8f0',
    borderRadius: 8,
  },
  parkBlock: {
    position: 'absolute',
    backgroundColor: '#d1fae5',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  parkLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#065f46',
  },
  streetLabel: {
    position: 'absolute',
    fontSize: 11,
    fontWeight: '500',
    color: '#94a3b8',
  },
  pricePin: {
    position: 'absolute',
    backgroundColor: '#ffffff',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  pricePinText: {
    fontWeight: '700',
    fontSize: 13,
    color: '#111827',
  },
  activePin: {
    backgroundColor: '#1b5e3a',
    transform: [{ scale: 1.1 }],
  },
  activePinText: {
    fontWeight: '700',
    fontSize: 14,
    color: '#ffffff',
  },
  userDot: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#1b5e3a',
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  nearbyPill: {
    position: 'absolute',
    top: 14,
    left: 14,
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
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
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
  },
  toggleListText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111827',
  },
  recenterButton: {
    position: 'absolute',
    bottom: 170,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  recenterIcon: {
    fontSize: 20,
  },
  osmAttribution: {
    position: 'absolute',
    bottom: 160,
    left: 14,
    fontSize: 10,
    color: '#94a3b8',
  },
  previewCard: {
    position: 'absolute',
    bottom: 10,
    left: 14,
    right: 14,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 14,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  previewCardContent: {
    flexDirection: 'row',
  },
  spotThumb: {
    width: 90,
    height: 90,
    borderRadius: 12,
    marginRight: 14,
    backgroundColor: '#e5e7eb',
  },
  spotInfo: {
    flex: 1,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  starText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111827',
  },
  reviewCount: {
    fontSize: 12,
    color: '#6b7280',
  },
  walkingDot: {
    fontSize: 12,
    color: '#9ca3af',
  },
  walkingText: {
    fontSize: 12,
    color: '#4b5563',
  },
  spotTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  spotAddress: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 6,
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
    fontSize: 12,
    color: '#4b5563',
  },
  previewCardFooter: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    marginRight: 6,
  },
  availabilityText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
  detailsButton: {
    paddingVertical: 4,
  },
  detailsButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1b5e3a',
  },
});
