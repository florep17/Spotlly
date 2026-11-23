package io.spotly.dto.booking;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.Instant;
import java.util.UUID;

public record CreateBookingRequest(
        @NotNull UUID spotId,
        @NotNull @Future Instant startDateTime,
        @NotNull Instant endDateTime,
        @NotBlank @Size(max = 50) String vehiclePlateNumber
) {}
