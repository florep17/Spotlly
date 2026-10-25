package io.spotly.controller;

import io.spotly.dto.HelloResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;

@RestController
@RequestMapping("/api/v1")
@Tag(name = "Health & Testing", description = "Endpoints for sanity checks and initial API validation")
public class HelloController {

    @GetMapping("/hello")
    @Operation(summary = "Health / Hello World endpoint", description = "Returns a JSON payload confirming Spring Boot API is running")
    public ResponseEntity<HelloResponse> getHello() {
        HelloResponse response = new HelloResponse(
                "Hello World from Spotly API!",
                "UP",
                "Spotly Backend (Spring Boot 3.3.4, Java 21)",
                Instant.now()
        );
        return ResponseEntity.ok(response);
    }
}
