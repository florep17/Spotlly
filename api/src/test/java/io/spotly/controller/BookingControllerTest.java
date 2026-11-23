package io.spotly.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.spotly.dto.booking.CreateBookingRequest;
import io.spotly.entity.ParkingSpot;
import io.spotly.entity.User;
import io.spotly.repository.BookingRepository;
import io.spotly.repository.ParkingSpotRepository;
import io.spotly.repository.SpotAvailabilityRepository;
import io.spotly.repository.UserRepository;
import io.spotly.service.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class BookingControllerTest {
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper objectMapper;
    @Autowired JwtService jwtService;
    @Autowired UserRepository users;
    @Autowired ParkingSpotRepository spots;
    @Autowired BookingRepository bookings;
    @Autowired SpotAvailabilityRepository availabilities;

    private String driverToken;
    private String anotherToken;
    private ParkingSpot spot;

    @BeforeEach
    void setUp() {
        bookings.deleteAll();
        availabilities.deleteAll();
        spots.deleteAll();
        users.deleteAll();
        User owner = users.save(User.builder().id("booking-owner").email("owner@example.com").role("USER").build());
        User driver = users.save(User.builder().id("booking-driver").email("driver@example.com").role("USER").build());
        User another = users.save(User.builder().id("another-driver").email("another@example.com").role("USER").build());
        driverToken = "Bearer " + jwtService.generateToken(driver);
        anotherToken = "Bearer " + jwtService.generateToken(another);
        spot = spots.save(ParkingSpot.builder().owner(owner).title("Test spot")
                .latitude(new BigDecimal("50.0614000")).longitude(new BigDecimal("19.9383000"))
                .addressStreet("Pawia 5").addressCity("Kraków")
                .spotType("GARAGE").maxVehicleSize("SUV").accessType("OPEN")
                .hourlyRate(new BigDecimal("8.50")).isActive(true).build());
    }

    @Test
    void createsRealBookingAndKeepsItPrivate() throws Exception {
        Instant start = Instant.now().plus(1, ChronoUnit.DAYS).truncatedTo(ChronoUnit.SECONDS);
        CreateBookingRequest request = new CreateBookingRequest(spot.getId(), start,
                start.plus(3, ChronoUnit.HOURS), "KR1234A");
        mvc.perform(post("/api/v1/bookings").header("Authorization", driverToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.spotTitle").value("Test spot"))
                .andExpect(jsonPath("$.totalPrice").value(25.5));
        mvc.perform(get("/api/v1/bookings/my").header("Authorization", driverToken))
                .andExpect(status().isOk()).andExpect(jsonPath("$.length()").value(1));
        mvc.perform(get("/api/v1/bookings/my").header("Authorization", anotherToken))
                .andExpect(status().isOk()).andExpect(jsonPath("$.length()").value(0));
        mvc.perform(post("/api/v1/bookings").header("Authorization", anotherToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict());
    }
}
