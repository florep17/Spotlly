package io.spotly.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.spotly.client.CrowEngineClient;
import io.spotly.dto.engine.SpotSyncRequest;
import io.spotly.dto.spot.SpotRequest;
import io.spotly.entity.ParkingSpot;
import io.spotly.entity.User;
import io.spotly.repository.ParkingSpotRepository;
import io.spotly.repository.UserRepository;
import io.spotly.service.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class SpotControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ParkingSpotRepository parkingSpotRepository;

    @Autowired
    private JwtService jwtService;

    @MockBean
    private CrowEngineClient crowEngineClient;

    private User host1;
    private User host2;
    private String host1Token;
    private String host2Token;

    @BeforeEach
    void setUp() {
        parkingSpotRepository.deleteAll();
        userRepository.deleteAll();

        host1 = User.builder()
                .id("u-host-1")
                .email("host1@example.com")
                .nickname("HostOne")
                .password("hash1")
                .role("USER")
                .build();
        userRepository.save(host1);

        host2 = User.builder()
                .id("u-host-2")
                .email("host2@example.com")
                .nickname("HostTwo")
                .password("hash2")
                .role("USER")
                .build();
        userRepository.save(host2);

        host1Token = "Bearer " + jwtService.generateToken(host1);
        host2Token = "Bearer " + jwtService.generateToken(host2);

        when(crowEngineClient.syncSpot(any())).thenReturn(true);
    }

    @Test
    @DisplayName("POST /api/v1/spots - should create spot and trigger C++ Crow engine sync")
    void shouldCreateSpotAndSyncToCppEngine() throws Exception {
        SpotRequest request = SpotRequest.builder()
                .title("Covered Garage Main Station")
                .spotNumber("A-12")
                .latitude(new BigDecimal("50.064650"))
                .longitude(new BigDecimal("19.944980"))
                .addressStreet("Pawia 5")
                .addressCity("Kraków")
                .spotType("UNDERGROUND")
                .maxVehicleSize("SUV")
                .maxHeightMeters(new BigDecimal("2.10"))
                .hasEvCharging(true)
                .accessType("CODE_KEYPAD")
                .gatePinCode("4921")
                .accessInstructions("Enter via gate on right, PIN 4921")
                .hourlyRate(new BigDecimal("14.50"))
                .isActive(true)
                .build();

        mockMvc.perform(post("/api/v1/spots")
                        .header("Authorization", host1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNotEmpty())
                .andExpect(jsonPath("$.owner_id").value("u-host-1"))
                .andExpect(jsonPath("$.title").value("Covered Garage Main Station"))
                .andExpect(jsonPath("$.spot_number").value("A-12"))
                .andExpect(jsonPath("$.spot_type").value("UNDERGROUND"))
                .andExpect(jsonPath("$.max_vehicle_size").value("SUV"))
                .andExpect(jsonPath("$.has_ev_charging").value(true))
                .andExpect(jsonPath("$.sync_status").value("SYNCED_TO_CPP_ENGINE"))
                .andExpect(jsonPath("$.is_active").value(true));

        // Verify C++ Crow engine sync was called
        ArgumentCaptor<SpotSyncRequest> syncCaptor = ArgumentCaptor.forClass(SpotSyncRequest.class);
        verify(crowEngineClient, times(1)).syncSpot(syncCaptor.capture());
        SpotSyncRequest capturedSync = syncCaptor.getValue();
        assertThat(capturedSync.getSpotId()).isNotNull();
        assertThat(capturedSync.getLatitude()).isEqualByComparingTo("50.064650");
        assertThat(capturedSync.getLongitude()).isEqualByComparingTo("19.944980");
        assertThat(capturedSync.getHourlyRate()).isEqualByComparingTo("14.50");
        assertThat(capturedSync.getIsActive()).isTrue();

        // Verify database persistence
        assertThat(parkingSpotRepository.count()).isEqualTo(1);
    }

    @Test
    @DisplayName("PUT /api/v1/spots/{id} - should update spot and refresh C++ Crow engine node")
    void shouldUpdateSpotAndRefreshCppEngine() throws Exception {
        ParkingSpot existingSpot = ParkingSpot.builder()
                .owner(host1)
                .title("Initial Title")
                .spotNumber("B-1")
                .latitude(new BigDecimal("50.060000"))
                .longitude(new BigDecimal("19.940000"))
                .addressStreet("Długa 1")
                .addressCity("Kraków")
                .spotType("SURFACE")
                .maxVehicleSize("SEDAN")
                .accessType("CODE_KEYPAD")
                .hourlyRate(new BigDecimal("10.00"))
                .isActive(true)
                .syncStatus("SYNCED_TO_CPP_ENGINE")
                .build();
        existingSpot = parkingSpotRepository.save(existingSpot);

        SpotRequest updateRequest = SpotRequest.builder()
                .title("Updated Title")
                .spotNumber("B-1-MOD")
                .latitude(new BigDecimal("50.061000"))
                .longitude(new BigDecimal("19.941000"))
                .addressStreet("Długa 1A")
                .addressCity("Kraków")
                .spotType("GARAGE")
                .maxVehicleSize("SUV")
                .maxHeightMeters(new BigDecimal("2.50"))
                .hasEvCharging(true)
                .accessType("BARRIER_PHONE")
                .hourlyRate(new BigDecimal("18.00"))
                .isActive(true)
                .build();

        mockMvc.perform(put("/api/v1/spots/" + existingSpot.getId())
                        .header("Authorization", host1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(existingSpot.getId().toString()))
                .andExpect(jsonPath("$.title").value("Updated Title"))
                .andExpect(jsonPath("$.spot_type").value("GARAGE"))
                .andExpect(jsonPath("$.hourly_rate").value(18.00))
                .andExpect(jsonPath("$.sync_status").value("SYNCED_TO_CPP_ENGINE"));

        // Verify C++ engine sync was triggered for updated spot
        ArgumentCaptor<SpotSyncRequest> syncCaptor = ArgumentCaptor.forClass(SpotSyncRequest.class);
        verify(crowEngineClient, times(1)).syncSpot(syncCaptor.capture());
        assertThat(syncCaptor.getValue().getHourlyRate()).isEqualByComparingTo("18.00");
    }

    @Test
    @DisplayName("PUT /api/v1/spots/{id} - should return 403 Forbidden when user is not the owner")
    void shouldRejectUpdateWhenNotOwner() throws Exception {
        ParkingSpot spot = ParkingSpot.builder()
                .owner(host1)
                .title("Host1 Spot")
                .latitude(new BigDecimal("50.00"))
                .longitude(new BigDecimal("19.00"))
                .addressStreet("Street")
                .addressCity("City")
                .spotType("SURFACE")
                .maxVehicleSize("SUV")
                .accessType("OPEN")
                .hourlyRate(new BigDecimal("10.00"))
                .build();
        spot = parkingSpotRepository.save(spot);

        SpotRequest updateRequest = SpotRequest.builder()
                .title("Hacked Title")
                .latitude(new BigDecimal("50.00"))
                .longitude(new BigDecimal("19.00"))
                .addressStreet("Street")
                .addressCity("City")
                .spotType("SURFACE")
                .maxVehicleSize("SUV")
                .accessType("OPEN")
                .hourlyRate(new BigDecimal("99.00"))
                .build();

        mockMvc.perform(put("/api/v1/spots/" + spot.getId())
                        .header("Authorization", host2Token) // Attempting edit with host2 token
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isForbidden());

        // Ensure spot in DB was NOT modified
        ParkingSpot inDb = parkingSpotRepository.findById(spot.getId()).orElseThrow();
        assertThat(inDb.getTitle()).isEqualTo("Host1 Spot");
    }

    @Test
    @DisplayName("PUT /api/v1/spots/{id} - should return 404 when spot does not exist")
    void shouldReturn404WhenUpdatingNonExistentSpot() throws Exception {
        SpotRequest updateRequest = SpotRequest.builder()
                .title("Title")
                .latitude(new BigDecimal("50.00"))
                .longitude(new BigDecimal("19.00"))
                .addressStreet("Street")
                .addressCity("City")
                .spotType("SURFACE")
                .maxVehicleSize("SUV")
                .accessType("OPEN")
                .hourlyRate(new BigDecimal("10.00"))
                .build();

        mockMvc.perform(put("/api/v1/spots/" + UUID.randomUUID())
                        .header("Authorization", host1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("DELETE /api/v1/spots/{id} - should delete spot and notify C++ engine (isActive=false)")
    void shouldDeleteSpotAndNotifyCppEngine() throws Exception {
        ParkingSpot spot = ParkingSpot.builder()
                .owner(host1)
                .title("Spot to Delete")
                .latitude(new BigDecimal("50.00"))
                .longitude(new BigDecimal("19.00"))
                .addressStreet("Street")
                .addressCity("City")
                .spotType("SURFACE")
                .maxVehicleSize("SUV")
                .accessType("OPEN")
                .hourlyRate(new BigDecimal("10.00"))
                .build();
        spot = parkingSpotRepository.save(spot);

        mockMvc.perform(delete("/api/v1/spots/" + spot.getId())
                        .header("Authorization", host1Token))
                .andExpect(status().isNoContent());

        // Verify C++ engine was called with isActive = false
        ArgumentCaptor<SpotSyncRequest> syncCaptor = ArgumentCaptor.forClass(SpotSyncRequest.class);
        verify(crowEngineClient, times(1)).syncSpot(syncCaptor.capture());
        assertThat(syncCaptor.getValue().getIsActive()).isFalse();

        // Verify deleted from DB
        assertThat(parkingSpotRepository.existsById(spot.getId())).isFalse();
    }

    @Test
    @DisplayName("DELETE /api/v1/spots/{id} - should return 403 Forbidden when deleting someone else's spot")
    void shouldRejectDeleteWhenNotOwner() throws Exception {
        ParkingSpot spot = ParkingSpot.builder()
                .owner(host1)
                .title("Host1 Spot")
                .latitude(new BigDecimal("50.00"))
                .longitude(new BigDecimal("19.00"))
                .addressStreet("Street")
                .addressCity("City")
                .spotType("SURFACE")
                .maxVehicleSize("SUV")
                .accessType("OPEN")
                .hourlyRate(new BigDecimal("10.00"))
                .build();
        spot = parkingSpotRepository.save(spot);

        mockMvc.perform(delete("/api/v1/spots/" + spot.getId())
                        .header("Authorization", host2Token))
                .andExpect(status().isForbidden());

        // Spot still exists
        assertThat(parkingSpotRepository.existsById(spot.getId())).isTrue();
    }

    @Test
    @DisplayName("DELETE /api/v1/spots/{id} - should return 404 when spot not found")
    void shouldReturn404WhenDeletingNonExistentSpot() throws Exception {
        mockMvc.perform(delete("/api/v1/spots/" + UUID.randomUUID())
                        .header("Authorization", host1Token))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("POST /api/v1/spots - should reject unauthenticated request with 401")
    void shouldRejectUnauthenticatedRequest() throws Exception {
        SpotRequest request = SpotRequest.builder()
                .title("Title")
                .latitude(new BigDecimal("50.00"))
                .longitude(new BigDecimal("19.00"))
                .addressStreet("Street")
                .addressCity("City")
                .spotType("SURFACE")
                .maxVehicleSize("SUV")
                .accessType("OPEN")
                .hourlyRate(new BigDecimal("10.00"))
                .build();

        mockMvc.perform(post("/api/v1/spots")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("GET /api/v1/spots - should return only spots belonging to authenticated host")
    void shouldListMySpots() throws Exception {
        ParkingSpot spot1 = ParkingSpot.builder()
                .owner(host1)
                .title("Host1 Spot 1")
                .latitude(new BigDecimal("50.00"))
                .longitude(new BigDecimal("19.00"))
                .addressStreet("Street 1")
                .addressCity("City")
                .spotType("SURFACE")
                .maxVehicleSize("SUV")
                .accessType("OPEN")
                .hourlyRate(new BigDecimal("10.00"))
                .build();
        ParkingSpot spot2 = ParkingSpot.builder()
                .owner(host1)
                .title("Host1 Spot 2")
                .latitude(new BigDecimal("50.01"))
                .longitude(new BigDecimal("19.01"))
                .addressStreet("Street 2")
                .addressCity("City")
                .spotType("SURFACE")
                .maxVehicleSize("SUV")
                .accessType("OPEN")
                .hourlyRate(new BigDecimal("15.00"))
                .build();
        ParkingSpot spot3 = ParkingSpot.builder()
                .owner(host2)
                .title("Host2 Spot")
                .latitude(new BigDecimal("50.02"))
                .longitude(new BigDecimal("19.02"))
                .addressStreet("Street 3")
                .addressCity("City")
                .spotType("SURFACE")
                .maxVehicleSize("SUV")
                .accessType("OPEN")
                .hourlyRate(new BigDecimal("20.00"))
                .build();
        parkingSpotRepository.save(spot1);
        parkingSpotRepository.save(spot2);
        parkingSpotRepository.save(spot3);

        mockMvc.perform(get("/api/v1/spots")
                        .header("Authorization", host1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].title").value("Host1 Spot 1"))
                .andExpect(jsonPath("$[1].title").value("Host1 Spot 2"));
    }
}

