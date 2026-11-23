import {
  ParkingSpot,
  SpotSearchParams,
  BackendSpotRequest,
  BackendSpotResponse,
} from '../../types/spot';
import { request } from './apiClient';

/**
 * Serwis obsługujący punkty parkingowe i integrację z backendem Spring Boot
 */
export const spotsService = {
  /**
   * Pobieranie listy moich miejsc parkingowych (Host Dashboard)
   * Endpoint: GET /api/v1/spots
   */
  async getMySpots(): Promise<BackendSpotResponse[]> {
    return await request<BackendSpotResponse[]>('/spots', {
      method: 'GET',
    });
  },

  /**
   * Pobieranie wszystkich aktywnych miejsc parkingowych (do mapy)
   * Endpoint: GET /api/v1/spots/all
   */
  async getAllSpots(): Promise<BackendSpotResponse[]> {
    return await request<BackendSpotResponse[]>('/spots/all', {
      includeSession: false,
      method: 'GET',
    });
  },

  /**
   * Dodawanie nowego miejsca parkingowego przypisanego do zalogowanego konta
   * Endpoint: POST /api/v1/spots
   */
  async createSpot(spotData: BackendSpotRequest): Promise<BackendSpotResponse> {
    return await request<BackendSpotResponse>('/spots', {
      method: 'POST',
      body: JSON.stringify(spotData),
    });
  },

  /**
   * Usuwanie miejsca parkingowego należącego do użytkownika
   * Endpoint: DELETE /api/v1/spots/{id}
   */
  async deleteSpot(id: string): Promise<void> {
    await request<void>(`/spots/${id}`, {
      method: 'DELETE',
    });
  },

  /**
   * Pobieranie listy dostępnych miejsc z filtrowaniem (wyszukiwarka)
   */
  async searchSpots(params: SpotSearchParams): Promise<ParkingSpot[]> {
    const queryParams = new URLSearchParams();
    if (params.query) queryParams.append('query', params.query);
    if (params.date) queryParams.append('date', params.date);
    if (params.timeFrom) queryParams.append('from', params.timeFrom);
    if (params.timeTo) queryParams.append('to', params.timeTo);
    if (params.maxPrice) queryParams.append('maxPrice', params.maxPrice.toString());

    return await request<ParkingSpot[]>(`/spots/search?${queryParams.toString()}`);
  },

  /**
   * Pobieranie szczegółów miejsca
   */
  async getSpotById(id: string): Promise<ParkingSpot> {
    return await request<ParkingSpot>(`/spots/${id}`);
  },
};
