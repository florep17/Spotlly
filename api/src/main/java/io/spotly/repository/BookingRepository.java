package io.spotly.repository;

import io.spotly.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface BookingRepository extends JpaRepository<Booking, String> {
    List<Booking> findByDriverId(String driverId);
    List<Booking> findBySpotId(UUID spotId);

    @Query("""
        SELECT b FROM Booking b
        WHERE b.spot.id = :spotId
          AND b.status = 'CONFIRMED'
          AND b.startTimeUtc < :endTimeUtc
          AND b.endTimeUtc > :startTimeUtc
    """)
    List<Booking> findOverlappingBookings(
            @Param("spotId") UUID spotId,
            @Param("startTimeUtc") Long startTimeUtc,
            @Param("endTimeUtc") Long endTimeUtc
    );
}
