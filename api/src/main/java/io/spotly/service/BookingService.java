package io.spotly.service;

import io.spotly.dto.booking.BookingResponse;
import io.spotly.dto.booking.CreateBookingRequest;
import io.spotly.entity.Booking;
import io.spotly.entity.ParkingSpot;
import io.spotly.entity.User;
import io.spotly.repository.BookingRepository;
import io.spotly.repository.ParkingSpotRepository;
import io.spotly.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BookingService {
    private final BookingRepository bookingRepository;
    private final ParkingSpotRepository parkingSpotRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<BookingResponse> getMyBookings(String driverId) {
        return bookingRepository.findByDriverId(driverId).stream()
                .map(BookingResponse::fromEntity).toList();
    }

    @Transactional
    public BookingResponse createBooking(CreateBookingRequest request, String driverId) {
        if (!request.endDateTime().isAfter(request.startDateTime())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "End time must be after start time");
        }
        if (Duration.between(request.startDateTime(), request.endDateTime()).toDays() > 30) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Booking is too long");
        }
        ParkingSpot spot = parkingSpotRepository.findWithLockById(request.spotId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Parking spot not found"));
        if (!Boolean.TRUE.equals(spot.getIsActive())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Parking spot is unavailable");
        }
        User driver = userRepository.findById(driverId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
        long start = request.startDateTime().toEpochMilli();
        long end = request.endDateTime().toEpochMilli();
        if (!bookingRepository.findOverlappingBookings(spot.getId(), start, end).isEmpty()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Parking spot is already booked for this time");
        }
        BigDecimal hours = BigDecimal.valueOf(end - start)
                .divide(BigDecimal.valueOf(3_600_000), 4, RoundingMode.HALF_UP);
        BigDecimal price = spot.getHourlyRate().multiply(hours).setScale(2, RoundingMode.HALF_UP);
        Booking booking = Booking.builder()
                .id(UUID.randomUUID().toString())
                .spot(spot).driver(driver)
                .vehiclePlateNumber(request.vehiclePlateNumber().trim())
                .startTimeUtc(start).endTimeUtc(end)
                .status("CONFIRMED").totalCharged(price).currency("PLN")
                .accessStatus("LOCKED_UNTIL_15M_BEFORE")
                .accessUnlockTimeUtc(start - 900_000)
                .build();
        return BookingResponse.fromEntity(bookingRepository.saveAndFlush(booking));
    }
}
