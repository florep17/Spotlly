package io.spotly.dto.engine;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SpotSyncRequest {

    @JsonProperty("spot_id")
    private String spotId;

    private BigDecimal latitude;
    private BigDecimal longitude;

    @JsonProperty("hourly_rate")
    private BigDecimal hourlyRate;

    @JsonProperty("max_vehicle_size")
    private String maxVehicleSize;

    @JsonProperty("max_height_meters")
    private BigDecimal maxHeightMeters;

    @JsonProperty("has_ev_charging")
    private Boolean hasEvCharging;

    @JsonProperty("is_active")
    private Boolean isActive;
}

