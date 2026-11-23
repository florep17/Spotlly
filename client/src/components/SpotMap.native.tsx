import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useDarkMode, useThemeColors } from '../theme/theme';
import { BackendSpotResponse } from '../types/spot';
import { SpotMapProps, emptySpots } from './SpotMap.types';

const coordinates = (spot: BackendSpotResponse) => ({
  latitude: Number(spot.latitude),
  longitude: Number(spot.longitude),
});

export function SpotMap({
  spots = emptySpots,
  selectedSpot,
  onSelectSpot,
  recenterKey = 0,
  point,
  onPickPoint,
}: SpotMapProps) {
  const darkMode = useDarkMode();
  const colors = useThemeColors();
  const mapRef = useRef<MapView>(null);
  const fitSpots = () => {
    const valid = spots
      .map(coordinates)
      .filter((point) => Number.isFinite(point.latitude) && Number.isFinite(point.longitude));
    if (valid.length === 1) {
      mapRef.current?.animateToRegion(
        { ...valid[0], latitudeDelta: 0.02, longitudeDelta: 0.02 },
        400
      );
    } else if (valid.length > 1) {
      mapRef.current?.fitToCoordinates(valid, {
        edgePadding: { top: 70, right: 70, bottom: 220, left: 70 },
        animated: true,
      });
    }
  };
  useEffect(fitSpots, [spots, recenterKey]);

  return (
    <MapView
      ref={mapRef}
      userInterfaceStyle={darkMode ? 'dark' : 'light'}
      style={StyleSheet.absoluteFill}
      initialRegion={{
        latitude: 50.0614,
        longitude: 19.9383,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }}
      onMapReady={fitSpots}
      onPress={onPickPoint ? (event) => onPickPoint(event.nativeEvent.coordinate) : undefined}
    >
      {point && <Marker coordinate={point} title="Wybrane miejsce" />}
      {spots.map((spot) => {
        const point = coordinates(spot);
        if (!Number.isFinite(point.latitude) || !Number.isFinite(point.longitude)) return null;
        const active = selectedSpot?.id === spot.id;
        return (
          <Marker key={spot.id} coordinate={point} onPress={() => onSelectSpot?.(spot)}>
            <View style={[styles.pin, { backgroundColor: active ? colors.brand : colors.surface }]}>
              <Text style={[styles.pinText, { color: active ? 'white' : colors.accent }]}>
                {Number(spot.hourly_rate).toFixed(0)} zł
              </Text>
            </View>
          </Marker>
        );
      })}
    </MapView>
  );
}

const styles = StyleSheet.create({
  pin: { borderRadius: 18, paddingHorizontal: 12, paddingVertical: 7, elevation: 4 },
  pinText: { fontWeight: '700' },
});
