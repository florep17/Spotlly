import React, { useEffect, useRef, useState } from 'react';
import { useDarkMode, useThemeColors } from '../theme/theme';
import { SpotMapProps, emptySpots } from './SpotMap.types';
import 'leaflet/dist/leaflet.css';

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
  const elementRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<import('leaflet').Map | null>(null);
  const markerLayerRef = useRef<import('leaflet').LayerGroup | null>(null);
  const leafletRef = useRef<typeof import('leaflet') | null>(null);
  const previousBoundsKey = useRef('');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    import('leaflet').then((L) => {
      if (!active || !elementRef.current || mapRef.current) return;
      leafletRef.current = L;
      const map = L.map(elementRef.current).setView([50.0614, 19.9383], 12);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);
      mapRef.current = map;
      markerLayerRef.current = L.layerGroup().addTo(map);
      setReady(true);
    });
    return () => {
      active = false;
      mapRef.current?.remove();
      mapRef.current = null;
      markerLayerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const tilePane = mapRef.current?.getPane('tilePane');
    if (tilePane) {
      tilePane.style.filter = darkMode ? 'invert(0.9) hue-rotate(180deg) saturate(0.65)' : '';
    }
  }, [darkMode, ready]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !onPickPoint) return;

    const pick = (latLng: import('leaflet').LatLng) => {
      const { lat, lng } = map.wrapLatLng(latLng);
      onPickPoint({ latitude: lat, longitude: lng });
    };
    const onClick = (event: import('leaflet').LeafletMouseEvent) => pick(event.latlng);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.target === map.getContainer() && (event.key === 'Enter' || event.key === ' ')) {
        event.preventDefault();
        pick(map.getCenter());
      }
    };

    map.on('click', onClick);
    map.getContainer().addEventListener('keydown', onKeyDown);
    return () => {
      map.off('click', onClick);
      map.getContainer().removeEventListener('keydown', onKeyDown);
    };
  }, [onPickPoint, ready]);

  useEffect(() => {
    const L = leafletRef.current;
    const map = mapRef.current;
    const layer = markerLayerRef.current;
    if (!L || !map || !layer) return;
    layer.clearLayers();
    if (point) {
      L.marker([point.latitude, point.longitude], {
        interactive: false,
        keyboard: false,
        icon: L.divIcon({
          className: 'selected-location-pin',
          html: `<span style="display:block;width:22px;height:22px;background:${colors.brand};border:2px solid white;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 2px 6px #0006"></span>`,
          iconSize: [26, 26],
          iconAnchor: [13, 22],
        }),
      }).addTo(layer);
    }
    const points: [number, number][] = [];
    for (const spot of spots) {
      const latitude = Number(spot.latitude);
      const longitude = Number(spot.longitude);
      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) continue;
      points.push([latitude, longitude]);
      const active = selectedSpot?.id === spot.id;
      const icon = L.divIcon({
        className: '',
        html: `<span style="display:inline-block;white-space:nowrap;background:${active ? colors.brand : colors.surface};color:${active ? '#fff' : colors.accent};border-radius:18px;padding:7px 12px;box-shadow:0 2px 8px #0003;font-weight:700">${Number(spot.hourly_rate).toFixed(0)} zł</span>`,
        iconSize: [56, 32],
        iconAnchor: [28, 16],
      });
      L.marker([latitude, longitude], { icon })
        .on('click', () => onSelectSpot?.(spot))
        .addTo(layer);
    }
    const boundsKey = `${recenterKey}:${points.map(([lat, lon]) => `${lat},${lon}`).join(';')}`;
    if (points.length && boundsKey !== previousBoundsKey.current) {
      map.fitBounds(points, { padding: [60, 60], maxZoom: 16 });
      previousBoundsKey.current = boundsKey;
    }
  }, [spots, selectedSpot, onSelectSpot, recenterKey, ready, colors, point]);

  return React.createElement('div', {
    ref: elementRef,
    'aria-label': onPickPoint
      ? 'Mapa wyboru miejsca. Użyj strzałek, aby przesunąć mapę, i Enter, aby wybrać jej środek.'
      : undefined,
    style: { width: '100%', height: '100%', backgroundColor: colors.mapBackground },
  });
}
