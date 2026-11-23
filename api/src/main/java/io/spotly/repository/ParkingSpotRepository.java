package io.spotly.repository;

import io.spotly.dto.engine.SpotSyncRequest;
import io.spotly.entity.ParkingSpot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;
import java.util.Optional;

@Repository
public interface ParkingSpotRepository extends JpaRepository<ParkingSpot, UUID> {
    List<ParkingSpot> findByOwnerId(String ownerId);
    List<ParkingSpot> findByIdIn(List<UUID> ids);

    @Query("select s.id from ParkingSpot s order by s.id")
    List<UUID> findIdsForEngineSync();

    @Query("""
            select new io.spotly.dto.engine.SpotSyncRequest(
                cast(s.id as string), s.syncRevision, s.latitude, s.longitude, s.hourlyRate,
                s.maxVehicleSize, s.maxHeightMeters, s.hasEvCharging, s.isActive)
            from ParkingSpot s where s.id = :id
            """)
    Optional<SpotSyncRequest> findEngineSnapshot(@Param("id") UUID id);

    @Transactional
    @Modifying
    @Query("""
            update ParkingSpot s set s.syncStatus = 'SYNCED_TO_CPP_ENGINE'
            where s.id = :id and s.syncRevision = :revision and s.syncStatus <> 'SYNCED_TO_CPP_ENGINE'
            """)
    int acknowledgeEngineSync(@Param("id") UUID id, @Param("revision") long revision);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select s from ParkingSpot s where s.id = :id")
    Optional<ParkingSpot> findWithLockById(@Param("id") UUID id);
}
