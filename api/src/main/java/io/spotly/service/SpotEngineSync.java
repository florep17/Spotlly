package io.spotly.service;

import io.spotly.client.CrowEngineClient;
import io.spotly.dto.engine.SpotSyncRequest;
import io.spotly.dto.spot.SpotResponse;
import io.spotly.repository.ParkingSpotRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataAccessException;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class SpotEngineSync {

    private final ParkingSpotRepository parkingSpots;
    private final CrowEngineClient engine;

    public SpotResponse sync(SpotResponse response) {
        if (sync(response.getId()) == response.getSyncRevision()) {
            response.setSyncStatus("SYNCED_TO_CPP_ENGINE");
        }
        return response;
    }

    public long sync(UUID id) {
        try {
            SpotSyncRequest snapshot = parkingSpots.findEngineSnapshot(id).orElse(null);
            if (snapshot == null || !engine.syncSpot(snapshot)) {
                return -1;
            }

            parkingSpots.acknowledgeEngineSync(id, snapshot.getRevision());
            return snapshot.getRevision();
        } catch (DataAccessException exception) {
            log.warn("Could not complete engine sync for spot {}", id, exception);
            return -1;
        }
    }

    @Scheduled(cron = "${spotly.search-engine.replay-cron:*/15 * * * * *}")
    public void replaySpots() {
        // Replay committed snapshots so an empty index can recover after a Crow restart.
        parkingSpots.findIdsForEngineSync().forEach(this::sync);
    }
}
