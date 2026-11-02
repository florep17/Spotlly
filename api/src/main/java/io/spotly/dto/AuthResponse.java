package io.spotly.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {

    @JsonProperty("access_token")
    @Schema(description = "Spotly Bearer JWT Token", example = "eyJhbGciOiJIUzI1NiIs...")
    private String accessToken;

    @JsonProperty("token_type")
    @Builder.Default
    @Schema(description = "Token type", example = "Bearer")
    private String tokenType = "Bearer";

    @JsonProperty("expires_in_seconds")
    @Schema(description = "Token expiration duration in seconds", example = "86400")
    private Long expiresInSeconds;

    @JsonProperty("user")
    @Schema(description = "Authenticated user profile")
    private UserDto user;
}

