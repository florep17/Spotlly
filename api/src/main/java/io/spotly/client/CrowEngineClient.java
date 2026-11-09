package io.spotly.client;

import io.spotly.dto.engine.SpotSyncRequest;
import io.spotly.dto.engine.SpotSyncResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;

@Slf4j
@Component
public class CrowEngineClient {

    private final WebClient webClient;

    public CrowEngineClient(WebClient.Builder webClientBuilder,
                            @Value("${spotly.search-engine.base-url:http://localhost:8080}") String engineBaseUrl) {
        this.webClient = webClientBuilder.baseUrl(engineBaseUrl).build();
    }

    public WebClient getWebClient() {
        return webClient;
    }

    /**
     * Synchronizes parking spot physical metadata and coordinates with C++ Crow R-Tree engine.
     * Endpoint: POST /api/v1/engine/spots/sync
     */
    public boolean syncSpot(SpotSyncRequest request) {
        try {
            log.info("Sending spot sync to C++ Crow engine: spotId={}, isActive={}", request.getSpotId(), request.getIsActive());
            SpotSyncResponse response = webClient.post()
                    .uri("/api/v1/engine/spots/sync")
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(request)
                    .retrieve()
                    .bodyToMono(SpotSyncResponse.class)
                    .timeout(Duration.ofMillis(2000))
                    .block();

            log.info("C++ Crow engine sync response for spot {}: status={}, rtreeNodes={}",
                    request.getSpotId(), response != null ? response.getStatus() : null,
                    response != null ? response.getRtreeNodeCount() : null);
            return response != null;
        } catch (Exception e) {
            log.warn("C++ Crow engine sync call failed for spot {}: {}", request.getSpotId(), e.getMessage());
            return false;
        }
    }
}
