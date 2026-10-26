export type SpotType = 'GARAGE' | 'DRIVEWAY' | 'OUTDOOR';

export interface ParkingSpot {
  id: string;
  title: string;
  description: string;
  address: string;
  city: string;
  postalCode: string;
  latitude: number;
  longitude: number;
  hourlyPrice: number;
  spotType: SpotType;
  isCovered: boolean;
  isSecure: boolean;
  fitsSuv: boolean;
  rating: number;
  reviewCount: number;
  walkingMinutes: number;
  hostName: string;
  hostAvatar?: string;
  isHostVerified: boolean;
  imageUrl: string;
  availableFrom: string;
  availableTo: string;
}

export interface SpotSearchParams {
  query?: string;
  date?: string;
  timeFrom?: string;
  timeTo?: string;
  maxPrice?: number;
  latitude?: number;
  longitude?: number;
}
