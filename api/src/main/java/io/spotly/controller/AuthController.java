package io.spotly.controller;

import io.spotly.dto.AuthResponse;
import io.spotly.dto.LoginRequest;
import io.spotly.dto.RegisterRequest;
import io.spotly.dto.UserDto;
import io.spotly.service.AuthService;
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

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Endpoints for user authentication and account registration")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    @Operation(
            summary = "Login or auto-register with email & password",
            description = "Authenticates an existing user with email and password, or creates a new user account if not found in database."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Authentication successful, Spotly Bearer token returned"),
            @ApiResponse(responseCode = "400", description = "Invalid request payload or validation failure"),
            @ApiResponse(responseCode = "401", description = "Invalid credentials for existing account")
    })
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    @Operation(
            summary = "Register a new user account",
            description = "Registers a new user account with email, password, and nickname."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "User successfully registered, Spotly Bearer token returned"),
            @ApiResponse(responseCode = "400", description = "Invalid request payload or validation failure"),
            @ApiResponse(responseCode = "409", description = "User with this email already exists")
    })
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/me")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(
            summary = "Get current authenticated user profile",
            description = "Returns profile details of the user identified by the Bearer JWT token."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Current user profile"),
            @ApiResponse(responseCode = "401", description = "Missing or invalid bearer token"),
            @ApiResponse(responseCode = "404", description = "User record not found")
    })
    public ResponseEntity<UserDto> getCurrentUser(@AuthenticationPrincipal Jwt jwt) {
        if (jwt == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        UserDto userDto = authService.getUserById(jwt.getSubject());
        return ResponseEntity.ok(userDto);
    }

    @GetMapping("/users")
    @Operation(
            summary = "List all registered users",
            description = "Returns a list of all registered users in the database."
    )
    @ApiResponse(responseCode = "200", description = "List of all users")
    public ResponseEntity<java.util.List<UserDto>> getAllAuthUsers() {
        return ResponseEntity.ok(authService.getAllUsers());
    }
}

