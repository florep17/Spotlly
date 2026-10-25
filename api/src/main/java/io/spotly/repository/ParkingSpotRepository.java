package io.spotly.repository;

import io.spotly.entity.ParkingSpot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ParkingSpotRepository extends JpaRepository<ParkingSpot, UUID> {
    List<ParkingSpot> findByOwnerId(String ownerId);
    List<ParkingSpot> findByIdIn(List<UUID> ids);
}
