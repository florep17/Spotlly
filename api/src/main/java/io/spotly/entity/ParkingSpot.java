package io.spotly.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "parking_spots")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ParkingSpot {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @Column(nullable = false)
    private String title;

    @Column(name = "spot_number", length = 50)
    private String spotNumber;

    @Column(nullable = false, precision = 10, scale = 7)
    private BigDecimal latitude;

    @Column(nullable = false, precision = 10, scale = 7)
    private BigDecimal longitude;

    @Column(name = "address_street", nullable = false)
    private String addressStreet;

    @Column(name = "address_city", nullable = false, length = 100)
    private String addressCity;

    @Column(name = "spot_type", nullable = false, length = 50)
    private String spotType;

    @Column(name = "max_vehicle_size", nullable = false, length = 50)
    private String maxVehicleSize;

    @Column(name = "max_height_meters", precision = 4, scale = 2)
    private BigDecimal maxHeightMeters;

    @Column(name = "has_ev_charging", nullable = false)
    @Builder.Default
    private Boolean hasEvCharging = false;

    @Column(name = "access_type", nullable = false, length = 50)
    private String accessType;

    @Column(name = "gate_pin_code", length = 100)
    private String gatePinCode;

    @Column(name = "gate_phone_number", length = 50)
    private String gatePhoneNumber;

    @Column(name = "access_instructions", columnDefinition = "TEXT")
    private String accessInstructions;

    @Column(name = "hourly_rate", nullable = false, precision = 8, scale = 2)
    private BigDecimal hourlyRate;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "sync_status", nullable = false, length = 50)
    @Builder.Default
    private String syncStatus = "PENDING";

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;
}
