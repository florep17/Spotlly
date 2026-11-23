import { Booking, CreateBookingRequest } from '../../types/booking';
import { request } from './apiClient';

export const bookingsService = {
  async getUserBookings(): Promise<Booking[]> {
    return await request<Booking[]>('/bookings/my');
  },

  async createBooking(bookingData: CreateBookingRequest): Promise<Booking> {
    return await request<Booking>('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  },
};
