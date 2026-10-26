export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

export interface Booking {
  id: string;
  spotId: string;
  spotTitle: string;
  spotAddress: string;
  driverId: string;
  startDateTime: string;
  endDateTime: string;
  durationHours: number;
  hourlyRate: number;
  serviceFee: number;
  totalPrice: number;
  status: BookingStatus;
  accessCode?: string;
  createdAt: string;
}

export interface CreateBookingRequest {
  spotId: string;
  startDateTime: string;
  endDateTime: string;
  paymentMethod: 'TEST_CARD' | 'BLIK' | 'APPLE_PAY';
}
