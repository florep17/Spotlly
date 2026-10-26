import { Booking, CreateBookingRequest } from '../../types/booking';
import { request } from './apiClient';

/**
 * Serwis obsługujący rezerwacje i testowe płatności
 */
export const bookingsService = {
  /**
   * Pobieranie listy rezerwacji zalogowanego użytkownika
   */
  async getUserBookings(): Promise<Booking[]> {
    try {
      return await request<Booking[]>('/bookings/my');
    } catch {
      return MOCK_BOOKINGS;
    }
  },

  /**
   * Tworzenie nowej rezerwacji z blokadą kolizji i symulacją płatności
   */
  async createBooking(bookingData: CreateBookingRequest): Promise<Booking> {
    try {
      return await request<Booking>('/bookings', {
        method: 'POST',
        body: JSON.stringify(bookingData),
      });
    } catch {
      // Symulacja rezerwacji w wersji prototypowej
      const durationHours = 3;
      const hourlyRate = 5.0;
      const serviceFee = 2.0;
      const totalPrice = durationHours * hourlyRate + serviceFee;

      const newBooking: Booking = {
        id: `book-${Date.now()}`,
        spotId: bookingData.spotId,
        spotTitle: 'Garaż na Kazimierzu',
        spotAddress: 'Dajwór 12, Kraków',
        driverId: 'user-current',
        startDateTime: bookingData.startDateTime,
        endDateTime: bookingData.endDateTime,
        durationHours,
        hourlyRate,
        serviceFee,
        totalPrice,
        status: 'CONFIRMED',
        accessCode: 'Brama: 4821#, Stanowisko nr 14',
        createdAt: new Date().toISOString(),
      };
      MOCK_BOOKINGS.unshift(newBooking);
      return newBooking;
    }
  },
};

export const MOCK_BOOKINGS: Booking[] = [
  {
    id: 'book-101',
    spotId: 'spot-1',
    spotTitle: 'Garaż na Kazimierzu',
    spotAddress: 'Dajwór 12, Kraków',
    driverId: 'user-current',
    startDateTime: '2026-10-28T10:00:00Z',
    endDateTime: '2026-10-28T13:00:00Z',
    durationHours: 3,
    hourlyRate: 5.0,
    serviceFee: 2.0,
    totalPrice: 17.0,
    status: 'CONFIRMED',
    accessCode: 'Brama: 4821#, Stanowisko nr 14',
    createdAt: '2026-10-26T10:00:00Z',
  },
];
