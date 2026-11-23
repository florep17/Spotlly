package io.spotly.dto.spot;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.spotly.entity.ParkingSpot;

import java.math.BigDecimal;
import java.util.UUID;

public record PublicSpotResponse(
        UUID id,
        String title,
        BigDecimal latitude,
        BigDecimal longitude,
        @JsonProperty("address_street") String addressStreet,
        @JsonProperty("address_city") String addressCity,
        @JsonProperty("spot_type") String spotType,
        @JsonProperty("max_vehicle_size") String maxVehicleSize,
        @JsonProperty("has_ev_charging") Boolean hasEvCharging,
        @JsonProperty("hourly_rate") BigDecimal hourlyRate,
        @JsonProperty("is_active") Boolean isActive
) {
    public static PublicSpotResponse fromEntity(ParkingSpot spot) {
        return new PublicSpotResponse(spot.getId(), spot.getTitle(), spot.getLatitude(), spot.getLongitude(),
                spot.getAddressStreet(), spot.getAddressCity(), spot.getSpotType(), spot.getMaxVehicleSize(),
                spot.getHasEvCharging(), spot.getHourlyRate(), spot.getIsActive());
    }
}
