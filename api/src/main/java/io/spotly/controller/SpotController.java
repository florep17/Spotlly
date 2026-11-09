package io.spotly.controller;

import io.spotly.dto.spot.SpotRequest;
import io.spotly.dto.spot.SpotResponse;
import io.spotly.service.SpotService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/spots")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Host Spots", description = "Endpoints for managing host parking spots (creation, modification, deletion, and C++ R-Tree synchronization)")
public class SpotController {

    private final SpotService spotService;

    @PostMapping
    @Operation(
            summary = "Create a new parking spot",
            description = "Creates a parking spot for the authenticated host, persists to PostgreSQL, and syncs coordinates/metadata to C++ Crow R-Tree engine."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Parking spot created and synchronized to C++ engine"),
            @ApiResponse(responseCode = "400", description = "Invalid request payload or validation failure"),
            @ApiResponse(responseCode = "401", description = "Missing or invalid Bearer JWT token")
    })
    public ResponseEntity<SpotResponse> createSpot(
            @Valid @RequestBody SpotRequest request,
            @AuthenticationPrincipal Jwt jwt) {
        String ownerId = jwt.getSubject();
        SpotResponse response = spotService.createSpot(request, ownerId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    @Operation(
            summary = "Update an existing parking spot",
            description = "Updates parking spot attributes in PostgreSQL and synchronizes new coordinates/rate/constraints with C++ Crow engine."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Parking spot successfully updated and synchronized"),
            @ApiResponse(responseCode = "400", description = "Invalid request payload or validation failure"),
            @ApiResponse(responseCode = "401", description = "Missing or invalid Bearer JWT token"),
            @ApiResponse(responseCode = "403", description = "Forbidden: Logged-in user is not the owner of this spot"),
            @ApiResponse(responseCode = "404", description = "Parking spot not found")
    })
    public ResponseEntity<SpotResponse> updateSpot(
            @PathVariable UUID id,
            @Valid @RequestBody SpotRequest request,
            @AuthenticationPrincipal Jwt jwt) {
        String ownerId = jwt.getSubject();
        SpotResponse response = spotService.updateSpot(id, request, ownerId);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @Operation(
            summary = "Delete or deactivate a parking spot",
            description = "Deletes or deactivates the spot from PostgreSQL and removes the coordinate node from C++ Crow R-Tree index."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Parking spot successfully deleted/deactivated"),
            @ApiResponse(responseCode = "401", description = "Missing or invalid Bearer JWT token"),
            @ApiResponse(responseCode = "403", description = "Forbidden: Logged-in user is not the owner of this spot"),
            @ApiResponse(responseCode = "404", description = "Parking spot not found")
    })
    public ResponseEntity<Void> deleteSpot(
            @PathVariable UUID id,
            @AuthenticationPrincipal Jwt jwt) {
        String ownerId = jwt.getSubject();
        spotService.deleteSpot(id, ownerId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    @Operation(
            summary = "Get parking spot by ID",
            description = "Returns spot details."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Spot found"),
            @ApiResponse(responseCode = "404", description = "Spot not found")
    })
    public ResponseEntity<SpotResponse> getSpotById(@PathVariable UUID id) {
        return ResponseEntity.ok(spotService.getSpotById(id));
    }

    @GetMapping
    @Operation(
            summary = "Get my parking spots (Host Dashboard)",
            description = "Returns all parking spots owned by the currently authenticated host."
    )
    @ApiResponse(responseCode = "200", description = "List of spots owned by authenticated user")
    public ResponseEntity<List<SpotResponse>> getMySpots(@AuthenticationPrincipal Jwt jwt) {
        String ownerId = jwt.getSubject();
        return ResponseEntity.ok(spotService.getMySpots(ownerId));
    }
}

