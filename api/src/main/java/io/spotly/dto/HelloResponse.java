package io.spotly.dto;

import java.time.Instant;

public record HelloResponse(
        String message,
        String status,
        String project,
        Instant timestamp
) {}
