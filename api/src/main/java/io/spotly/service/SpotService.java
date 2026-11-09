package io.spotly.service;

import io.spotly.client.CrowEngineClient;
import io.spotly.dto.engine.SpotSyncRequest;
import io.spotly.dto.spot.SpotRequest;
import io.spotly.dto.spot.SpotResponse;
import io.spotly.entity.ParkingSpot;
import io.spotly.entity.User;
import io.spotly.repository.ParkingSpotRepository;
import io.spotly.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class SpotService {

    private final ParkingSpotRepository parkingSpotRepository;
    private final UserRepository userRepository;
    private final CrowEngineClient crowEngineClient;

    @Transactional
    public SpotResponse createSpot(SpotRequest request, String ownerId) {
        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authenticated user not found in database"));

        ParkingSpot spot = ParkingSpot.builder()
                .owner(owner)
                .title(request.getTitle())
                .spotNumber(request.getSpotNumber())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .addressStreet(request.getAddressStreet())
                .addressCity(request.getAddressCity())
                .spotType(request.getSpotType())
                .maxVehicleSize(request.getMaxVehicleSize())
                .maxHeightMeters(request.getMaxHeightMeters())
                .hasEvCharging(request.getHasEvCharging() != null ? request.getHasEvCharging() : false)
                .accessType(request.getAccessType())
                .gatePinCode(request.getGatePinCode())
                .gatePhoneNumber(request.getGatePhoneNumber())
                .accessInstructions(request.getAccessInstructions())
                .hourlyRate(request.getHourlyRate())
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .syncStatus("PENDING")
                .build();

        // 1. Save to PostgreSQL first to generate UUID and persist
        spot = parkingSpotRepository.save(spot);

        // 2. Synchronize with C++ Crow engine R-Tree
        SpotSyncRequest syncRequest = SpotSyncRequest.builder()
                .spotId(spot.getId().toString())
                .latitude(spot.getLatitude())
                .longitude(spot.getLongitude())
                .hourlyRate(spot.getHourlyRate())
                .maxVehicleSize(spot.getMaxVehicleSize())
                .maxHeightMeters(spot.getMaxHeightMeters())
                .hasEvCharging(spot.getHasEvCharging())
                .isActive(spot.getIsActive())
                .build();

        crowEngineClient.syncSpot(syncRequest);
        spot.setSyncStatus("SYNCED_TO_CPP_ENGINE");
        spot = parkingSpotRepository.save(spot);

        log.info("Created and synced parking spot {} for owner {}", spot.getId(), ownerId);
        return SpotResponse.fromEntity(spot);
    }

    @Transactional
    public SpotResponse updateSpot(UUID id, SpotRequest request, String ownerId) {
        ParkingSpot spot = parkingSpotRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Parking spot with ID " + id + " not found"));

        if (!spot.getOwner().getId().equals(ownerId)) {
            log.warn("User {} attempted to modify spot {} owned by {}", ownerId, id, spot.getOwner().getId());
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not have permission to modify this parking spot");
        }

        spot.setTitle(request.getTitle());
        spot.setSpotNumber(request.getSpotNumber());
        spot.setLatitude(request.getLatitude());
        spot.setLongitude(request.getLongitude());
        spot.setAddressStreet(request.getAddressStreet());
        spot.setAddressCity(request.getAddressCity());
        spot.setSpotType(request.getSpotType());
        spot.setMaxVehicleSize(request.getMaxVehicleSize());
        spot.setMaxHeightMeters(request.getMaxHeightMeters());
        if (request.getHasEvCharging() != null) {
            spot.setHasEvCharging(request.getHasEvCharging());
        }
        spot.setAccessType(request.getAccessType());
        spot.setGatePinCode(request.getGatePinCode());
        spot.setGatePhoneNumber(request.getGatePhoneNumber());
        spot.setAccessInstructions(request.getAccessInstructions());
        spot.setHourlyRate(request.getHourlyRate());
        if (request.getIsActive() != null) {
            spot.setIsActive(request.getIsActive());
        }

        // Synchronize updated state with C++ Crow engine
        SpotSyncRequest syncRequest = SpotSyncRequest.builder()
                .spotId(spot.getId().toString())
                .latitude(spot.getLatitude())
                .longitude(spot.getLongitude())
                .hourlyRate(spot.getHourlyRate())
                .maxVehicleSize(spot.getMaxVehicleSize())
                .maxHeightMeters(spot.getMaxHeightMeters())
                .hasEvCharging(spot.getHasEvCharging())
                .isActive(spot.getIsActive())
                .build();

        crowEngineClient.syncSpot(syncRequest);
        spot.setSyncStatus("SYNCED_TO_CPP_ENGINE");
        spot = parkingSpotRepository.save(spot);

        log.info("Updated and synced parking spot {} for owner {}", id, ownerId);
        return SpotResponse.fromEntity(spot);
    }

    @Transactional
    public void deleteSpot(UUID id, String ownerId) {
        ParkingSpot spot = parkingSpotRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Parking spot with ID " + id + " not found"));

        if (!spot.getOwner().getId().equals(ownerId)) {
            log.warn("User {} attempted to delete spot {} owned by {}", ownerId, id, spot.getOwner().getId());
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not have permission to delete this parking spot");
        }

        // Notify C++ Crow engine to remove spot from R-Tree spatial index (isActive = false)
        SpotSyncRequest syncRequest = SpotSyncRequest.builder()
                .spotId(spot.getId().toString())
                .latitude(spot.getLatitude())
                .longitude(spot.getLongitude())
                .hourlyRate(spot.getHourlyRate())
                .maxVehicleSize(spot.getMaxVehicleSize())
                .maxHeightMeters(spot.getMaxHeightMeters())
                .hasEvCharging(spot.getHasEvCharging())
                .isActive(false)
                .build();

        crowEngineClient.syncSpot(syncRequest);

        try {
            parkingSpotRepository.delete(spot);
            parkingSpotRepository.flush();
            log.info("Permanently deleted parking spot {}", id);
        } catch (Exception e) {
            log.warn("Parking spot {} is referenced (e.g. by bookings); soft-deactivating instead: {}", id, e.getMessage());
            spot.setIsActive(false);
            spot.setSyncStatus("DEACTIVATED");
            parkingSpotRepository.save(spot);
        }
    }

    @Transactional(readOnly = true)
    public SpotResponse getSpotById(UUID id) {
        ParkingSpot spot = parkingSpotRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Parking spot with ID " + id + " not found"));
        return SpotResponse.fromEntity(spot);
    }

    @Transactional(readOnly = true)
    public List<SpotResponse> getMySpots(String ownerId) {
        return parkingSpotRepository.findByOwnerId(ownerId).stream()
                .map(SpotResponse::fromEntity)
                .toList();
    }
}

