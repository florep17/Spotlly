package io.spotly.service;

import io.spotly.dto.spot.SpotRequest;
import io.spotly.dto.spot.SpotResponse;
import io.spotly.dto.spot.PublicSpotResponse;
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

        return SpotResponse.fromEntity(parkingSpotRepository.save(spot));
    }

    @Transactional
    public SpotResponse updateSpot(UUID id, SpotRequest request, String ownerId) {
        ParkingSpot spot = parkingSpotRepository.findWithLockById(id)
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

        markPending(spot);
        return SpotResponse.fromEntity(spot);
    }

    @Transactional
    public void deactivateSpot(UUID id, String ownerId) {
        ParkingSpot spot = parkingSpotRepository.findWithLockById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Parking spot with ID " + id + " not found"));

        if (!spot.getOwner().getId().equals(ownerId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not have permission to deactivate this parking spot");
        }

        if (Boolean.TRUE.equals(spot.getIsActive())) {
            spot.setIsActive(false);
            markPending(spot);
        }
    }

    private void markPending(ParkingSpot spot) {
        spot.setSyncRevision(spot.getSyncRevision() + 1);
        spot.setSyncStatus("PENDING");
    }

    @Transactional(readOnly = true)
    public PublicSpotResponse getSpotById(UUID id) {
        ParkingSpot spot = parkingSpotRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Parking spot with ID " + id + " not found"));
        if (!Boolean.TRUE.equals(spot.getIsActive())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Parking spot not found");
        }
        return PublicSpotResponse.fromEntity(spot);
    }

    @Transactional(readOnly = true)
    public List<SpotResponse> getMySpots(String ownerId) {
        return parkingSpotRepository.findByOwnerId(ownerId).stream()
                .filter(s -> Boolean.TRUE.equals(s.getIsActive()))
                .map(SpotResponse::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<PublicSpotResponse> getAllActiveSpots() {
        return parkingSpotRepository.findAll().stream()
                .filter(s -> Boolean.TRUE.equals(s.getIsActive()))
                .map(PublicSpotResponse::fromEntity)
                .toList();
    }
}

