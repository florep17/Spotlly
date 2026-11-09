package io.spotly.dto.spot;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SpotRequest {

    @NotBlank(message = "Title is required")
    @Size(max = 255, message = "Title cannot exceed 255 characters")
    @Schema(description = "Listing title", example = "Covered Garage Main Station")
    private String title;

    @JsonProperty("spot_number")
    @Size(max = 50, message = "Spot number cannot exceed 50 characters")
    @Schema(description = "Specific spot or stall number", example = "A-12")
    private String spotNumber;

    @NotNull(message = "Latitude is required")
    @DecimalMin(value = "-90.0", message = "Latitude must be between -90 and 90")
    @DecimalMax(value = "90.0", message = "Latitude must be between -90 and 90")
    @Schema(description = "Geographic latitude", example = "50.064650")
    private BigDecimal latitude;

    @NotNull(message = "Longitude is required")
    @DecimalMin(value = "-180.0", message = "Longitude must be between -180 and 180")
    @DecimalMax(value = "180.0", message = "Longitude must be between -180 and 180")
    @Schema(description = "Geographic longitude", example = "19.944980")
    private BigDecimal longitude;

    @NotBlank(message = "Address street is required")
    @JsonProperty("address_street")
    @Schema(description = "Street name and building number", example = "Pawia 5")
    private String addressStreet;

    @NotBlank(message = "Address city is required")
    @JsonProperty("address_city")
    @Schema(description = "City", example = "Kraków")
    private String addressCity;

    @NotBlank(message = "Spot type is required")
    @JsonProperty("spot_type")
    @Schema(description = "Type of spot (UNDERGROUND, SURFACE, DRIVEWAY, GARAGE)", example = "UNDERGROUND")
    private String spotType;

    @NotBlank(message = "Max vehicle size is required")
    @JsonProperty("max_vehicle_size")
    @Schema(description = "Max vehicle category (COMPACT, SEDAN, SUV, VAN)", example = "SUV")
    private String maxVehicleSize;

    @JsonProperty("max_height_meters")
    @DecimalMin(value = "0.0", message = "Max height must be positive")
    @Schema(description = "Physical clearance height in meters", example = "2.10")
    private BigDecimal maxHeightMeters;

    @JsonProperty("has_ev_charging")
    @Builder.Default
    @Schema(description = "Whether EV charging station is available", example = "true")
    private Boolean hasEvCharging = false;

    @NotBlank(message = "Access type is required")
    @JsonProperty("access_type")
    @Schema(description = "Access mechanism (CODE_KEYPAD, BARRIER_PHONE, REMOTE, OPEN)", example = "CODE_KEYPAD")
    private String accessType;

    @JsonProperty("gate_pin_code")
    @Schema(description = "PIN code for gate or keypad", example = "4921")
    private String gatePinCode;

    @JsonProperty("gate_phone_number")
    @Schema(description = "Phone number to trigger gate opening", example = "+48123456789")
    private String gatePhoneNumber;

    @JsonProperty("access_instructions")
    @Schema(description = "Instructions for entering the spot", example = "Enter via gate on right, PIN 4921")
    private String accessInstructions;

    @NotNull(message = "Hourly rate is required")
    @DecimalMin(value = "0.0", message = "Hourly rate cannot be negative")
    @JsonProperty("hourly_rate")
    @Schema(description = "Hourly price in PLN", example = "14.50")
    private BigDecimal hourlyRate;

    @JsonProperty("is_active")
    @Builder.Default
    @Schema(description = "Whether the spot is active", example = "true")
    private Boolean isActive = true;
}

