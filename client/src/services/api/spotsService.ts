import { ParkingSpot, SpotSearchParams } from '../../types/spot';
import { request } from './apiClient';

/**
 * Serwis obsługujący punkty parkingowe i integrację z wyszukiwarką
 */
export const spotsService = {
  /**
   * Pobieranie listy dostępnych miejsc z filtrowaniem
   */
  async searchSpots(params: SpotSearchParams): Promise<ParkingSpot[]> {
    const queryParams = new URLSearchParams();
    if (params.query) queryParams.append('query', params.query);
    if (params.date) queryParams.append('date', params.date);
    if (params.timeFrom) queryParams.append('from', params.timeFrom);
    if (params.timeTo) queryParams.append('to', params.timeTo);
    if (params.maxPrice) queryParams.append('maxPrice', params.maxPrice.toString());

    try {
      return await request<ParkingSpot[]>(`/spots/search?${queryParams.toString()}`);
    } catch {
      // Fallback do danych lokalnych (dla wersji prototypowej / offline demo)
      return MOCK_SPOTS;
    }
  },

  /**
   * Pobieranie szczegółów miejsca
   */
  async getSpotById(id: string): Promise<ParkingSpot> {
    try {
      return await request<ParkingSpot>(`/spots/${id}`);
    } catch {
      const found = MOCK_SPOTS.find((s) => s.id === id);
      if (!found) throw new Error('Miejsce nie znalezione');
      return found;
    }
  },

  /**
   * Dodawanie nowego miejsca parkingowego (dla właściciela)
   */
  async createSpot(spotData: Partial<ParkingSpot>): Promise<ParkingSpot> {
    try {
      return await request<ParkingSpot>('/spots', {
        method: 'POST',
        body: JSON.stringify(spotData),
      });
    } catch {
      // Symulacja pomyślnego zapisu w trybie prototypu
      const newSpot: ParkingSpot = {
        id: `spot-${Date.now()}`,
        title: spotData.title || 'Nowe miejsce parkingowe',
        description: spotData.description || 'Prywatne miejsce parkingowe',
        address: spotData.address || 'ul. Dajwór 14',
        city: spotData.city || 'Kraków',
        postalCode: spotData.postalCode || '31-052',
        latitude: 50.051,
        longitude: 19.947,
        hourlyPrice: spotData.hourlyPrice || 5.0,
        spotType: spotData.spotType || 'GARAGE',
        isCovered: true,
        isSecure: true,
        fitsSuv: true,
        rating: 5.0,
        reviewCount: 0,
        walkingMinutes: 3,
        hostName: 'Ty',
        isHostVerified: true,
        imageUrl:
          'https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=800&q=80',
        availableFrom: '08:00',
        availableTo: '16:00',
      };
      return newSpot;
    }
  },
};

export const MOCK_SPOTS: ParkingSpot[] = [
  {
    id: 'spot-1',
    title: 'Garaż na Kazimierzu',
    description:
      'Spokojny garaż z wygodnym wjazdem na krakowskim Kazimierzu. Instrukcje wjazdu otrzymasz po rezerwacji.',
    address: 'Dajwór 12',
    city: 'Kraków',
    postalCode: '31-052',
    latitude: 50.052,
    longitude: 19.946,
    hourlyPrice: 5.0,
    spotType: 'GARAGE',
    isCovered: true,
    isSecure: true,
    fitsSuv: true,
    rating: 4.9,
    reviewCount: 32,
    walkingMinutes: 3,
    hostName: 'Anna',
    isHostVerified: true,
    imageUrl:
      'https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=800&q=80',
    availableFrom: '10:00',
    availableTo: '13:00',
  },
  {
    id: 'spot-2',
    title: 'Podjazd przy Miodowej',
    description: 'Bezpieczny podjazd przed domem jednorodzinnym, monitorowany całą dobę.',
    address: 'Miodowa 8',
    city: 'Kraków',
    postalCode: '31-055',
    latitude: 50.054,
    longitude: 19.944,
    hourlyPrice: 8.0,
    spotType: 'DRIVEWAY',
    isCovered: false,
    isSecure: true,
    fitsSuv: true,
    rating: 4.8,
    reviewCount: 19,
    walkingMinutes: 5,
    hostName: 'Piotr',
    isHostVerified: true,
    imageUrl:
      'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=800&q=80',
    availableFrom: '08:00',
    availableTo: '18:00',
  },
  {
    id: 'spot-3',
    title: 'Miejsce postojowe Józefa',
    description: 'Wygodne zewnętrzne miejsce parkingowe w podwórzu z bramą na pilota.',
    address: 'Józefa 4',
    city: 'Kraków',
    postalCode: '31-056',
    latitude: 50.051,
    longitude: 19.942,
    hourlyPrice: 4.0,
    spotType: 'OUTDOOR',
    isCovered: false,
    isSecure: true,
    fitsSuv: false,
    rating: 4.7,
    reviewCount: 14,
    walkingMinutes: 2,
    hostName: 'Michał',
    isHostVerified: true,
    imageUrl:
      'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=800&q=80',
    availableFrom: '09:00',
    availableTo: '17:00',
  },
];
