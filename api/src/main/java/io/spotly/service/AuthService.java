package io.spotly.service;

import io.spotly.dto.AuthResponse;
import io.spotly.dto.LoginRequest;
import io.spotly.dto.RegisterRequest;
import io.spotly.dto.UserDto;
import io.spotly.entity.User;
import io.spotly.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Transactional
    public AuthResponse login(LoginRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        Optional<User> existingUserOpt = userRepository.findByEmail(email);

        User user;
        if (existingUserOpt.isPresent()) {
            user = existingUserOpt.get();
            if (user.getPassword() == null) {
                log.warn("Login failed: User {} registered via external OAuth provider without a password", email);
                throw new BadCredentialsException("Account was created without a password. Please use OAuth login.");
            }

            if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
                log.warn("Failed login attempt: invalid password for email {}", email);
                throw new BadCredentialsException("Invalid email or password");
            }

            if ((user.getNickname() == null || user.getNickname().isBlank()) &&
                    request.getNickname() != null && !request.getNickname().isBlank()) {
                user.setNickname(request.getNickname().trim());
                if (user.getFirstName() == null) {
                    user.setFirstName(request.getNickname().trim());
                }
                user = userRepository.save(user);
            }
            log.info("User {} successfully logged in", email);
        } else {
            // Auto-create account in DB as requested:
            // "powinno to tworzyc konto w bazie danych ofc, uzytkownik pola to beda email haslo i nickname"
            String nickname = resolveNickname(request.getNickname(), email);
            String userId = generateUserId();

            user = User.builder()
                    .id(userId)
                    .email(email)
                    .nickname(nickname)
                    .firstName(nickname)
                    .password(passwordEncoder.encode(request.getPassword()))
                    .role("USER")
                    .build();

            user = userRepository.save(user);
            log.info("Created new user account for {} with id: {}", email, userId);
        }

        String token = jwtService.generateToken(user);
        return AuthResponse.builder()
                .accessToken(token)
                .tokenType("Bearer")
                .expiresInSeconds(jwtService.getExpirationSeconds())
                .user(UserDto.fromEntity(user))
                .build();
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "User with email " + email + " already exists");
        }

        String nickname = request.getNickname().trim();
        String userId = generateUserId();

        User user = User.builder()
                .id(userId)
                .email(email)
                .nickname(nickname)
                .firstName(nickname)
                .password(passwordEncoder.encode(request.getPassword()))
                .role("USER")
                .build();

        user = userRepository.save(user);
        log.info("Registered new user {} with id: {}", email, userId);

        String token = jwtService.generateToken(user);
        return AuthResponse.builder()
                .accessToken(token)
                .tokenType("Bearer")
                .expiresInSeconds(jwtService.getExpirationSeconds())
                .user(UserDto.fromEntity(user))
                .build();
    }

    @Transactional(readOnly = true)
    public UserDto getUserById(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        return UserDto.fromEntity(user);
    }

    @Transactional(readOnly = true)
    public java.util.List<UserDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(UserDto::fromEntity)
                .toList();
    }

    private String resolveNickname(String requestedNickname, String email) {
        if (requestedNickname != null && !requestedNickname.isBlank()) {
            return requestedNickname.trim();
        }
        int atIndex = email.indexOf('@');
        if (atIndex > 0) {
            return email.substring(0, atIndex);
        }
        return "user_" + UUID.randomUUID().toString().substring(0, 6);
    }

    private String generateUserId() {
        return "u-" + UUID.randomUUID().toString();
    }
}

