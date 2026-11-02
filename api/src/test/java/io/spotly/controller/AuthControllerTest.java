package io.spotly.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.spotly.dto.LoginRequest;
import io.spotly.dto.RegisterRequest;
import io.spotly.entity.User;
import io.spotly.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
    }

    @Test
    @DisplayName("POST /api/v1/auth/login - should auto-create user in DB and return JWT if user does not exist")
    void shouldAutoCreateUserOnLoginWhenUserDoesNotExist() throws Exception {
        LoginRequest request = LoginRequest.builder()
                .email("newdriver@example.com")
                .password("securePassword123")
                .nickname("FastDriver")
                .build();

        MvcResult result = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.access_token").isNotEmpty())
                .andExpect(jsonPath("$.token_type").value("Bearer"))
                .andExpect(jsonPath("$.expires_in_seconds").value(86400))
                .andExpect(jsonPath("$.user.email").value("newdriver@example.com"))
                .andExpect(jsonPath("$.user.nickname").value("FastDriver"))
                .andExpect(jsonPath("$.user.first_name").value("FastDriver"))
                .andExpect(jsonPath("$.user.role").value("USER"))
                .andExpect(jsonPath("$.user.id").isNotEmpty())
                .andReturn();

        // Verify user was persisted in database
        User createdUser = userRepository.findByEmail("newdriver@example.com").orElse(null);
        assertThat(createdUser).isNotNull();
        assertThat(createdUser.getNickname()).isEqualTo("FastDriver");
        assertThat(createdUser.getRole()).isEqualTo("USER");
        // Verify password is encrypted and not stored in plain text
        assertThat(createdUser.getPassword()).isNotEqualTo("securePassword123");
        assertThat(passwordEncoder.matches("securePassword123", createdUser.getPassword())).isTrue();
    }

    @Test
    @DisplayName("POST /api/v1/auth/login - should authenticate existing user with valid password")
    void shouldLoginExistingUserWithValidPassword() throws Exception {
        // Pre-create user in DB
        User user = User.builder()
                .id("u-existing-123")
                .email("driver@example.com")
                .nickname("ExistingDriver")
                .firstName("ExistingDriver")
                .password(passwordEncoder.encode("myPassword123"))
                .role("USER")
                .build();
        userRepository.save(user);

        LoginRequest request = LoginRequest.builder()
                .email("driver@example.com")
                .password("myPassword123")
                .build();

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.access_token").isNotEmpty())
                .andExpect(jsonPath("$.token_type").value("Bearer"))
                .andExpect(jsonPath("$.user.id").value("u-existing-123"))
                .andExpect(jsonPath("$.user.email").value("driver@example.com"))
                .andExpect(jsonPath("$.user.nickname").value("ExistingDriver"));
    }

    @Test
    @DisplayName("POST /api/v1/auth/login - should reject invalid password for existing user with 401")
    void shouldRejectInvalidPasswordForExistingUser() throws Exception {
        User user = User.builder()
                .id("u-existing-456")
                .email("driver2@example.com")
                .nickname("Driver2")
                .password(passwordEncoder.encode("correctPassword"))
                .role("USER")
                .build();
        userRepository.save(user);

        LoginRequest request = LoginRequest.builder()
                .email("driver2@example.com")
                .password("wrongPassword")
                .build();

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("Unauthorized"))
                .andExpect(jsonPath("$.message").value("Invalid email or password"));
    }

    @Test
    @DisplayName("POST /api/v1/auth/register - should create user and return 201 Created")
    void shouldRegisterNewUserSuccessfully() throws Exception {
        RegisterRequest request = RegisterRequest.builder()
                .email("registerme@example.com")
                .password("secret123")
                .nickname("Newbie")
                .build();

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.access_token").isNotEmpty())
                .andExpect(jsonPath("$.token_type").value("Bearer"))
                .andExpect(jsonPath("$.user.email").value("registerme@example.com"))
                .andExpect(jsonPath("$.user.nickname").value("Newbie"));

        User saved = userRepository.findByEmail("registerme@example.com").orElse(null);
        assertThat(saved).isNotNull();
        assertThat(saved.getNickname()).isEqualTo("Newbie");
    }

    @Test
    @DisplayName("POST /api/v1/auth/register - should return 409 Conflict when email already exists")
    void shouldReturnConflictWhenRegisteringDuplicateEmail() throws Exception {
        User existing = User.builder()
                .id("u-dup-1")
                .email("duplicate@example.com")
                .nickname("Original")
                .password(passwordEncoder.encode("password123"))
                .role("USER")
                .build();
        userRepository.save(existing);

        RegisterRequest request = RegisterRequest.builder()
                .email("duplicate@example.com")
                .password("secret456")
                .nickname("CopyCat")
                .build();

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict());
    }

    @Test
    @DisplayName("POST /api/v1/auth/login - should fail with 400 when input validation fails")
    void shouldReturnBadRequestOnValidationFailure() throws Exception {
        LoginRequest invalidRequest = LoginRequest.builder()
                .email("not-an-email")
                .password("123") // too short, min is 6
                .build();

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Bad Request"))
                .andExpect(jsonPath("$.details.email").isNotEmpty())
                .andExpect(jsonPath("$.details.password").isNotEmpty());
    }

    @Test
    @DisplayName("GET /api/v1/auth/me - should return current user profile with valid JWT Bearer token")
    void shouldReturnCurrentUserWithBearerToken() throws Exception {
        // 1. Auto-create user via login
        LoginRequest loginRequest = LoginRequest.builder()
                .email("jwtuser@example.com")
                .password("validPassword123")
                .nickname("JwtMaster")
                .build();

        MvcResult loginResult = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andReturn();

        String token = objectMapper.readTree(loginResult.getResponse().getContentAsString())
                .get("access_token")
                .asText();

        // 2. Query /api/v1/auth/me with Bearer token
        mockMvc.perform(get("/api/v1/auth/me")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("jwtuser@example.com"))
                .andExpect(jsonPath("$.nickname").value("JwtMaster"))
                .andExpect(jsonPath("$.role").value("USER"));
    }

    @Test
    @DisplayName("GET /api/v1/auth/me - should return 401 Unauthorized without token")
    void shouldReturnUnauthorizedWhenTokenMissing() throws Exception {
        mockMvc.perform(get("/api/v1/auth/me"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("GET /api/v1/users & GET /api/v1/auth/users - should return list of all users")
    void shouldListAllUsers() throws Exception {
        User user1 = User.builder()
                .id("u-list-1")
                .email("user1@example.com")
                .nickname("UserOne")
                .password(passwordEncoder.encode("pass123"))
                .role("USER")
                .build();
        User user2 = User.builder()
                .id("u-list-2")
                .email("user2@example.com")
                .nickname("UserTwo")
                .password(passwordEncoder.encode("pass123"))
                .role("USER")
                .build();
        userRepository.save(user1);
        userRepository.save(user2);

        mockMvc.perform(get("/api/v1/users"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].email").value("user1@example.com"))
                .andExpect(jsonPath("$[1].email").value("user2@example.com"));

        mockMvc.perform(get("/api/v1/auth/users"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2));
    }
}

