export type SpotType = 'GARAGE' | 'DRIVEWAY' | 'OUTDOOR' | 'UNDERGROUND' | 'SURFACE';

export interface BackendSpotRequest {
  title: string;
  spot_number?: string;
  latitude: number;
  longitude: number;
  address_street: string;
  address_city: string;
  spot_type: string; // 'UNDERGROUND' | 'SURFACE' | 'DRIVEWAY' | 'GARAGE'
  max_vehicle_size: string; // 'COMPACT' | 'SEDAN' | 'SUV' | 'VAN'
  max_height_meters?: number;
  has_ev_charging?: boolean;
  access_type: string; // 'CODE_KEYPAD' | 'BARRIER_PHONE' | 'REMOTE' | 'OPEN'
  gate_pin_code?: string;
  gate_phone_number?: string;
  access_instructions?: string;
  hourly_rate: number;
  is_active?: boolean;
}

export interface BackendSpotResponse {
  id: string;
  owner_id: string;
  title: string;
  spot_number?: string;
  latitude: number;
  longitude: number;
  address_street: string;
  address_city: string;
  spot_type: string;
  max_vehicle_size: string;
  max_height_meters?: number;
  has_ev_charging?: boolean;
  access_type: string;
  gate_pin_code?: string;
  gate_phone_number?: string;
  access_instructions?: string;
  hourly_rate: number;
  is_active: boolean;
  sync_status?: string;
  created_at?: string;
}

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
