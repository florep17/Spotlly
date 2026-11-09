package io.spotly.dto.spot;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.spotly.entity.ParkingSpot;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SpotResponse {

    @Schema(description = "Unique UUID of the parking spot", example = "e3b0c442-98fc-1c14-9afe-4b2a3a830001")
    private UUID id;

    @JsonProperty("owner_id")
    @Schema(description = "User ID of the spot owner", example = "u-450e12-b1")
    private String ownerId;

    @Schema(description = "Listing title", example = "Covered Garage Main Station")
    private String title;

    @JsonProperty("spot_number")
    @Schema(description = "Spot or stall identifier", example = "A-12")
    private String spotNumber;

    @Schema(description = "Latitude", example = "50.064650")
    private BigDecimal latitude;

    @Schema(description = "Longitude", example = "19.944980")
    private BigDecimal longitude;

    @JsonProperty("address_street")
    @Schema(description = "Street address", example = "Pawia 5")
    private String addressStreet;

    @JsonProperty("address_city")
    @Schema(description = "City", example = "Kraków")
    private String addressCity;

    @JsonProperty("spot_type")
    @Schema(description = "Spot category (UNDERGROUND, SURFACE, DRIVEWAY, GARAGE)", example = "UNDERGROUND")
    private String spotType;

    @JsonProperty("max_vehicle_size")
    @Schema(description = "Maximum supported vehicle size", example = "SUV")
    private String maxVehicleSize;

    @JsonProperty("max_height_meters")
    @Schema(description = "Max vehicle height in meters", example = "2.10")
    private BigDecimal maxHeightMeters;

    @JsonProperty("has_ev_charging")
    @Schema(description = "EV charging available", example = "true")
    private Boolean hasEvCharging;

    @JsonProperty("access_type")
    @Schema(description = "Access mechanism", example = "CODE_KEYPAD")
    private String accessType;

    @JsonProperty("gate_pin_code")
    @Schema(description = "Gate PIN code", example = "4921")
    private String gatePinCode;

    @JsonProperty("gate_phone_number")
    @Schema(description = "Gate phone number", example = "+48123456789")
    private String gatePhoneNumber;

    @JsonProperty("access_instructions")
    @Schema(description = "Access instructions", example = "Enter via gate on right, PIN 4921")
    private String accessInstructions;

    @JsonProperty("hourly_rate")
    @Schema(description = "Hourly rental price in PLN", example = "14.50")
    private BigDecimal hourlyRate;

    @JsonProperty("is_active")
    @Schema(description = "Whether the spot is currently active", example = "true")
    private Boolean isActive;

    @JsonProperty("sync_status")
    @Schema(description = "Synchronization status with C++ Crow engine", example = "SYNCED_TO_CPP_ENGINE")
    private String syncStatus;

    @JsonProperty("created_at")
    @Schema(description = "Spot creation timestamp", example = "2026-10-15T14:00:00Z")
    private Instant createdAt;

    public static SpotResponse fromEntity(ParkingSpot spot) {
        if (spot == null) {
            return null;
        }
        return SpotResponse.builder()
                .id(spot.getId())
                .ownerId(spot.getOwner() != null ? spot.getOwner().getId() : null)
                .title(spot.getTitle())
                .spotNumber(spot.getSpotNumber())
                .latitude(spot.getLatitude())
                .longitude(spot.getLongitude())
                .addressStreet(spot.getAddressStreet())
                .addressCity(spot.getAddressCity())
                .spotType(spot.getSpotType())
                .maxVehicleSize(spot.getMaxVehicleSize())
                .maxHeightMeters(spot.getMaxHeightMeters())
                .hasEvCharging(spot.getHasEvCharging())
                .accessType(spot.getAccessType())
                .gatePinCode(spot.getGatePinCode())
                .gatePhoneNumber(spot.getGatePhoneNumber())
                .accessInstructions(spot.getAccessInstructions())
                .hourlyRate(spot.getHourlyRate())
                .isActive(spot.getIsActive())
                .syncStatus(spot.getSyncStatus())
                .createdAt(spot.getCreatedAt())
                .build();
    }
}

