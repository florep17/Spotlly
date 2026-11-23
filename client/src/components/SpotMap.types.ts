import { BackendSpotResponse } from '../types/spot';

export interface MapPoint {
  latitude: number;
  longitude: number;
}

export interface SpotMapProps {
  spots?: BackendSpotResponse[];
  selectedSpot?: BackendSpotResponse | null;
  onSelectSpot?: (spot: BackendSpotResponse) => void;
  recenterKey?: number;
  point?: MapPoint | null;
  onPickPoint?: (point: MapPoint) => void;
}

export const emptySpots: BackendSpotResponse[] = [];
