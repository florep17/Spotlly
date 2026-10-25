package io.spotly.repository;

import io.spotly.entity.SpotAvailability;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SpotAvailabilityRepository extends JpaRepository<SpotAvailability, UUID> {
    List<SpotAvailability> findBySpotId(UUID spotId);
}
