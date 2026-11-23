package io.spotly.dto.booking;

import io.spotly.entity.Booking;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record BookingResponse(
        String id,
        UUID spotId,
        String spotTitle,
        String spotAddress,
        String driverId,
        Instant startDateTime,
        Instant endDateTime,
        double durationHours,
        BigDecimal hourlyRate,
        BigDecimal totalPrice,
        String status,
        String accessCode,
        Instant createdAt
) {
    public static BookingResponse fromEntity(Booking booking) {
        return new BookingResponse(
                booking.getId(), booking.getSpot().getId(), booking.getSpot().getTitle(),
                booking.getSpot().getAddressStreet() + ", " + booking.getSpot().getAddressCity(),
                booking.getDriver().getId(), Instant.ofEpochMilli(booking.getStartTimeUtc()),
                Instant.ofEpochMilli(booking.getEndTimeUtc()),
                (booking.getEndTimeUtc() - booking.getStartTimeUtc()) / 3_600_000.0,
                booking.getSpot().getHourlyRate(), booking.getTotalCharged(), booking.getStatus(),
                booking.getAccessUnlockTimeUtc() != null && Instant.now().toEpochMilli() >= booking.getAccessUnlockTimeUtc()
                        ? booking.getSpot().getAccessInstructions() != null
                            ? booking.getSpot().getAccessInstructions()
                            : booking.getSpot().getGatePinCode()
                        : null,
                booking.getCreatedAt());
    }
}
