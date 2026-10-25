package io.spotly.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "bookings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Booking {

    @Id
    @Column(length = 64)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "spot_id", nullable = false)
    private ParkingSpot spot;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "driver_id", nullable = false)
    private User driver;

    @Column(name = "vehicle_plate_number", nullable = false, length = 50)
    private String vehiclePlateNumber;

    @Column(name = "start_time_utc", nullable = false)
    private Long startTimeUtc;

    @Column(name = "end_time_utc", nullable = false)
    private Long endTimeUtc;

    @Column(nullable = false, length = 50)
    @Builder.Default
    private String status = "CONFIRMED";

    @Column(name = "total_charged", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalCharged;

    @Column(nullable = false, length = 10)
    @Builder.Default
    private String currency = "PLN";

    @Column(name = "access_status", nullable = false, length = 50)
    @Builder.Default
    private String accessStatus = "LOCKED_UNTIL_15M_BEFORE";

    @Column(name = "access_unlock_time_utc")
    private Long accessUnlockTimeUtc;

    @Column(name = "payment_method_id", length = 100)
    private String paymentMethodId;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;
}
